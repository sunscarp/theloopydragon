import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { id, allows_cod, free_delivery, bank_account_name, bank_account_number, bank_ifsc, upi_id, terms_accepted, slug, logo_url, banner_url, allow_refunds, allow_returns, origin_pincode, free_delivery_threshold } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (allows_cod !== undefined) updates.allows_cod = allows_cod;
    if (free_delivery !== undefined) updates.free_delivery = free_delivery;
    if (bank_account_name !== undefined) updates.bank_account_name = bank_account_name;
    if (bank_account_number !== undefined) updates.bank_account_number = bank_account_number;
    if (bank_ifsc !== undefined) updates.bank_ifsc = bank_ifsc;
    if (upi_id !== undefined) updates.upi_id = upi_id;
    if (terms_accepted !== undefined) updates.terms_accepted = terms_accepted;
    if (slug !== undefined) updates.slug = slug;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (banner_url !== undefined) updates.banner_url = banner_url;
    if (allow_refunds !== undefined) updates.allow_refunds = allow_refunds;
    if (allow_returns !== undefined) updates.allow_returns = allow_returns;
    if (origin_pincode !== undefined) updates.origin_pincode = origin_pincode;
    if (free_delivery_threshold !== undefined) updates.free_delivery_threshold = free_delivery_threshold;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase.from("sellers").update(updates).eq("id", id);

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
