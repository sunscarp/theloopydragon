import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { id, seller_id } = await req.json();

    if (!id || !seller_id) {
      return NextResponse.json({ error: "Product ID and seller ID are required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("Inventory")
      .update({ status: "deactivated" })
      .eq("id", id)
      .eq("seller_id", seller_id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
