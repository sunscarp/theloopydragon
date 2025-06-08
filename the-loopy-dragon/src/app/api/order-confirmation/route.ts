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
        (item: any) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${item.Product}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.Quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">₹${
          item.Price || (Number(item["Total Price"]) / Number(item.Quantity)).toFixed(2)
        }</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${Number(item["Total Price"]).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const shippingCost = orders[0]?.["Shipping Cost"] || 0;
    const subtotal = orders.reduce((sum: number, item: any) => sum + Number(item["Total Price"]), 0);
    const grandTotal = subtotal + Number(shippingCost);

    const html = `
      <h2>Order Confirmation - The Loopy Dragon</h2>
      <p>Thank you for your order! Here are your order details:</p>
      <b>Order ID:</b> ${order_id}<br/>
      <b>Name:</b> ${Name}<br/>
      <b>Address:</b> ${Address}, ${Pincode}<br/>
      <b>Contact (WhatsApp):</b> ${Contact}<br/>
      <b>Email:</b> ${Email}<br/>
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