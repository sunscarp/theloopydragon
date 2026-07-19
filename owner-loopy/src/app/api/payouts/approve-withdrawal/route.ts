import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { request_id, upi_transaction_id } = await req.json();

    if (!request_id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const ref = upi_transaction_id || `manual_${Date.now()}`;

    const { data: request, error: fetchError } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (fetchError || !request) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "paid",
        upi_transaction_id: ref,
        paid_at: new Date().toISOString(),
      })
      .eq("id", request_id);

    if (updateError) {
      console.error("Failed to approve withdrawal:", updateError);
      return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
    }

    // Send payout notification email to seller
    const { data: seller } = await supabase
      .from("sellers")
      .select("email, shop_name")
      .eq("id", request.seller_id)
      .single();

    if (seller?.email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: seller.email,
          subject: "Payout Sent - The Loopy Dragon",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #22223B;">Payout Confirmed 🎉</h2>
              <p>Hi <strong>${seller.shop_name || "Seller"}</strong>,</p>
              <p>Your withdrawal request has been approved and the payout has been sent.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                  <td style="padding: 8px 12px; background: #f5f5f5; color: #666; font-size: 13px;">Amount</td>
                  <td style="padding: 8px 12px; font-weight: bold; font-size: 15px;">₹${request.amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; background: #f5f5f5; color: #666; font-size: 13px;">UPI Ref</td>
                  <td style="padding: 8px 12px; font-size: 14px;">${ref}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; background: #f5f5f5; color: #666; font-size: 13px;">Date</td>
                  <td style="padding: 8px 12px; font-size: 14px;">${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</td>
                </tr>
              </table>
              <p style="color: #666; font-size: 13px;">You can view your complete payout history in your seller dashboard under Transactions.</p>
              <p style="color: #666; font-size: 13px;">Thank you for selling with The Loopy Dragon!</p>
            </div>
          `,
        });
        console.log(`Payout email sent to ${seller.email}`);
      } catch (emailErr) {
        console.error("Failed to send payout email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      amount: request.amount,
      status: "paid",
      upi_transaction_id: ref,
    });
  } catch (err: any) {
    console.error("Approve withdrawal error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
