import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { request_id, upi_transaction_id } = await req.json();

    if (!request_id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const ref = upi_transaction_id || `manual_${Date.now()}`;

    const { data: request, error: fetchError } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (fetchError || !request) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "paid",
        upi_transaction_id: ref,
        paid_at: new Date().toISOString(),
      })
      .eq("id", request_id);

    if (updateError) {
      console.error("Failed to approve withdrawal:", updateError);
      return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      amount: request.amount,
      status: "paid",
      upi_transaction_id: ref,
    });
  } catch (err: any) {
    console.error("Approve withdrawal error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
