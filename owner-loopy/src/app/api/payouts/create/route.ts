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
    const { seller_id, reference } = await req.json();
    if (!seller_id) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", seller_id)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    if (!seller.upi_id) {
      return NextResponse.json({ error: "Seller has no UPI details set" }, { status: 400 });
    }

    const { data: orders } = await supabase
      .from("Orders")
      .select("id, order_id, seller_payout")
      .eq("seller_id", seller_id)
      .is("payout_status", null);

    // Exclude rejected orders from payout calculation
    const allOrderIds = [...new Set((orders || []).map((o: any) => o.order_id))];
    const rejectedOrderIds = new Set<string>();
    if (allOrderIds.length > 0) {
      const { data: profileData } = await supabase
        .from("Your Profile")
        .select("order_id, seller_action")
        .in("order_id", allOrderIds);
      (profileData || []).forEach((p: any) => {
        if (p.seller_action === "rejected") rejectedOrderIds.add(p.order_id);
      });
    }
    const activeOrders = (orders || []).filter((o: any) => !rejectedOrderIds.has(o.order_id));

    const totalPayout = activeOrders.reduce((sum: number, o: any) => {
      return sum + (parseFloat(o.seller_payout) || 0);
    }, 0);

    if (totalPayout <= 0) {
      return NextResponse.json({ error: "No pending payout amount" }, { status: 400 });
    }

    const orderIds = activeOrders.map((o: any) => o.id);
    const ref = reference || `manual_${Date.now()}`;

    const { error: updateError } = await supabase
      .from("Orders")
      .update({ payout_status: "paid", payout_razorpay_id: ref })
      .in("id", orderIds);

    if (updateError) {
      console.error("Failed to mark orders as paid:", updateError);
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    // Send payout notification email to seller
    if (seller.email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: seller.email,
          subject: "Payout Sent - The Loopy Dragon",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #22223B;">Payout Confirmed 🎉</h2>
              <p>Hi <strong>${seller.shop_name || "Seller"}</strong>,</p>
              <p>Your payout has been processed and sent.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                  <td style="padding: 8px 12px; background: #f5f5f5; color: #666; font-size: 13px;">Amount</td>
                  <td style="padding: 8px 12px; font-weight: bold; font-size: 15px;">₹${totalPayout.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; background: #f5f5f5; color: #666; font-size: 13px;">Ref</td>
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
      payout_id: ref,
      amount: totalPayout,
      status: "paid",
    });
  } catch (err: any) {
    console.error("Payout error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
