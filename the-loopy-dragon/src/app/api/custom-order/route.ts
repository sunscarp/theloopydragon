import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const TO_EMAIL = process.env.SMTP_USER;
const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = Number(process.env.SMTP_PORT!);
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const details = formData.get("details") as string;
    const quantity = formData.get("quantity") as string;
    const material = formData.get("material") as string;
    
    // Validate required fields
    if (!name || !email || !phone || !details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get image URLs instead of files
    const imageUrls: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const imageUrl = formData.get(`imageUrl${i}`) as string;
      if (imageUrl) imageUrls.push(imageUrl);
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const imageLinksHtml = imageUrls.length > 0 
      ? `<p><b>Reference Images:</b></p><ul>${imageUrls.map((url, i) => `<li><a href="${url}">Image ${i + 1}</a></li>`).join('')}</ul>`
      : '';

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: TO_EMAIL,
      subject: `Custom Order Request from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nDetails: ${details}\nQuantity: ${quantity}\nMaterial: ${material}${imageUrls.length > 0 ? '\nImage URLs: ' + imageUrls.join(', ') : ''}`,
      html: `
        <h2>Custom Order Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Details:</b></p>
        <p>${details.replace(/\n/g, "<br/>")}</p>
        <p><b>Quantity:</b> ${quantity}</p>
        <p><b>Material:</b> ${material}</p>
        ${imageLinksHtml}
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Custom order API error:", error);
    return NextResponse.json(
      { error: "Failed to send custom order", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
