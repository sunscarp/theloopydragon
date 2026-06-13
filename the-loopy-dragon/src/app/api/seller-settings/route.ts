import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  try {
    const { seller_ids } = await req.json();

    if (!seller_ids || !Array.isArray(seller_ids) || seller_ids.length === 0) {
      return NextResponse.json({ settings: {} });
    }

    const { data: sellersData, error } = await supabase
      .from("sellers")
      .select("id, free_delivery, allows_cod, allow_refunds, allow_returns, origin_pincode, free_delivery_threshold")
      .in("id", seller_ids);

    if (error) {
      console.error("Supabase error fetching seller settings:", error);
      return NextResponse.json({ error: "Failed to fetch seller settings" }, { status: 500 });
    }

    // Fetch delivery slabs for all sellers
    const { data: slabsData, error: slabsError } = await supabase
      .from("seller_delivery_slabs")
      .select("*")
      .in("seller_id", seller_ids)
      .order("min_distance_km", { ascending: true });

    if (slabsError) {
      console.error("Supabase error fetching delivery slabs:", slabsError);
    }

    const slabsBySeller: Record<string, { min_distance_km: number; max_distance_km: number; price: number }[]> = {};
    for (const slab of slabsData || []) {
      const key = String(slab.seller_id);
      if (!slabsBySeller[key]) slabsBySeller[key] = [];
      slabsBySeller[key].push({
        min_distance_km: Number(slab.min_distance_km),
        max_distance_km: Number(slab.max_distance_km),
        price: Number(slab.price),
      });
    }

    const settings: Record<string, {
      free_delivery: boolean;
      allows_cod: boolean;
      allow_refunds: boolean;
      allow_returns: boolean;
      origin_pincode: string;
      free_delivery_threshold: number;
      delivery_slabs: { min_distance_km: number; max_distance_km: number; price: number }[];
    }> = {};
    for (const seller of sellersData || []) {
      settings[seller.id] = {
        free_delivery: seller.free_delivery ?? false,
        allows_cod: seller.allows_cod ?? false,
        allow_refunds: seller.allow_refunds ?? false,
        allow_returns: seller.allow_returns ?? false,
        origin_pincode: seller.origin_pincode || '411033',
        free_delivery_threshold: seller.free_delivery_threshold ?? 0,
        delivery_slabs: slabsBySeller[String(seller.id)] || [],
      };
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("Seller settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
