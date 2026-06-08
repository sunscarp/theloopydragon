import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      Product,
      Quantity,
      Price,
      ImageUrl1,
      Weight,
      Length,
      Width,
      Height,
      Tag,
      ImageUrl2,
      ImageUrl3,
      ImageUrl4,
      ImageUrl5,
      Description,
      Material,
    } = body;

    // Get the maximum ID to generate the next one (excluding offer products 999001-999004)
    const { data: maxIdData, error: maxIdError } = await supabase
      .from("Inventory")
      .select("id")
      .lt("id", 999001) // Only get products with ID less than 999001
      .order("id", { ascending: false })
      .limit(1);

    let nextId = 1;
    if (!maxIdError && maxIdData && maxIdData.length > 0) {
      nextId = maxIdData[0].id + 1;
    }

    // Insert into Supabase with the generated ID
    const { data, error } = await supabase
      .from("Inventory")
      .insert([
        {
          id: nextId,
          Product,
          Quantity,
          Price,
          ImageUrl1,
          Weight,
          Length,
          Width,
          Height,
          Tag,
          ImageUrl2,
          ImageUrl3,
          ImageUrl4,
          ImageUrl5,
          Description,
          Material,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding product:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in add-product API:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
