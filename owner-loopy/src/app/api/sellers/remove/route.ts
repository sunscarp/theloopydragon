import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const { error: sellerError } = await supabase
      .from("sellers")
      .update({ status: "removed" })
      .eq("id", id);

    if (sellerError) {
      console.error("Supabase update error:", sellerError);
      return NextResponse.json({ error: "Failed to remove seller" }, { status: 500 });
    }

    const { error: productError } = await supabase
      .from("Inventory")
      .update({ status: "deactivated" })
      .eq("seller_id", id)
      .in("status", ["active", null]);

    if (productError) {
      console.error("Failed to deactivate seller products:", productError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Remove seller error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
