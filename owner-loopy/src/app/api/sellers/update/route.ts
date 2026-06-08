import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { id, commission_rate, status, email, password } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (commission_rate !== undefined) {
      updates.commission_rate = parseFloat(commission_rate);
    }
    if (status !== undefined) {
      updates.status = status;
    }
    if (email !== undefined) {
      updates.email = email;
    }
    if (password !== undefined) {
      updates.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase
      .from("sellers")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "Failed to update seller" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update seller error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
