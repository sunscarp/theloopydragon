import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET!;

async function razorpayFetch(path: string, body: any) {
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_SECRET}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.description || `Razorpay API error: ${res.status}`);
  return data;
}

export async function POST(req: Request) {
  try {
    const { seller_id } = await req.json();
    if (!seller_id) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const { data: seller, error: sellerError } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", seller_id)
      .single();

    if (sellerError || !seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    if (!seller.upi_id) {
      return NextResponse.json({ error: "Seller has no UPI details set" }, { status: 400 });
    }

    const { data: orders } = await supabase
      .from("Orders")
      .select("id, \"Total Price\", \"Shipping Cost\", commission_earned")
      .eq("seller_id", seller_id)
      .is("payout_status", null);

    const totalPayout = (orders || []).reduce((sum: number, o: any) => {
      const total = parseFloat(o["Total Price"]) || 0;
      const shipping = parseFloat(o["Shipping Cost"]) || 0;
      const commission = parseFloat(o.commission_earned) || 0;
      return sum + (total - total * 0.02 - commission + shipping);
    }, 0);

    if (totalPayout <= 0) {
      return NextResponse.json({ error: "No pending payout amount" }, { status: 400 });
    }

    const amountPaise = Math.round(totalPayout * 100);
    if (amountPaise < 100) {
      return NextResponse.json({ error: "Minimum payout is ₹1.00" }, { status: 400 });
    }

    let contactId = seller.razorpay_contact_id;
    if (!contactId) {
      try {
        const contact = await razorpayFetch("/contacts", {
          name: seller.shop_name || seller.bank_account_name || seller.email,
          email: seller.email,
          type: "vendor",
        });
        contactId = contact.id;
        await supabase.from("sellers").update({ razorpay_contact_id: contactId }).eq("id", seller_id);
      } catch (err: any) {
        return NextResponse.json({ error: `Failed to create Razorpay contact: ${err.message}` }, { status: 500 });
      }
    }

    let fundAccountId = seller.razorpay_fund_account_id;
    if (!fundAccountId) {
      try {
        let fundAccountBody: any;
        if (seller.upi_id) {
          fundAccountBody = {
            contact_id: contactId,
            account_type: "vpa",
            vpa: { address: seller.upi_id },
          };
        } else {
          fundAccountBody = {
            contact_id: contactId,
            account_type: "bank_account",
            bank_account: {
              name: seller.bank_account_name,
              ifsc: seller.bank_ifsc,
              account_number: seller.bank_account_number,
            },
          };
        }
        const fundAccount = await razorpayFetch("/fund_accounts", fundAccountBody);
        fundAccountId = fundAccount.id;
        await supabase.from("sellers").update({ razorpay_fund_account_id: fundAccountId }).eq("id", seller_id);
      } catch (err: any) {
        return NextResponse.json({ error: `Failed to create fund account: ${err.message}` }, { status: 500 });
      }
    }

    try {
      const payout = await razorpayFetch("/payouts", {
        fund_account_id: fundAccountId,
        amount: amountPaise,
        currency: "INR",
        mode: seller.upi_id ? "UPI" : "IMPS",
        purpose: "payout",
        queue_if_low_balance: true,
        description: `Payout for ${seller.shop_name} — ${orders?.length} orders`,
      });

      const orderIds = (orders || []).map((o: any) => o.id);
      const { error: updateError } = await supabase
        .from("Orders")
        .update({ payout_status: "paid", payout_razorpay_id: payout.id })
        .in("id", orderIds);

      if (updateError) {
        console.error("Failed to mark orders as paid:", updateError);
      }

      return NextResponse.json({
        success: true,
        payout_id: payout.id,
        amount: totalPayout,
        status: payout.status,
      });
    } catch (err: any) {
      return NextResponse.json({ error: `Payout failed: ${err.message}` }, { status: 500 });
    }
  } catch (err: any) {
    console.error("Payout error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
