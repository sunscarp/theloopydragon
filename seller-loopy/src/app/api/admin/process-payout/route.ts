import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { withdrawal_id, upi_transaction_id } = await req.json();

    if (!withdrawal_id || !upi_transaction_id) {
      return NextResponse.json({ error: "Missing required fields: withdrawal_id, upi_transaction_id" }, { status: 400 });
    }

    const { data: withdrawal, error: fetchError } = await supabase
      .from("withdrawal_requests")
      .select("id, seller_id, amount, status")
      .eq("id", withdrawal_id)
      .single();

    if (fetchError || !withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (withdrawal.status === "paid") {
      return NextResponse.json({ error: "Withdrawal already marked as paid" }, { status: 400 });
    }

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("id, email, store_name")
      .eq("id", withdrawal.seller_id)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        upi_transaction_id,
      })
      .eq("id", withdrawal_id);

    if (updateError) {
      console.error("Failed to update withdrawal:", updateError);
      return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
    }

    try {
      const storeDisplay = seller.store_name || "Your Store";
      await transporter.sendMail({
        from: `"The Loopy Dragon" <${process.env.SMTP_USER}>`,
        to: seller.email,
        subject: `Payout Processed — ₹${withdrawal.amount.toFixed(2)} — The Loopy Dragon`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
            <div style="background: #1a1a2e; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 20px;">🐲 Payout Processed</h1>
            </div>
            <div style="background: #f9f9fb; padding: 32px 24px; border: 1px solid #e2e2e8; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #333; font-size: 15px;">Dear ${storeDisplay},</p>
              <p style="color: #555; font-size: 14px; line-height: 1.6;">
                Your withdrawal request of <strong style="color: #1a1a2e; font-size: 18px;">₹${withdrawal.amount.toFixed(2)}</strong>
                has been processed successfully.
              </p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Amount</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 13px;">₹${withdrawal.amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">UPI Transaction ID</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 13px;">${upi_transaction_id}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #888; font-size: 13px;">Date</td>
                  <td style="padding: 12px 16px; font-size: 13px;">${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</td>
                </tr>
              </table>
              <p style="color: #555; font-size: 14px; line-height: 1.6;">
                The amount has been sent to your registered UPI account. If you have any questions, reply to this email or contact our support team.
              </p>
              <p style="color: #555; font-size: 14px;">Happy creating! 🧶</p>
              <p style="margin-top: 24px; text-align: center; color: #999; font-size: 12px;">— The Loopy Dragon Team</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send payout email:", emailError);
    }

    return NextResponse.json({ success: true, message: "Payout processed and seller notified" });
  } catch (err) {
    console.error("Process payout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
