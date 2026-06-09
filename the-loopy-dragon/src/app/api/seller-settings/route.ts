import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  try {
    const { seller_ids } = await req.json();

    if (!seller_ids || !Array.isArray(seller_ids) || seller_ids.length === 0) {
      return NextResponse.json({ settings: {} });
    }

    const { data, error } = await supabase
      .from("sellers")
      .select("id, free_delivery, allows_cod, allow_refunds, allow_returns, origin_pincode, free_delivery_threshold")
      .in("id", seller_ids);

    if (error) {
      console.error("Supabase error fetching seller settings:", error);
      return NextResponse.json({ error: "Failed to fetch seller settings" }, { status: 500 });
    }

    const settings: Record<string, { free_delivery: boolean; allows_cod: boolean; allow_refunds: boolean; allow_returns: boolean; origin_pincode: string; free_delivery_threshold: number }> = {};
    for (const seller of data || []) {
      settings[seller.id] = {
        free_delivery: seller.free_delivery ?? false,
        allows_cod: seller.allows_cod ?? false,
        allow_refunds: seller.allow_refunds ?? false,
        allow_returns: seller.allow_returns ?? false,
        origin_pincode: seller.origin_pincode || '411033',
        free_delivery_threshold: seller.free_delivery_threshold ?? 0,
      };
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("Seller settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
