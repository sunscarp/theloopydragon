import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { email, password, shop_name, commission_rate } = await req.json();

    if (!email || !password || !shop_name) {
      return NextResponse.json({ error: "Email, password, and shop name are required" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("sellers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "A seller with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const slug = shop_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shop";

    const rate = commission_rate !== undefined ? parseFloat(commission_rate) : 0;

    const { data, error } = await supabase
      .from("sellers")
      .insert({
        email,
        password_hash: hashedPassword,
        shop_name,
        slug,
        status: "active",
        commission_rate: rate,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to create seller" }, { status: 500 });
    }

    return NextResponse.json({ success: true, seller: data });
  } catch (err) {
    console.error("Create seller error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
