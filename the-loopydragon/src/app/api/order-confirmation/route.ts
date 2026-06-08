import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = Number(process.env.SMTP_PORT!);
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;

function generateOrderSummaryHtml(order: any, orders: any[]) {
  const total = orders.reduce(
    (sum, item) => sum + (Number(item["Total Price"]) || 0),
    0
  );
  return `
    <h2 style="color:#16a34a;">Order Placed Successfully!</h2>
    <div>
      <b>Order ID:</b> ${order.order_id}<br/>
      <b>Name:</b> ${order.Name}<br/>
      <b>Address:</b> ${order.Address}, ${order.Pincode}<br/>
      <b>Contact (WhatsApp):</b> ${order.Contact}<br/>
      <b>Email:</b> ${order.Email}<br/>
    </div>
    <h3 style="margin-top:24px;">Order Details</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;min-width:400px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th align="left">Product</th>
          <th align="center">Quantity</th>
          <th align="center">Unit Price</th>
          <th align="right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${orders
          .map(
            (item) => `
          <tr>
            <td>${item.Product}</td>
            <td align="center">${item.Quantity}</td>
            <td align="center">₹${item.Price || (Number(item["Total Price"]) / Number(item.Quantity)).toFixed(2)}</td>
            <td align="right"><b>₹${Number(item["Total Price"]).toFixed(2)}</b></td>
          </tr>
        `
          )
          .join("")}
        <tr>
          <td colspan="3" align="right" style="font-weight:bold;">Total Paid</td>
          <td align="right" style="font-weight:bold;color:#16a34a;">₹${total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top:24px;color:#16a34a;font-weight:bold;text-align:center;">
      Thank you for shopping with The Loopy Dragon!
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { order, orders, customerEmail } = await req.json();

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const html = generateOrderSummaryHtml(order, orders);

    // Send to shop owner
    let ownerMailSent = false;
    try {
      await transporter.sendMail({
        from: `"The Loopy Dragon Shop" <${SMTP_USER}>`,
        to: "theloopydragon123@gmail.com",
        subject: `New Order Received - #${order.order_id}`,
        html,
      });
      ownerMailSent = true;
    } catch (err) {
      console.error("Failed to send email to owner:", err);
    }

    // Send to customer if email is provided
    let customerMailSent = false;
    if (customerEmail && typeof customerEmail === "string" && customerEmail.includes("@")) {
      try {
        await transporter.sendMail({
          from: `"The Loopy Dragon" <${SMTP_USER}>`,
          to: customerEmail,
          subject: `Your Order Confirmation - #${order.order_id}`,
          html,
        });
        customerMailSent = true;
      } catch (err) {
        console.error("Failed to send email to customer:", customerEmail, err);
      }
    } else {
      console.warn("No valid customer email provided:", customerEmail);
    }

    return NextResponse.json({
      success: ownerMailSent && customerMailSent,
      ownerMailSent,
      customerMailSent,
      message: `Mail sent to owner${ownerMailSent ? "" : " (failed)"} and to customer${customerMailSent ? ` (${customerEmail})` : " (failed)"}`,
    });
  } catch (error) {
    console.error("Order confirmation email error:", error);
    return NextResponse.json(
      { error: "Failed to send order confirmation" },
      { status: 500 }
    );
  }
}
