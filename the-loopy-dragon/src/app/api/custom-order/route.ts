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
    
    const images: File[] = [];
    for (let i = 0; i < 3; i++) {
      const image = formData.get(`image${i}`) as File;
      if (image) images.push(image);
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

    // Convert images to attachments
    const attachments = await Promise.all(
      images.map(async (image, index) => {
        const buffer = Buffer.from(await image.arrayBuffer());
        return {
          filename: `pattern-${index + 1}.${image.type.split("/")[1]}`,
          content: buffer,
        };
      })
    );

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: TO_EMAIL,
      subject: `Custom Order Request from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nDetails: ${details}`,
      html: `
        <h2>Custom Order Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Details:</b></p>
        <p>${details.replace(/\n/g, "<br/>")}</p>
        ${attachments.length ? "<p><b>Attached Pattern Images:</b> " + attachments.length + "</p>" : ""}
      `,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Custom order API error:", error);
    return NextResponse.json(
      { error: "Failed to send custom order" },
      { status: 500 }
    );
  }
}
