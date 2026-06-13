import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("seller_id");

    if (!sellerId) {
      return NextResponse.json({ error: "seller_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("seller_delivery_slabs")
      .select("*")
      .eq("seller_id", sellerId)
      .order("min_distance_km", { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch delivery slabs" }, { status: 500 });
    }

    const slabs = (data || []).map((slab: any) => ({
      ...slab,
      min_distance_km: Number(slab.min_distance_km),
      max_distance_km: Number(slab.max_distance_km),
      price: Number(slab.price),
    }));
    return NextResponse.json({ slabs });
  } catch (err) {
    console.error("Fetch delivery slabs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { seller_id, slabs } = await req.json();

    if (!seller_id) {
      return NextResponse.json({ error: "seller_id is required" }, { status: 400 });
    }

    if (!Array.isArray(slabs)) {
      return NextResponse.json({ error: "slabs must be an array" }, { status: 400 });
    }

    // Delete existing slabs and insert new ones
    const { error: deleteError } = await supabase
      .from("seller_delivery_slabs")
      .delete()
      .eq("seller_id", seller_id);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return NextResponse.json({ error: "Failed to update delivery slabs" }, { status: 500 });
    }

    if (slabs.length === 0) {
      return NextResponse.json({ success: true });
    }

    const { error: insertError } = await supabase
      .from("seller_delivery_slabs")
      .insert(
        slabs.map((s: { min_distance_km: number; max_distance_km: number; price: number }) => ({
          seller_id,
          min_distance_km: Number(s.min_distance_km),
          max_distance_km: Number(s.max_distance_km),
          price: Number(s.price),
        }))
      );

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Failed to save delivery slabs" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save delivery slabs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
