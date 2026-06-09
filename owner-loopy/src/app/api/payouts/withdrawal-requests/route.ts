import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*, sellers(shop_name, email, upi_id)")
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
