import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      Product, Quantity, Price, ImageUrl1, Weight, Length, Width, Height,
      Tag, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5, Description, Material,
      seller_id,
    } = body;

    if (!Product || !Price || !ImageUrl1 || !seller_id) {
      return NextResponse.json({ error: "Product name, price, image, and seller are required" }, { status: 400 });
    }

    const { data: maxIdData } = await supabase
      .from("Inventory")
      .select("id")
      .lt("id", 999001)
      .order("id", { ascending: false })
      .limit(1);

    let nextId = 1;
    if (maxIdData && maxIdData.length > 0) {
      nextId = maxIdData[0].id + 1;
    }

    const { data, error } = await supabase
      .from("Inventory")
      .insert({
        id: nextId,
        Product, Quantity, Price, ImageUrl1, Weight, Length, Width, Height,
        Tag, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5, Description, Material,
        seller_id,
        status: "active",
      })
      .select();

    if (error) {
      console.error("Error adding product:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in add-product API:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
