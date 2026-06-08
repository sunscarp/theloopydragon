import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const { data: seller, error } = await supabase
      .from("sellers")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !seller) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (seller.status !== "active") {
      return NextResponse.json({ error: "Your account has been deactivated. Contact the owner." }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, seller.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const { password_hash, ...safeSeller } = seller;

    return NextResponse.json({ success: true, seller: safeSeller });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
