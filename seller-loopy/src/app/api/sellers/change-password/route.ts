import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { seller_id, current_password, new_password } = await req.json();

    if (!seller_id || !current_password || !new_password) {
      return NextResponse.json({ error: "Seller ID, current password, and new password are required" }, { status: 400 });
    }

    if (new_password.length < 4) {
      return NextResponse.json({ error: "New password must be at least 4 characters" }, { status: 400 });
    }

    const { data: seller, error: fetchError } = await supabase
      .from("sellers")
      .select("id, password_hash")
      .eq("id", seller_id)
      .single();

    if (fetchError || !seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(current_password, seller.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const { error: updateError } = await supabase
      .from("sellers")
      .update({ password_hash: hashedPassword })
      .eq("id", seller_id);

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
