import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const seller_id = url.searchParams.get("seller_id");

    if (!seller_id) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("seller_id", seller_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch withdrawal requests:", error);
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    return NextResponse.json({ success: true, requests: data || [] });
  } catch (err) {
    console.error("Withdrawal fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
