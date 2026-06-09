import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: requests, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch withdrawal requests:", error);
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    const sellerIds = [...new Set((requests || []).map((r: any) => r.seller_id))];

    let sellerMap: Record<number, any> = {};
    if (sellerIds.length > 0) {
      const { data: sellers } = await supabase
        .from("sellers")
        .select("id, shop_name, email, upi_id")
        .in("id", sellerIds);
      if (sellers) {
        sellers.forEach((s: any) => { sellerMap[s.id] = s; });
      }
    }

    const enriched = (requests || []).map((r: any) => ({
      ...r,
      sellers: sellerMap[r.seller_id] || null,
    }));

    return NextResponse.json({ success: true, requests: enriched });
  } catch (err) {
    console.error("Withdrawal fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
