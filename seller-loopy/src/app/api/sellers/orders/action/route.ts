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
    const { order_id, action, seller_id, seller_email } = await req.json();

    if (!order_id || !action || !seller_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ error: "Action must be 'accept' or 'reject'" }, { status: 400 });
    }

    if (action === "accept") {
      const { error } = await supabase
        .from("Your Profile")
        .update({
          seller_action: "accepted",
          seller_action_at: new Date().toISOString(),
          Status: "accepted",
          payment_approval_status: "in_clearing",
        })
        .eq("order_id", order_id);

      if (error) {
        console.error("Accept error:", error);
        return NextResponse.json({ error: "Failed to accept order" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Order accepted" });
    }

    if (action === "reject") {
      const { data: orderData, error: fetchError } = await supabase
        .from("Orders")
        .select("Email, Name, order_id, \"Total Price\", \"Shipping Cost\"")
        .eq("order_id", order_id);

      if (fetchError || !orderData || orderData.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const customerEmail = orderData[0].Email;
      const customerName = orderData[0].Name;

      const orderTotal = orderData.reduce((sum: number, o: any) => {
        return sum + (parseFloat(o["Total Price"]) || 0);
      }, 0);
      const penaltyAmount = Math.round(orderTotal * 0.05 * 100) / 100;

      const { error: updateError } = await supabase
        .from("Your Profile")
        .update({
          seller_action: "rejected",
          seller_action_at: new Date().toISOString(),
          Status: "Rejected",
          payment_approval_status: "approval_needed",
        })
        .eq("order_id", order_id);

      if (updateError) {
        console.error("Reject update error:", updateError);
        return NextResponse.json({ error: "Failed to reject order" }, { status: 500 });
      }

      const { data: sellerData } = await supabase
        .from("sellers")
        .select("penalty_amount")
        .eq("id", seller_id)
        .single();
      const currentPenalty = parseFloat(sellerData?.penalty_amount || "0");
      await supabase
        .from("sellers")
        .update({
          penalty_amount: currentPenalty + penaltyAmount,
          penalty_pending: true,
        })
        .eq("id", seller_id);

      await supabase
        .from("penalty_ledger")
        .insert({
          seller_id: seller_id,
          order_id: order_id,
          amount: -penaltyAmount,
          reason: `Penalty – Rejected Order #${order_id}`,
          created_at: new Date().toISOString(),
        });

      try {
        await transporter.sendMail({
          from: `"The Loopy Dragon" <${process.env.SMTP_USER}>`,
          to: customerEmail,
          subject: `Your Order #${order_id} Has Been Cancelled - The Loopy Dragon`,
          html: `
            <h2>Order Cancellation - The Loopy Dragon</h2>
            <p>Dear ${customerName},</p>
            <p>We regret to inform you that your order <b>#${order_id}</b> has been cancelled.</p>
            <p>Your order has been cancelled. We regret to inform you that due to unforeseen circumstances, we are unable to fulfill your order at this time. A refund will be initiated and should appear within 2 business days.</p>
            <p>We sincerely apologise for the inconvenience caused.</p>
            <p><b>What happens next?</b></p>
            <ul>
              <li>Your full refund will be processed within <b>2 business days</b>.</li>
              <li>The refund will be credited back to your original payment method.</li>
              <li>You will receive a confirmation email once the refund is initiated.</li>
            </ul>
            <p>If you have any questions, please contact our support team.</p>
            <p>Thank you for your understanding.</p>
            <p style="margin-top:20px;text-align:center;color:#666;">— The Loopy Dragon Team 🐲</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }

      return NextResponse.json({
        success: true,
        message: "Order rejected and customer notified",
        penaltyAmount,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Order action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
