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
      Contact,
      Email,
      orders, // array of products
      total,
      dragonOffer, // Add dragon offer info
      dragonDiscount, // Add dragon discount info
    } = body;

    // --- Ensure order_id is unique in Orders table ---
    // You need to use your DB client here. Example with Prisma:
    // import { prisma } from "@/lib/prisma";
    // const existingOrder = await prisma.orders.findUnique({ where: { order_id } });

    // Placeholder for DB check (replace with your actual DB logic)
    // Example using a generic db client:
    // const existingOrder = await db.orders.findFirst({ where: { order_id } });

    // If using Prisma, uncomment and adjust:
    // const existingOrder = await prisma.orders.findUnique({ where: { order_id } });

    // If using another ORM or raw SQL, replace accordingly.
    // For demonstration, we'll throw an error to indicate where to add your DB logic:
    // Remove the following line and add your DB check.
    // throw new Error("Add DB check for unique order_id here.");

    // --- BEGIN: Add your DB check here ---
    // Example (pseudo-code):
    // const existingOrder = await db.orders.findFirst({ where: { order_id } });
    // if (existingOrder) {
    //   return NextResponse.json(
    //     { success: false, error: "Duplicate order_id" },
    //     { status: 400 }
    //   );
    // }
    // --- END: Add your DB check here ---

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

    // Compose order details as HTML
    const orderRows = orders
      .map(
        (item: any) => {
          const addonUnitPrice =
            (item.keyChain ? 10 : 0) +
            (item.giftWrap ? 10 : 0) +
            (item.carMirror ? 50 : 0);
          const unitPrice = (Number(item.Price) || 0) + addonUnitPrice;
          const subtotal = item.isSpecialOffer ? 0 : (unitPrice * Number(item.Quantity));
          const isFreeFromBuyXGetY = item.isFreeFromBuyXGetY || false;
          
          return `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">
          <div>
            ${item.Product}
            ${item.isSpecialOffer ? '<span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:12px;font-size:10px;margin-left:8px;">FREE (Fire Offer)</span>' : ''}
            ${isFreeFromBuyXGetY ? '<span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:12px;font-size:10px;margin-left:8px;">FREE (Buy 3 Get 1)</span>' : ''}
          </div>
          <div style="font-size:12px;color:#333;">₹${Number(item.Price).toFixed(2)}</div>
          ${
            addonUnitPrice > 0
              ? `<div style="color:#a259ff;font-size:11px;">+ Addons ₹${addonUnitPrice}</div>`
              : ""
          }
          ${
            item.keyChain || item.giftWrap || item.carMirror || item.customMessage
              ? `<div style='font-size:11px;color:#888;'>
                  ${item.keyChain ? "+ Keychain (+₹10) " : ""}
                  ${item.giftWrap ? "+ Gift Wrap (+₹10) " : ""}
                  ${item.carMirror ? "+ Car mirror accessory (+₹50) " : ""}
                  ${item.customMessage ? `<div><i>Message:</i> ${item.customMessage}</div>` : ""}
                </div>`
              : ""
          }
        </td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.Quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">₹${unitPrice.toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">
          ${(item.isSpecialOffer || isFreeFromBuyXGetY) ? 'FREE' : `₹${subtotal.toFixed(2)}`}
        </td>
      </tr>
    `;
        }
      )
      .join("");

    const shippingCost = orders[0]?.["Shipping Cost"] || 0;
    const subtotal = orders.reduce(
      (sum: number, item: any) => sum + Number(item["Total Price"]),
      0
    );
    const discount = Number(dragonDiscount || 0);
    
    // Calculate the correct final total after discount
    const subtotalAfterDiscount = subtotal - discount;
    const grandTotal = subtotalAfterDiscount + Number(shippingCost);

    const html = `
      <h2>Order Confirmation - The Loopy Dragon</h2>
      <p>Thank you for your order! Here are your order details:</p>
      <b>Order ID:</b> ${order_id}<br/>
      <b>Name:</b> ${Name}<br/>
      <b>Address:</b> ${Address}, ${Pincode}<br/>
      <b>Contact (WhatsApp):</b> ${Contact}<br/>
      <b>Email:</b> ${Email}<br/>
      ${dragonOffer ? `<br/><div style="background:#dcfce7;border:1px solid #16a34a;padding:10px;border-radius:8px;margin:10px 0;">
        <b>Fire Offer Applied:</b> ${dragonOffer}
        ${discount > 0 ? `<br/>Discount Applied: -₹${discount.toFixed(2)}` : ''}
        ${orders.some((item: any) => item.isSpecialOffer) ? `<br/>Includes ${orders.filter((item: any) => item.isSpecialOffer).length} free fire offer item(s)` : ''}
        ${orders.some((item: any) => item.isFreeFromBuyXGetY) ? `<br/>Includes ${orders.filter((item: any) => item.isFreeFromBuyXGetY).length} free item(s) from Buy 3 Get 1 Free offer` : ''}
      </div>` : ''}
      <br/>
      <table style="border-collapse:collapse;width:100%;margin-top:10px;">
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #ddd;">Product</th>
            <th style="padding:8px;border:1px solid #ddd;">Quantity</th>
            <th style="padding:8px;border:1px solid #ddd;">Unit Price</th>
            <th style="padding:8px;border:1px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${orderRows}
          <tr>
            <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">Subtotal</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">₹${subtotal.toFixed(2)}</td>
          </tr>
          ${discount > 0 ? `
          <tr>
            <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right;color:#16a34a;font-weight:bold;">
              Fire Discount
              ${dragonOffer?.includes('Buy 3 Get 1 Free') ? '<br/><small>(Cheapest items made free)</small>' : ''}
            </td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;color:#16a34a;font-weight:bold;">-₹${discount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">Subtotal after discount</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">₹${subtotalAfterDiscount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right;">Shipping</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${Number(shippingCost).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">Total Paid</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">₹${grandTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top:20px;">Thank you for shopping with The Loopy Dragon!</p>
    `;

    // Send the email
    await transporter.sendMail({
      from: `"The Loopy Dragon" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: Email,
      subject: "Your Order Confirmation - The Loopy Dragon",
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