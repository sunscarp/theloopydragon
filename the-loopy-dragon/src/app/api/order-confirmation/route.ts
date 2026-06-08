import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      Name,
      Address,
      Pincode,
      Country,
      City,
      State,
      Contact,
      Email,
      orders, // array of products
      total,
      dragonOffer,
      dragonDiscount,
      christmasDiscount,
    } = body;

    // Configure your SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Compose order details as HTML with correct price calculations
    const orderRows = orders
      .map((item: any) => {
        // Get the actual product price
        const basePrice = Number(item.Price) || 0;
        
        // Calculate addon prices only if they're actually selected
        const addonUnitPrice =
          (item.keyChain === true ? 10 : 0) +
          (item.giftWrap === true ? 10 : 0) +
          (item.carMirror === true ? 50 : 0);
        
        const unitPrice = basePrice + addonUnitPrice;
        const quantity = Number(item.Quantity) || 0;
        
        // For special offers, the subtotal should be 0 (free)
        const subtotal = item.isSpecialOffer ? 0 : (unitPrice * quantity);
        
        // Build addon display text
        const addonTexts = [];
        if (item.keyChain === true) addonTexts.push("Keychain (+₹10)");
        if (item.giftWrap === true) addonTexts.push("Gift Wrap (+₹10)");
        if (item.carMirror === true) addonTexts.push("Car mirror accessory (+₹50)");
        
        return `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">
          <div>
            ${item.Product}
            ${item.isSpecialOffer ? '<span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:12px;font-size:10px;margin-left:8px;">FREE (Fire Offer)</span>' : ''}
            ${item["Custom Order"] ? '<span style="background:#dbeafe;color:#1e40af;padding:2px 6px;border-radius:12px;font-size:10px;margin-left:8px;">Custom Order</span>' : ''}
          </div>
          <div style="font-size:12px;color:#333;">Base Price: ₹${basePrice.toFixed(2)}</div>
          ${
            addonUnitPrice > 0
              ? `<div style="color:#a259ff;font-size:11px;">+ Addons: ₹${addonUnitPrice.toFixed(2)}</div>`
              : ""
          }
          ${
            addonTexts.length > 0 || item.customMessage
              ? `<div style='font-size:11px;color:#888;'>
                  ${addonTexts.join(" + ")}
                  ${item.customMessage ? `<div><i>Message:</i> ${item.customMessage}</div>` : ""}
                </div>`
              : ""
          }
        </td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">₹${unitPrice.toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">
          ${item.isSpecialOffer ? 'FREE' : `₹${subtotal.toFixed(2)}`}
        </td>
      </tr>
    `;
      })
      .join("");

    // Calculate totals correctly
    const shippingCost = orders[0]?.["Shipping Cost"] || 0;
    const subtotal = orders.reduce((sum: number, item: any) => {
      if (item.isSpecialOffer) return sum; // Free items don't add to subtotal
      const basePrice = Number(item.Price) || 0;
      const addonUnitPrice =
        (item.keyChain === true ? 10 : 0) +
        (item.giftWrap === true ? 10 : 0) +
        (item.carMirror === true ? 50 : 0);
      const unitPrice = basePrice + addonUnitPrice;
      const quantity = Number(item.Quantity) || 0;
      return sum + (unitPrice * quantity);
    }, 0);
    
    const dragonDiscountAmount = Number(dragonDiscount || 0);
    const christmasDiscountAmount = Number(christmasDiscount || 0);
    const totalDiscount = dragonDiscountAmount + christmasDiscountAmount;
    const subtotalAfterDiscount = Math.max(0, subtotal - totalDiscount);
    const grandTotal = subtotalAfterDiscount + Number(shippingCost);

    const html = `
      <h2>Order Confirmation - The Loopy Dragon</h2>
      <p>Thank you for your order! Here are your order details:</p>
      <b>Order ID:</b> ${order_id}<br/>
      <b>Name:</b> ${Name}<br/>
      <b>Address:</b> ${Address}, ${City}, ${State}, ${Pincode}, ${Country}<br/>
      <b>Contact (WhatsApp):</b> ${Contact}<br/>
      <b>Email:</b> ${Email}<br/>
      ${dragonOffer ? `<br/><div style="background:#dcfce7;border:1px solid #16a34a;padding:10px;border-radius:8px;margin:10px 0;">
        <b>🔥 Fire Offer Applied:</b> ${dragonOffer}
        ${dragonDiscountAmount > 0 ? `<br/>Fire Discount Applied: -₹${dragonDiscountAmount.toFixed(2)}` : ''}
        ${orders.some((item: any) => item.isSpecialOffer) ? `<br/>🎁 Includes ${orders.filter((item: any) => item.isSpecialOffer).length} free fire offer item(s)` : ''}
      </div>` : ''}
      ${christmasDiscountAmount > 0 ? `<br/><div style="background:#fef2f2;border:1px solid #dc2626;padding:10px;border-radius:8px;margin:10px 0;">
        <b>🎄 Christmas Special Applied:</b> 26% OFF on orders above ₹250
        <br/>Christmas Discount: -₹${christmasDiscountAmount.toFixed(2)}
      </div>` : ''}
      <br/>
      <table style="border-collapse:collapse;width:100%;margin-top:10px;">
        <thead>
          <tr style="background-color:#f8f9fa;">
            <th style="padding:12px;border:1px solid #ddd;text-align:left;">Product</th>
            <th style="padding:12px;border:1px solid #ddd;text-align:center;">Quantity</th>
            <th style="padding:12px;border:1px solid #ddd;text-align:center;">Unit Price</th>
            <th style="padding:12px;border:1px solid #ddd;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${orderRows}
          <tr style="background-color:#f8f9fa;">
            <td colspan="3" style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:bold;">Subtotal</td>
            <td style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:bold;">₹${subtotal.toFixed(2)}</td>
          </tr>
          ${dragonDiscountAmount > 0 ? `
          <tr style="background-color:#dcfce7;">
            <td colspan="3" style="padding:12px;border:1px solid #ddd;text-align:right;color:#16a34a;font-weight:bold;">
              🔥 Fire Discount
              ${dragonOffer?.includes('Buy 3 Get 1 Free') ? '<br/><small>(Cheapest items made free)</small>' : ''}
            </td>
            <td style="padding:12px;border:1px solid #ddd;text-align:right;color:#16a34a;font-weight:bold;">-₹${dragonDiscountAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${christmasDiscountAmount > 0 ? `
          <tr style="background-color:#fef2f2;">
            <td colspan="3" style="padding:12px;border:1px solid #ddd;text-align:right;color:#dc2626;font-weight:bold;">
              🎄 Christmas Special (26% OFF)
            </td>
            <td style="padding:12px;border:1px solid #ddd;text-align:right;color:#dc2626;font-weight:bold;">-₹${christmasDiscountAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${totalDiscount > 0 ? `
          <tr style="background-color:#f8f9fa;">
            <td colspan="3" style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:bold;">Subtotal after discount</td>
            <td style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:bold;">₹${subtotalAfterDiscount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td colspan="3" style="padding:12px;border:1px solid #ddd;text-align:right;">Shipping</td>
            <td style="padding:12px;border:1px solid #ddd;text-align:right;">
              ${Number(shippingCost) === 0 ? 'FREE' : `₹${Number(shippingCost).toFixed(2)}`}
            </td>
          </tr>
          <tr style="background-color:#e3f2fd;">
            <td colspan="3" style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:bold;font-size:16px;">Total Paid</td>
            <td style="padding:12px;border:1px solid #ddd;text-align:right;font-weight:bold;font-size:16px;color:#1976d2;">₹${grandTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:20px;padding:15px;background-color:#f0f9ff;border-radius:8px;">
        <p style="margin:0;color:#0369a1;font-weight:500;">📦 Your order is being processed and will be shipped soon!</p>
        <p style="margin:5px 0 0 0;color:#0369a1;font-size:14px;">
          Tracking information will be available in 
          <a href="http://theloopydragon.in/profile" style="color:#8B5CF6;text-decoration:underline;font-weight:600;" target="_blank" rel="noopener noreferrer">Your Orders</a>
          once your order has shipped.
        </p>
      </div>
      <p style="margin-top:20px;text-align:center;color:#666;">Thank you for shopping with The Loopy Dragon! 🐲</p>
    `;

    // Send the email
    await transporter.sendMail({
      from: `"The Loopy Dragon" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: Email,
      subject: `Order Confirmation #${order_id} - The Loopy Dragon`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order confirmation email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}