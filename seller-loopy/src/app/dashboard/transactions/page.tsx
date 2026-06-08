"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/utils/supabase";
import {
  Wallet, Loader2, Search, ArrowUpDown, Clock, CheckCircle, DollarSign,
  ChevronDown, ChevronUp, Percent,
} from "lucide-react";

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
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "payout" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) { window.location.href = "/"; return; }
    const s = JSON.parse(stored);
    setSeller(s);
    fetchTransactions(s.id);
  }, []);

  const fetchTransactions = async (sellerId: number) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Orders")
      .select("*")
      .eq("seller_id", sellerId)
      .order("id", { ascending: false });

    if (!error && data) {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  };

  const calcBreakdown = (txn: Transaction) => {
    const itemAmount = parseFloat(txn["Total Price"]) || 0;
    const shipping = parseFloat(txn["Shipping Cost"]) || 0;
    const razorpayFee = itemAmount * 0.02;
    const commissionBase = itemAmount - razorpayFee;
    const commission = parseFloat(txn.commission_earned) || 0;
    const payout = parseFloat(txn.seller_payout) || 0;
    return { itemAmount, shipping, razorpayFee, commissionBase, commission, payout };
  };

  const stats = useMemo(() => {
    const totalItemAmount = transactions.reduce((sum, t) => sum + (parseFloat(t["Total Price"]) || 0), 0);
    const totalRazorpayFees = totalItemAmount * 0.02;
    const totalShipping = transactions.reduce((sum, t) => sum + (parseFloat(t["Shipping Cost"]) || 0), 0);
    const totalCommission = transactions.reduce((sum, t) => sum + (parseFloat(t.commission_earned) || 0), 0);
    const totalPayout = transactions.reduce((sum, t) => sum + (parseFloat(t.seller_payout) || 0), 0);
    const paidOut = transactions
      .filter(t => t.payout_status === "paid")
      .reduce((sum, t) => sum + (parseFloat(t.seller_payout) || 0), 0);
    const totalDue = totalItemAmount - totalRazorpayFees - totalCommission + totalShipping;
    const pending = totalDue - paidOut;
    return { totalItemAmount, totalRazorpayFees, totalShipping, totalCommission, totalPayout, totalDue, paidOut, pending, orderCount: transactions.length };
  }, [transactions]);

  const sorted = useMemo(() => {
    let list = [...transactions];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(t =>
        t.order_id?.toLowerCase().includes(q) ||
        t.Product?.toLowerCase().includes(q) ||
        t.Name?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = new Date(a["Order Date"]).getTime() - new Date(b["Order Date"]).getTime();
      else if (sortBy === "payout") cmp = (parseFloat(a.seller_payout) || 0) - (parseFloat(b.seller_payout) || 0);
      else if (sortBy === "status") cmp = (a.payout_status || "").localeCompare(b.payout_status || "");
      return sortOrder === "desc" ? -cmp : cmp;
    });
    return list;
  }, [transactions, searchTerm, sortBy, sortOrder]);

  const toggleSort = (field: "date" | "payout" | "status") => {
    if (sortBy === field) setSortOrder(o => o === "desc" ? "asc" : "desc");
    else { setSortBy(field); setSortOrder("desc"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your earnings from orders placed on your store</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Sales</p>
          <p className="text-lg font-bold text-gray-900 mt-1">₹{stats.totalItemAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Razorpay Fee (2%)</p>
          <p className="text-lg font-bold text-rose-500 mt-1">-₹{stats.totalRazorpayFees.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Commission</p>
          <p className="text-lg font-bold text-rose-500 mt-1">-₹{stats.totalCommission.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Shipping</p>
          <p className="text-lg font-bold text-blue-600 mt-1">+₹{stats.totalShipping.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Paid Out</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">₹{stats.paidOut.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="text-lg font-bold text-amber-600 mt-1">₹{stats.pending.toFixed(2)}</p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by order ID, product or customer..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
        </div>
        <button onClick={() => toggleSort("date")}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${sortBy === "date" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
          <Clock className="w-3.5 h-3.5" /> Date <ArrowUpDown className="w-3 h-3" />
        </button>
        <button onClick={() => toggleSort("payout")}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${sortBy === "payout" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
          <DollarSign className="w-3.5 h-3.5" /> Amount <ArrowUpDown className="w-3 h-3" />
        </button>
        <button onClick={() => toggleSort("status")}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${sortBy === "status" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>
          Status <ArrowUpDown className="w-3 h-3" />
        </button>
      </div>

      {/* Transaction list */}
      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <Wallet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No transactions yet</p>
          <p className="text-gray-400 text-xs mt-1">Orders will appear here once customers purchase your products</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((txn) => {
            const breakdown = calcBreakdown(txn);
            const isExpanded = expanded === txn.id;
            return (
              <div key={txn.id}
                className="rounded-xl bg-white border border-gray-200 p-4 hover:border-gray-300 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{txn.Product}</span>
                      <span className="text-xs text-gray-400">x{txn.Quantity}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Order <span className="font-mono">{txn.order_id?.slice(0, 12)}...</span>
                      {txn.Name && <> &middot; {txn.Name}</>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(txn["Order Date"]).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">₹{breakdown.payout.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">of ₹{(breakdown.itemAmount + breakdown.shipping).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    txn.payout_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {txn.payout_status === "paid"
                      ? <><CheckCircle className="w-3 h-3" /> Paid</>
                      : <><Clock className="w-3 h-3" /> Pending</>
                    }
                  </span>
                  <button onClick={() => setExpanded(isExpanded ? null : txn.id)}
                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
                    {isExpanded ? <>Hide breakdown <ChevronUp className="w-3 h-3" /></> : <>Show breakdown <ChevronDown className="w-3 h-3" /></>}
                  </button>
                </div>

                {/* Expanded breakdown */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Item Amount</span>
                      <span className="text-gray-900 font-medium">₹{breakdown.itemAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Razorpay Fee (2%)</span>
                      <span className="text-rose-600 font-medium">-₹{breakdown.razorpayFee.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Commission Base</span>
                      <span className="text-gray-900 font-medium">₹{breakdown.commissionBase.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Commission</span>
                      <span className="text-rose-600 font-medium">-₹{breakdown.commission.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Shipping (you deliver)</span>
                      <span className="text-emerald-600 font-medium">+₹{breakdown.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-200 font-bold">
                      <span className="text-gray-700">Your Payout</span>
                      <span className="text-gray-900">₹{breakdown.payout.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
