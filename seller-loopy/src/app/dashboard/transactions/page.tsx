"use client";
import { useEffect, useState, useMemo, Fragment } from "react";
import { supabase } from "@/utils/supabase";
import { Wallet, Loader2, Clock, CheckCircle,
  ChevronDown, ChevronUp, Landmark, Send, Copy, Check,
  Info, Receipt, History, XCircle, Banknote,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTutorial, TutorialHelpButton } from "@/components/tutorial/TutorialProvider";
import { DEMO_ORDER_ID } from "@/lib/tutorials";

interface Transaction {
  id: number;
  order_id: string;
  Product: string;
  Quantity: number;
  "Total Price": string;
  "Shipping Cost": string;
  "Order Date": string;
  commission_earned: string;
  seller_payout: string;
  payout_status: string | null;
  Status?: string;
  Name: string;
  seller_action?: string | null;
}

interface WithdrawalRequest {
  id: number;
  seller_id: number;
  amount: number;
  status: "pending" | "paid" | "rejected";
  upi_transaction_id: string | null;
  created_at: string;
  paid_at: string | null;
}

interface PenaltyEntry {
  id: number;
  seller_id: string;
  order_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function getBusinessDaysSince(date: Date): number {
  let count = 0;
  let current = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  while (current < today) {
    current.setDate(current.getDate() + 1);
    if (isBusinessDay(current)) count++;
  }
  return count;
}

export default function TransactionsPage() {
  const tutorial = useTutorial();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [sortField, setSortField] = useState<"date" | "amount" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [expanded, setExpanded] = useState<number | null>(null);

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [penalties, setPenalties] = useState<PenaltyEntry[]>([]);
  const [requestAmount, setRequestAmount] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [demoTxCleared, setDemoTxCleared] = useState(false);

  useEffect(() => {
    if (tutorial.isOnboarding && tutorial.currentStep?.id === "transactions-cleared") {
      setDemoTxCleared(true);
    }
  }, [tutorial.isOnboarding, tutorial.currentStep?.id]);

  useEffect(() => {
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) { window.location.href = "/"; return; }
    const s = JSON.parse(stored);
    setSeller(s);
    fetchTransactions(s.id);
    fetchWithdrawals(s.id);
    fetchPenalties(s.id);
  }, []);

  const fetchTransactions = async (sellerId: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Orders")
      .select("*")
      .eq("seller_id", sellerId)
      .order("id", { ascending: false });

    if (!error && data) {
      const orderIds = [...new Set(data.map(o => o.order_id))];
      const { data: profileData } = await supabase
        .from("Your Profile")
        .select("order_id, seller_action")
        .in("order_id", orderIds);
      const profileMap = new Map<string, string | null>();
      profileData?.forEach(p => profileMap.set(p.order_id, p.seller_action));
      setTransactions(data.map(o => ({
        ...o,
        seller_action: profileMap.get(o.order_id) ?? null,
      })) as Transaction[]);
    }
    setLoading(false);
  };

  const fetchWithdrawals = async (sellerId: number) => {
    setLoadingWithdrawals(true);
    try {
      const res = await fetch(`/api/sellers/withdrawal-requests?seller_id=${sellerId}`);
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.requests || []);
      }
    } catch {
      // ignore
    }
    setLoadingWithdrawals(false);
  };

  const fetchPenalties = async (sellerId: number) => {
    const { data } = await supabase
      .from("penalty_ledger")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    setPenalties(data || []);
  };

  const handleRequestWithdrawal = async () => {
    const amount = parseFloat(requestAmount);
    if (!amount || amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (amount > balanceData.available && !tutorial.isOnboarding) { toast.error("Amount exceeds available balance"); return; }
    if (tutorial.isOnboarding) {
      setRequesting(true);
      await new Promise(r => setTimeout(r, 600));
      toast.success("Tutorial withdrawal submitted (simulated)");
      setRequestAmount("");
      setRequesting(false);
      tutorial.triggerAdvance("transactions-withdraw-form");
      return;
    }
    setRequesting(true);
    try {
      const res = await fetch("/api/sellers/request-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: seller.id, amount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Withdrawal request submitted");
        setRequestAmount("");
        fetchWithdrawals(seller.id);
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setRequesting(false);
  };

  const calcBreakdown = (txn: Transaction) => {
    const itemAmount = parseFloat(txn["Total Price"]) || 0;
    const shipping = parseFloat(txn["Shipping Cost"]) || 0;
    const razorpayFee = itemAmount * 0.02;
    const commission = parseFloat(txn.commission_earned) || 0;
    const payout = itemAmount - razorpayFee - commission + shipping;
    return { itemAmount, shipping, razorpayFee, commission, payout };
  };

  function getPayout(t: Transaction) {
    const total = parseFloat(t["Total Price"]) || 0;
    const shipping = parseFloat(t["Shipping Cost"]) || 0;
    const commission = parseFloat(t.commission_earned) || 0;
    return total - total * 0.02 - commission + shipping;
  }

  const paidWithdrawalSum = useMemo(() =>
    withdrawals.filter(w => w.status === "paid").reduce((sum, w) => sum + w.amount, 0), [withdrawals]);

  const pendingWithdrawalSum = useMemo(() =>
    withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0), [withdrawals]);

  const acceptedTransactions = useMemo(() => {
    const list = [...transactions];
    if (tutorial.isOnboarding && tutorial.demoTransaction) {
      const demoTx = { ...tutorial.demoTransaction as Transaction };
      if (!demoTxCleared) {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        demoTx["Order Date"] = d.toISOString();
      } else {
        const d = new Date();
        d.setDate(d.getDate() - 5);
        demoTx["Order Date"] = d.toISOString();
      }
      list.push(demoTx);
    }
    return list.filter(t => t.seller_action === "accepted");
  }, [transactions, tutorial.isOnboarding, tutorial.demoTransaction, demoTxCleared]);

  const totalPayoutsSum = useMemo(() =>
    acceptedTransactions.reduce((sum, t) => sum + getPayout(t), 0), [acceptedTransactions]);

  const totalPenalties = useMemo(() =>
    penalties.reduce((sum, p) => sum + Math.abs(p.amount), 0), [penalties]);

  const totalBalance = useMemo(() =>
    Math.max(0, totalPayoutsSum - paidWithdrawalSum - totalPenalties), [totalPayoutsSum, paidWithdrawalSum, totalPenalties]);

  const stats = useMemo(() => {
    const accepted = acceptedTransactions;
    const totalItemAmount = accepted.reduce((sum, t) => sum + (parseFloat(t["Total Price"]) || 0), 0);
    const totalRazorpayFees = totalItemAmount * 0.02;
    const totalRevenue = accepted.reduce((sum, t) => sum + (parseFloat(t["Total Price"]) || 0) + (parseFloat(t["Shipping Cost"]) || 0), 0);
    const totalCommission = accepted.reduce((sum, t) => sum + (parseFloat(t.commission_earned) || 0), 0);
    return {
      totalItemAmount, totalRazorpayFees, totalRevenue, totalCommission,
      paidOut: paidWithdrawalSum,
      pending: totalBalance,
      orderCount: accepted.length,
      totalBalance,
      totalPenalties,
    };
  }, [acceptedTransactions, paidWithdrawalSum, totalBalance, totalPenalties]);

  const balanceData = useMemo(() => {
    let rawClearing = 0;
    acceptedTransactions.forEach(t => {
      const orderDate = new Date(t["Order Date"]);
      if (getBusinessDaysSince(orderDate) < 2) {
        rawClearing += getPayout(t);
      }
    });
    const inClearing = Math.min(rawClearing, totalBalance);
    const available = Math.max(0, totalBalance - inClearing - pendingWithdrawalSum);
    return {
      available: Math.round(available * 100) / 100,
      clearing: Math.round(inClearing * 100) / 100,
    };
  }, [acceptedTransactions, totalBalance, pendingWithdrawalSum]);

  const sorted = useMemo(() => {
    let list = [...transactions];
    if (tutorial.isOnboarding && tutorial.demoTransaction) {
      const demoTx = { ...tutorial.demoTransaction as Transaction };
      if (!demoTxCleared) {
        // Show as "In Clearing" - 1 day ago
        const d = new Date();
        d.setDate(d.getDate() - 1);
        demoTx["Order Date"] = d.toISOString();
      } else {
        // Show as "Cleared" - 5 days ago
        const d = new Date();
        d.setDate(d.getDate() - 5);
        demoTx["Order Date"] = d.toISOString();
      }
      list = [demoTx, ...list];
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a["Order Date"]).getTime() - new Date(b["Order Date"]).getTime();
      else if (sortField === "amount") cmp = (parseFloat(a["Total Price"]) || 0) - (parseFloat(b["Total Price"]) || 0);
      else if (sortField === "status") cmp = (a.payout_status || "").localeCompare(b.payout_status || "");
      return sortOrder === "desc" ? -cmp : cmp;
    });
    return list;
  }, [transactions, sortField, sortOrder]);

  const ledgerEntries = useMemo(() => {
    const entries: { date: string; type: "withdrawal" | "penalty"; record: WithdrawalRequest | PenaltyEntry }[] = [];
    withdrawals.forEach(w => entries.push({ date: w.created_at, type: "withdrawal" as const, record: w }));
    penalties.forEach(p => entries.push({ date: p.created_at, type: "penalty" as const, record: p }));

    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return entries;
  }, [withdrawals, penalties, tutorial.isOnboarding, tutorial.currentStep?.id]);

  const toggleSort = (field: "date" | "amount" | "status") => {
    if (sortField === field) setSortOrder(o => o === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortOrder("desc"); }
  };

  const copyUpiTransactionId = async (id: string | null) => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-violet-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your earnings and withdrawal requests</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Request Withdrawal + Recent Transactions + Withdrawals */}
        <div className="lg:col-span-7 space-y-6">
          {/* Request Withdrawal */}
          <div data-tut="transactions-withdraw-form" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">Request Withdrawal</h3>
              <p className="text-xs text-gray-400 mt-0.5">Request payout for your cleared balance</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="amount">Amount (₹)</label>
                <div className="flex gap-2">
                  <input id="amount" type="number" value={requestAmount}
                    onChange={e => setRequestAmount(e.target.value)}
                    placeholder="0.00" max={balanceData.available}
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all font-mono" />
                  <button type="button" onClick={() => setRequestAmount(String(balanceData.available))}
                    disabled={balanceData.available <= 0}
                    className="px-3 py-2.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
                    Max
                  </button>
                </div>
              </div>
              <button onClick={handleRequestWithdrawal}
                disabled={requesting || balanceData.available <= 0 || !requestAmount}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {requesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Requesting...</> : <><Send className="w-4 h-4" /> Request</>}
              </button>
              {balanceData.available <= 0 && (
                <div className="bg-amber-50 border border-dashed border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>No balance available for withdrawal yet. Orders need 2 business days to clear.</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div data-tut="transactions-recent" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleSort("date")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${sortField === "date" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}>
                  Date
                </button>
                <button onClick={() => toggleSort("amount")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${sortField === "amount" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}>
                  Amount
                </button>
                <button onClick={() => toggleSort("status")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${sortField === "status" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}>
                  Status
                </button>
              </div>
            </div>

            {sorted.length === 0 ? (
              <div className="text-center py-16">
                <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No transactions yet</p>
                <p className="text-xs text-gray-400 mt-1">Orders will appear here once customers purchase your products</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[340px] overflow-y-auto [&_table]:relative">
                <table className="w-full text-left divide-y divide-gray-100 border-separate border-spacing-0">
                  <thead className="sticky top-0 z-20">
                    <tr>
                      <th className="px-5 py-3.5 text-[11px] text-gray-500 uppercase tracking-wider font-medium bg-gray-50">Date</th>
                      <th className="px-5 py-3.5 text-[11px] text-gray-500 uppercase tracking-wider font-medium bg-gray-50">Item / Order</th>
                      <th className="px-5 py-3.5 text-[11px] text-gray-500 uppercase tracking-wider font-medium bg-gray-50">Amount</th>
                      <th className="px-5 py-3.5 text-[11px] text-gray-500 uppercase tracking-wider font-medium bg-gray-50">Status</th>
                      <th className="px-5 py-3.5 text-[11px] text-gray-500 uppercase tracking-wider font-medium bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sorted.map((txn) => {
                      const breakdown = calcBreakdown(txn);
                      const isExpanded = expanded === txn.id;
                      return (
                        <Fragment key={txn.id}><tr data-tut={txn.order_id === DEMO_ORDER_ID ? "transactions-demo-row" : undefined}
                          className="hover:bg-violet-50/30 transition-colors group">
                          <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(txn["Order Date"])}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{txn.Product}</span>
                              <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                Order {txn.order_id?.slice(0, 14)}... {txn.Name && <>&middot; {txn.Name}</>}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 font-mono">₹{breakdown.payout.toFixed(2)}</span>
                              <span className="text-xs text-gray-400">of ₹{(breakdown.itemAmount + breakdown.shipping).toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {!txn.seller_action ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
                                Pending Approval
                              </span>
                            ) : txn.seller_action === "rejected" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700">
                                Rejected
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                                getBusinessDaysSince(new Date(txn["Order Date"])) >= 2
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {getBusinessDaysSince(new Date(txn["Order Date"])) >= 2 ? "Cleared" : "In Clearing"}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => setExpanded(isExpanded ? null : txn.id)}
                              className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 ml-auto">
                              {isExpanded ? "Hide" : "Show breakdown"}
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`breakdown-${txn.id}`}>
                            <td colSpan={5} className="bg-gray-50/50 px-5 py-4 border-t border-gray-100">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Order Total</p>
                                  <p className="text-sm font-semibold text-gray-900 font-mono mt-0.5">₹{(breakdown.itemAmount + breakdown.shipping).toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Razorpay Fee (2%)</p>
                                  <p className="text-sm font-semibold text-red-500 font-mono mt-0.5">-₹{breakdown.razorpayFee.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Commission</p>
                                  <p className="text-sm font-semibold text-red-500 font-mono mt-0.5">-₹{breakdown.commission.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Your Payout</p>
                                  <p className="text-sm font-bold text-emerald-600 font-mono mt-0.5">₹{breakdown.payout.toFixed(2)}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Withdrawals & Penalties */}
          <div data-tut="transactions-withdrawals-section" className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Withdrawals & Penalties</h3>
                {pendingWithdrawalSum > 0 && (
                  <span className="ml-auto text-xs text-amber-600">₹{pendingWithdrawalSum.toFixed(2)} pending</span>
                )}
              </div>
            </div>
            {renderLedger()}
          </div>
        </div>

        {/* Right column - Balance Cards + Revenue Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Balance Cards */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Landmark className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Balance Overview</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">Total Balance</p>
                  <Wallet className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <p className="text-xl font-bold text-gray-900 font-mono">₹{stats.totalBalance.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Cumulative account total</p>
              </div>
              <div data-tut="transactions-available-card" className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">Available for Withdrawal</p>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-emerald-600 font-mono">₹{balanceData.available.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Orders cleared (2+ business days old)</p>
              </div>
              <div data-tut="transactions-clearing-card" className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">In Clearing</p>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xl font-bold text-amber-600 font-mono">₹{balanceData.clearing.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Recent orders (awaiting 2 business days)</p>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown - all items same color */}
          <div className="bg-gradient-to-br from-[#22223B] to-[#2a2a4a] text-white p-6 rounded-xl shadow-md relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl" />
            <h3 className="text-xs uppercase tracking-widest text-white/60 mb-5">Revenue Breakdown</h3>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-sm text-white/70">Total Revenue</span>
                <span className="text-sm font-bold text-white font-mono">₹{stats.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-sm text-white/70">Razorpay Fee (2%)</span>
                <span className="text-sm font-mono text-white">-₹{stats.totalRazorpayFees.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-sm text-white/70">Commission</span>
                <span className="text-sm font-mono text-white">-₹{stats.totalCommission.toFixed(2)}</span>
              </div>
              {stats.totalPenalties > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-sm text-white/70">Penalties</span>
                  <span className="text-sm font-mono text-white">-₹{stats.totalPenalties.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-white/80">Paid Out</span>
                <span className="text-base font-bold text-emerald-400 font-mono">₹{stats.paidOut.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-white/50">Pending</span>
                <span className="text-xs font-mono text-white/50">₹{stats.pending.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!tutorial.isOnboarding && <TutorialHelpButton onClick={() => tutorial.startPageTutorial("transactions")} />}
    </div>
  );

  function renderLedger() {
    if (loadingWithdrawals) {
      return (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      );
    }

    if (ledgerEntries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <History className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">No entries yet</p>
          <p className="text-xs text-gray-400 mt-0.5">Withdrawals and penalties will appear here.</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
        {ledgerEntries.map((entry, idx) => {
          if (entry.type === "withdrawal") {
            const w = entry.record as WithdrawalRequest;
            return (
              <div key={`w-${w.id}`} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900 font-mono">₹{w.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(w.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  <p className="text-[10px] text-gray-400">Withdrawal request</p>
                  {w.upi_transaction_id && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-gray-400 font-mono">UPI: {w.upi_transaction_id}</span>
                      <button onClick={() => copyUpiTransactionId(w.upi_transaction_id)}
                        className="text-gray-300 hover:text-gray-500 transition-colors">
                        {copiedId === w.upi_transaction_id
                          ? <Check className="w-3 h-3 text-emerald-500" />
                          : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                  w.status === "paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : w.status === "rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {w.status === "paid" ? "Paid" : w.status === "rejected" ? "Rejected" : "Pending"}
                </span>
              </div>
            );
          } else {
            const p = entry.record as PenaltyEntry;
            const absAmount = Math.abs(p.amount);
            return (
              <div key={`p-${p.id}`} className="px-5 py-3.5 flex items-center justify-between hover:bg-red-50/30 transition-colors">
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-600 font-mono">-₹{absAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-[10px] text-red-500">{p.reason}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700">
                  Penalty
                </span>
              </div>
            );
          }
        })}
      </div>
    );
  }
}
