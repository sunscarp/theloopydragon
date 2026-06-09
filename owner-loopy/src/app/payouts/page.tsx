"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { DollarSign, Loader2, CheckCircle, RefreshCw, ExternalLink, AlertCircle, Copy, Check, Clock, Send, Users, Landmark } from "lucide-react";
import toast from "react-hot-toast";

interface WithdrawalRequest {
  id: number;
  seller_id: number;
  amount: number;
  status: string;
  upi_transaction_id: string | null;
  created_at: string;
  paid_at: string | null;
  sellers: { shop_name: string; email: string; upi_id: string } | null;
}

export default function PayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [approveModal, setApproveModal] = useState<WithdrawalRequest | null>(null);
  const [upiRef, setUpiRef] = useState("");
  const [approving, setApproving] = useState(false);

  const [sellerSummaries, setSellerSummaries] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: sellersData } = await supabase.from("sellers").select("*").neq("status", "removed");
    const sellers = sellersData || [];

    const { data: orders } = await supabase
      .from("Orders")
      .select("seller_id, \"Total Price\", \"Shipping Cost\", commission_earned, seller_payout")
      .not("seller_id", "is", null);

    const { data: withdrawalData } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });

    const rawWithdrawals = (withdrawalData || []) as WithdrawalRequest[];

    // Enrich withdrawals with seller data (Supabase joins may not resolve)
    const wSellerIds = [...new Set(rawWithdrawals.map((w: any) => w.seller_id))];
    let wSellerMap: Record<number, any> = {};
    if (wSellerIds.length > 0) {
      const { data: wSellers } = await supabase
        .from("sellers")
        .select("id, shop_name, email, upi_id")
        .in("id", wSellerIds);
      if (wSellers) {
        wSellers.forEach((s: any) => { wSellerMap[s.id] = s; });
      }
    }
    const allWithdrawals = rawWithdrawals.map((w: any) => ({
      ...w,
      sellers: wSellerMap[w.seller_id] || null,
    }));

    const paidWithdrawalPerSeller: Record<number, number> = {};
    const pendingWithdrawalPerSeller: Record<number, number> = {};
    allWithdrawals.forEach((w: any) => {
      if (w.status === "paid") {
        paidWithdrawalPerSeller[w.seller_id] = (paidWithdrawalPerSeller[w.seller_id] || 0) + w.amount;
      } else if (w.status === "pending") {
        pendingWithdrawalPerSeller[w.seller_id] = (pendingWithdrawalPerSeller[w.seller_id] || 0) + w.amount;
      }
    });

    const payoutMap: Record<string, any> = {};
    (orders || []).forEach((o: any) => {
      if (!o.seller_id) return;
      if (!payoutMap[o.seller_id]) {
        payoutMap[o.seller_id] = { totalRevenue: 0, razorpayFees: 0, commission: 0, totalPayouts: 0 };
      }
      const total = parseFloat(o["Total Price"]) || 0;
      const shipping = parseFloat(o["Shipping Cost"]) || 0;
      const commission = parseFloat(o.commission_earned) || 0;
      const calculatedPayout = total - total * 0.02 - commission + shipping;
      payoutMap[o.seller_id].totalRevenue += total + shipping;
      payoutMap[o.seller_id].razorpayFees += total * 0.02;
      payoutMap[o.seller_id].commission += commission;
      payoutMap[o.seller_id].totalPayouts += calculatedPayout;
    });

    const summaries = sellers.map((s: any) => {
      const p = payoutMap[s.id] || { totalRevenue: 0, razorpayFees: 0, commission: 0, totalPayouts: 0 };
      const paid = paidWithdrawalPerSeller[s.id] || 0;
      const pending = pendingWithdrawalPerSeller[s.id] || 0;
      const balance = p.totalPayouts - paid;
      return {
        id: s.id,
        shop_name: s.shop_name,
        email: s.email,
        upi_id: s.upi_id,
        terms_accepted: s.terms_accepted,
        totalRevenue: Math.round(p.totalRevenue * 100) / 100,
        razorpayFees: Math.round(p.razorpayFees * 100) / 100,
        commission: Math.round(p.commission * 100) / 100,
        totalPayouts: Math.round(p.totalPayouts * 100) / 100,
        paidOut: Math.round(paid * 100) / 100,
        pendingWithdrawal: Math.round(pending * 100) / 100,
        balance: Math.round(Math.max(0, balance) * 100) / 100,
      };
    }).filter(s => s.totalPayouts > 0 || s.paidOut > 0);

    setSellerSummaries(summaries);
    setLoading(false);

    setWithdrawals(allWithdrawals);
    setLoadingWithdrawals(false);
  };

  const fetchWithdrawals = async () => {
    setLoadingWithdrawals(true);
    try {
      const res = await fetch("/api/payouts/withdrawal-requests");
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.requests || []);
      }
    } catch {
      // ignore
    }
    setLoadingWithdrawals(false);
  };

  const copyUpiId = async (upiId: string, key: string) => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedId(key);
      toast.success("UPI ID copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleApproveWithdrawal = async () => {
    if (!approveModal) return;
    setApproving(true);
    try {
      const res = await fetch("/api/payouts/approve-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: approveModal.id, upi_transaction_id: upiRef }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`₹${parseFloat(data.amount).toFixed(2)} approved! UPI: ${data.upi_transaction_id}`);
        setApproveModal(null);
        setUpiRef("");
        fetchData();
      } else {
        toast.error(data.error || "Failed to approve");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending");
  const processedWithdrawals = withdrawals.filter(w => w.status !== "pending");

  const totalPaidOut = sellerSummaries.reduce((s, x) => s + x.paidOut, 0);
  const totalBalance = sellerSummaries.reduce((s, x) => s + x.balance, 0);
  const totalPendingWithdrawals = sellerSummaries.reduce((s, x) => s + x.pendingWithdrawal, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payouts &amp; Withdrawals</h1>
          <p className="text-sm text-slate-500 mt-1">Manage seller withdrawal requests and view payouts</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Paid Out</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalPaidOut.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Seller Balance</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">₹{totalBalance.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Pending Withdrawals</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹{totalPendingWithdrawals.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Active Sellers</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{sellerSummaries.length}</p>
        </div>
      </div>

      {/* Withdrawal Requests */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Send className="w-4 h-4 text-slate-400" />
          Withdrawal Requests
          {pendingWithdrawals.length > 0 && (
            <span className="ml-auto text-sm font-normal text-amber-600">₹{pendingWithdrawals.reduce((s, w) => s + w.amount, 0).toFixed(2)} pending</span>
          )}
        </h2>

        {loadingWithdrawals ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : pendingWithdrawals.length === 0 && processedWithdrawals.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
            <Send className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No withdrawal requests yet</p>
            <p className="text-xs text-slate-400 mt-1">Requests from sellers will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Requests */}
            {pendingWithdrawals.length > 0 && (
              <div className="space-y-3">
                {pendingWithdrawals.map(w => (
                  <div key={w.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-800">{w.sellers?.shop_name || "Unknown Seller"}</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-700 rounded-full">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{w.sellers?.email}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Requested {new Date(w.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">₹{w.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-slate-500">Pay to:</span>
                      {w.sellers?.upi_id ? (
                        <>
                          <code className="px-2 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg border border-indigo-100">
                            {w.sellers.upi_id}
                          </code>
                          <button onClick={() => copyUpiId(w.sellers!.upi_id, `w-${w.id}`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                            {copiedId === `w-${w.id}` ? <><Check className="w-3 h-3 text-emerald-600" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                          </button>
                        </>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertCircle className="w-3 h-3" /> No UPI set
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { setApproveModal(w); setUpiRef(""); }}
                      disabled={!w.sellers?.upi_id}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <CheckCircle className="w-4 h-4" /> Mark as Paid
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* History */}
            {processedWithdrawals.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">History ({processedWithdrawals.length})</h3>
                <div className="space-y-2">
                  {processedWithdrawals.map(w => (
                    <div key={w.id}
                      className="flex items-center justify-between bg-white rounded-xl border border-slate-100 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{w.sellers?.shop_name || "Unknown"}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${
                            w.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {w.status === "paid" ? "Paid" : "Rejected"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(w.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                          {w.paid_at && ` · Paid ${new Date(w.paid_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}`}
                        </p>
                        {w.upi_transaction_id && (
                          <p className="text-xs text-slate-500 font-mono mt-0.5">UPI: {w.upi_transaction_id}</p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-slate-800">₹{w.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seller Summary */}
      {sellerSummaries.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Seller Financial Summary
          </h2>
          <div className="grid gap-4">
            {sellerSummaries.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">{s.shop_name}</h3>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${s.balance > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {s.balance > 0 ? `₹${s.balance.toFixed(2)} balance` : "Settled"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">Revenue</p>
                    <p className="text-base font-bold text-slate-800">₹{s.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">Razorpay (2%)</p>
                    <p className="text-base font-bold text-rose-600">-₹{s.razorpayFees.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">Commission</p>
                    <p className="text-base font-bold text-purple-700">-₹{s.commission.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">Balance</p>
                    <p className="text-base font-bold text-emerald-700">₹{s.balance.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">Paid Out</p>
                    <p className="text-base font-bold text-slate-600">₹{s.paidOut.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500">Pending Req.</p>
                    <p className="text-base font-bold text-amber-600">₹{s.pendingWithdrawal.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {s.upi_id && (
                    <>
                      <code className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100">
                        {s.upi_id}
                      </code>
                      <button onClick={() => copyUpiId(s.upi_id, `s-${s.id}`)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        {copiedId === `s-${s.id}` ? <><Check className="w-3 h-3 text-emerald-600" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                      <a href={`upi://pay?pa=${s.upi_id}&pn=${encodeURIComponent(s.shop_name || "Seller")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <ExternalLink className="w-3 h-3" /> Pay via UPI
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approve withdrawal modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Approve Withdrawal</h3>
            <p className="text-sm text-slate-500 mb-4">
              Pay <strong className="text-emerald-700">₹{approveModal.amount.toFixed(2)}</strong> to{" "}
              <strong>{approveModal.sellers?.shop_name || "Seller"}</strong> via UPI at{" "}
              <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">{approveModal.sellers?.upi_id || "N/A"}</code>
            </p>
            <p className="text-xs text-slate-400 mb-3">
              After sending the payment, enter the UPI transaction reference below and confirm.
            </p>
            <input type="text" value={upiRef}
              onChange={e => setUpiRef(e.target.value)}
              placeholder="UPI transaction ID (required)"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            <div className="flex items-center gap-3">
              <button onClick={() => { setApproveModal(null); setUpiRef(""); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleApproveWithdrawal}
                disabled={approving || !upiRef.trim()}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {approving ? (
                  <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Processing...</>
                ) : (
                  "Approve & Mark Paid"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
