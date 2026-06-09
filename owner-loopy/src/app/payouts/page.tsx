"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { DollarSign, Loader2, CheckCircle, RefreshCw, ExternalLink, AlertCircle, XCircle, Copy, Check, Clock, Send } from "lucide-react";
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
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingOut, setPayingOut] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<Record<string, { totalRevenue: number; razorpayFees: number; commission: number; dueToSeller: number; paid: number }>>({});
  const [confirmModal, setConfirmModal] = useState<{ seller: any; amount: number } | null>(null);
  const [txnRef, setTxnRef] = useState("");

  // Withdrawal requests
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [approveModal, setApproveModal] = useState<WithdrawalRequest | null>(null);
  const [upiRef, setUpiRef] = useState("");
  const [approving, setApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<"withdrawals" | "sellers">("withdrawals");

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
        payoutMap[o.seller_id] = { totalRevenue: 0, razorpayFees: 0, commission: 0, dueToSeller: 0, paid: 0 };
      }
      const total = parseFloat(o["Total Price"]) || 0;
      const shipping = parseFloat(o["Shipping Cost"]) || 0;
      const commission = parseFloat(o.commission_earned) || 0;
      const calculatedPayout = total - total * 0.02 - commission + shipping;
      payoutMap[o.seller_id].totalRevenue += total + shipping;
      payoutMap[o.seller_id].razorpayFees += total * 0.02;
      payoutMap[o.seller_id].commission += commission;
      if (o.payout_status === "paid") {
        payoutMap[o.seller_id].paid += calculatedPayout;
      } else {
        payoutMap[o.seller_id].dueToSeller += calculatedPayout;
      }
    });

    Object.keys(payoutMap).forEach(id => {
      payoutMap[id].totalRevenue = Math.round(payoutMap[id].totalRevenue * 100) / 100;
      payoutMap[id].razorpayFees = Math.round(payoutMap[id].razorpayFees * 100) / 100;
      payoutMap[id].commission = Math.round(payoutMap[id].commission * 100) / 100;
      payoutMap[id].paid = Math.round(payoutMap[id].paid * 100) / 100;
      payoutMap[id].dueToSeller = Math.round(payoutMap[id].dueToSeller * 100) / 100;
    });

    setPayouts(payoutMap);
    setLoading(false);

    // Fetch withdrawal requests
    fetchWithdrawals();
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

  const copyUpiId = async (upiId: string, sellerId: string) => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopiedId(sellerId);
      toast.success("UPI ID copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const processPayout = async (sellerId: string, reference: string) => {
    setPayingOut(sellerId);
    try {
      const res = await fetch("/api/payouts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: sellerId, reference }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`₹${parseFloat(data.amount).toFixed(2)} marked as paid!`);
        setConfirmModal(null);
        setTxnRef("");
        fetchData();
      } else {
        toast.error(data.error || "Failed to mark as paid");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPayingOut(null);
    }
  };

  const openPayModal = (seller: any, amount: number) => {
    setTxnRef("");
    setConfirmModal({ seller, amount });
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
        fetchWithdrawals();
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
  const sellersWithOrders = sellers.filter(s => payouts[s.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payouts &amp; Withdrawals</h1>
          <p className="text-sm text-slate-500 mt-1">Manage seller payouts and withdrawal requests</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
        <button onClick={() => setActiveTab("withdrawals")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "withdrawals"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}>
          <Send className="w-4 h-4" />
          Withdrawal Requests
          {pendingWithdrawals.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-white text-purple-600 rounded-full">
              {pendingWithdrawals.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab("sellers")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "sellers"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}>
          <DollarSign className="w-4 h-4" />
          Seller Payouts
        </button>
      </div>

      {/* Withdrawal Requests Tab */}
      {activeTab === "withdrawals" && (
        <div>
          {/* Pending Requests */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-800 mb-3">
              Pending Requests
              {pendingWithdrawals.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-400">({pendingWithdrawals.length})</span>
              )}
            </h2>
            {loadingWithdrawals ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : pendingWithdrawals.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                <Send className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No pending withdrawal requests</p>
                <p className="text-xs text-slate-400 mt-1">Requests from sellers will appear here</p>
              </div>
            ) : (
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
                          {w.sellers?.upi_id && (() => {
                            const seller = w.sellers as { shop_name: string; email: string; upi_id: string };
                            return (
                              <button onClick={() => copyUpiId(seller.upi_id, w.id.toString())}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                                {copiedId === w.id.toString() ? <><Check className="w-3 h-3 text-emerald-600" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                              </button>
                            );
                          })()}
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
          </div>

          {/* Processed History */}
          {processedWithdrawals.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-3">History</h2>
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

      {/* Seller Payouts Tab */}
      {activeTab === "sellers" && (
        <>
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

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-500">Total Revenue</p>
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
                        <p className="text-xs text-slate-500">Due</p>
                        <p className="text-lg font-bold text-emerald-700">₹{p.dueToSeller.toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-500">Already Paid</p>
                        <p className="text-lg font-bold text-slate-600">₹{p.paid.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-slate-500">Pay to:</span>
                      {hasBank ? (
                        <>
                          <code className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg border border-indigo-100">
                            {seller.upi_id}
                          </code>
                          <button
                            onClick={() => copyUpiId(seller.upi_id, seller.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            {copiedId === seller.id ? (
                              <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> Copy UPI</>
                            )}
                          </button>
                          <a
                            href={`upi://pay?pa=${seller.upi_id}&pn=${encodeURIComponent(seller.shop_name || "Seller")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Pay via UPI app
                          </a>
                        </>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-amber-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          No UPI details provided by seller yet
                        </span>
                      )}
                    </div>

                    {!termsAccepted && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 mb-3 bg-rose-50 rounded-lg px-3 py-2">
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Seller has not accepted the Terms & Conditions. They must accept in their Settings page before payout.
                      </div>
                    )}

                    {p.dueToSeller > 0 && (
                      <button
                        onClick={() => openPayModal(seller, p.dueToSeller)}
                        disabled={payingOut === seller.id || !hasBank || !termsAccepted}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {payingOut === seller.id ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          <><CheckCircle className="w-4 h-4" /> Mark ₹{p.dueToSeller.toFixed(2)} as Paid</>
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
        </>
      )}

      {/* Confirm seller payout modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Payment</h3>
            <p className="text-sm text-slate-500 mb-4">
              Send <strong className="text-emerald-700">₹{confirmModal.amount.toFixed(2)}</strong> to{" "}
              <strong>{confirmModal.seller.shop_name}</strong> via UPI at{" "}
              <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">{confirmModal.seller.upi_id}</code>
            </p>
            <p className="text-xs text-slate-400 mb-3">
              After transferring, enter the UPI transaction reference below and confirm.
            </p>
            <input type="text" value={txnRef}
              onChange={e => setTxnRef(e.target.value)}
              placeholder="UPI transaction ref (optional)"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            <div className="flex items-center gap-3">
              <button onClick={() => { setConfirmModal(null); setTxnRef(""); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={() => processPayout(confirmModal.seller.id, txnRef)}
                disabled={payingOut === confirmModal.seller.id}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {payingOut === confirmModal.seller.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Processing...</>
                ) : (
                  "Confirm & Mark Paid"
                )}
              </button>
            </div>
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
              Enter the UPI transaction reference after sending the payment.
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
