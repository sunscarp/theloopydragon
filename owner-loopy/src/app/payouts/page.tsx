"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { DollarSign, Loader2, CheckCircle, RefreshCw, ExternalLink, AlertCircle, ArrowUpRight, XCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function PayoutsPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingOut, setPayingOut] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<Record<string, { totalRevenue: number; razorpayFees: number; commission: number; shipping: number; dueToSeller: number; paid: number }>>({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: sellersData } = await supabase.from("sellers").select("*").neq("status", "removed");
    setSellers(sellersData || []);

    const { data: orders } = await supabase
      .from("Orders")
      .select("seller_id, \"Total Price\", \"Shipping Cost\", commission_earned, seller_payout, payout_status")
      .not("seller_id", "is", null);

    const payoutMap: Record<string, any> = {};
    (orders || []).forEach((o: any) => {
      if (!o.seller_id) return;
      if (!payoutMap[o.seller_id]) {
        payoutMap[o.seller_id] = { totalRevenue: 0, razorpayFees: 0, commission: 0, shipping: 0, dueToSeller: 0, paid: 0 };
      }
      const total = parseFloat(o["Total Price"]) || 0;
      const shipping = parseFloat(o["Shipping Cost"]) || 0;
      const sp = parseFloat(o.seller_payout) || 0;
      payoutMap[o.seller_id].totalRevenue += total;
      payoutMap[o.seller_id].razorpayFees += total * 0.02;
      payoutMap[o.seller_id].shipping += shipping;
      payoutMap[o.seller_id].commission += parseFloat(o.commission_earned) || 0;
      if (o.payout_status === "paid") {
        payoutMap[o.seller_id].paid += sp;
      }
    });

    Object.keys(payoutMap).forEach(id => {
      payoutMap[id].totalRevenue = Math.round(payoutMap[id].totalRevenue * 100) / 100;
      payoutMap[id].razorpayFees = Math.round(payoutMap[id].razorpayFees * 100) / 100;
      payoutMap[id].shipping = Math.round(payoutMap[id].shipping * 100) / 100;
      payoutMap[id].commission = Math.round(payoutMap[id].commission * 100) / 100;
      payoutMap[id].paid = Math.round(payoutMap[id].paid * 100) / 100;
      payoutMap[id].dueToSeller = Math.round((payoutMap[id].totalRevenue - payoutMap[id].razorpayFees - payoutMap[id].commission + payoutMap[id].shipping - payoutMap[id].paid) * 100) / 100;
    });

    setPayouts(payoutMap);
    setLoading(false);
  };

  const processPayout = async (sellerId: string) => {
    setPayingOut(sellerId);
    try {
      const res = await fetch("/api/payouts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: sellerId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payout of ₹${parseFloat(data.amount).toFixed(2)} initiated! Razorpay ID: ${data.payout_id}`);
        fetchData();
      } else {
        toast.error(data.error || "Payout failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPayingOut(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const sellersWithOrders = sellers.filter(s => payouts[s.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Seller Payouts</h1>
          <p className="text-sm text-slate-500 mt-1">Track commissions and transfer money to sellers via Razorpay</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {sellersWithOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No seller orders yet</p>
          <p className="text-sm text-slate-400 mt-1">Payouts will appear here once sellers start receiving orders</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sellersWithOrders.map(seller => {
            const p = payouts[seller.id];
            const hasBank = !!seller.upi_id;
            const termsAccepted = seller.terms_accepted === true;
            return (
              <div key={seller.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{seller.shop_name}</h3>
                      <p className="text-xs text-slate-500">{seller.email} · Rate set at order time</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${p.dueToSeller > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {p.dueToSeller > 0 ? "Pending" : "Settled"}
                  </span>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500">Total Sales</p>
                    <p className="text-lg font-bold text-slate-800">₹{p.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500">Razorpay (2%)</p>
                    <p className="text-lg font-bold text-rose-600">-₹{p.razorpayFees.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500">Commission</p>
                    <p className="text-lg font-bold text-purple-700">-₹{p.commission.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500">Shipping</p>
                    <p className="text-lg font-bold text-blue-600">+₹{p.shipping.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500">Due</p>
                    <p className="text-lg font-bold text-emerald-700">₹{p.dueToSeller.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500">Already Paid</p>
                    <p className="text-lg font-bold text-slate-600">₹{p.paid.toFixed(2)}</p>
                  </div>
                </div>

                {hasBank ? (
                  <div className="text-xs text-slate-500 mb-3">
                    UPI: {seller.upi_id}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-3">
                    <AlertCircle className="w-3.5 h-3.5" />
                    No UPI details provided by seller yet
                  </div>
                )}

                {/* T&C check */}
                {!termsAccepted && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 mb-3 bg-rose-50 rounded-lg px-3 py-2">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Seller has not accepted the Terms & Conditions. They must accept in their Settings page before payout.
                  </div>
                )}

                {p.dueToSeller > 0 && (
                  <button
                    onClick={() => processPayout(seller.id)}
                    disabled={payingOut === seller.id || !hasBank || !termsAccepted}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {payingOut === seller.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <><ArrowUpRight className="w-4 h-4" /> Pay ₹{p.dueToSeller.toFixed(2)} via Razorpay</>
                    )}
                  </button>
                )}

                {!hasBank && (
                  <p className="text-xs text-slate-400 mt-1">Ask seller to add UPI details in their Settings page</p>
                )}
                {hasBank && !termsAccepted && (
                  <p className="text-xs text-slate-400 mt-1">Ask seller to accept Terms &amp; Conditions in their Settings page</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
