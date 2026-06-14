import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { seller_id, inventory_mode } = await req.json();

    if (!seller_id || !inventory_mode) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const qty = inventory_mode === "stock" ? 0 : 9999999;

    const { error } = await supabase
      .from("Inventory")
      .update({ Quantity: qty })
      .eq("seller_id", seller_id);

    if (error) {
      console.error("Failed to update inventory quantities:", error);
      return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update inventory mode error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
