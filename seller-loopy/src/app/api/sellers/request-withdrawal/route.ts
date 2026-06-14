import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { seller_id, amount } = await req.json();

    if (!seller_id || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("terms_accepted")
      .eq("id", seller_id)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    if (!seller.terms_accepted) {
      return NextResponse.json({ error: "You must accept the Seller Terms & Conditions before requesting a withdrawal." }, { status: 403 });
    }

    const { error } = await supabase.from("withdrawal_requests").insert({
      seller_id,
      amount: Math.round(amount * 100) / 100,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to create withdrawal request:", error);
      return NextResponse.json({ error: "Failed to create withdrawal request" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Withdrawal request error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
