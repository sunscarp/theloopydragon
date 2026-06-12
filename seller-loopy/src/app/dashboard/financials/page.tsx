"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { FileText, Download, Loader2, Receipt, DollarSign, FileCheck } from "lucide-react";

export default function FinancialsPage() {
  const [seller, setSeller] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) return;
    setSeller(JSON.parse(stored));
  }, []);

  const downloadLedger = async () => {
    if (!seller) return;
    setDownloading(true);

    try {
      const { data: orders } = await supabase
        .from("Orders")
        .select("*")
        .eq("seller_id", seller.id)
        .order("Order Date", { ascending: false });

      const { data: inventory } = await supabase
        .from("Inventory")
        .select("*")
        .eq("seller_id", seller.id);

      const res = await fetch(`/api/sellers/withdrawal-requests?seller_id=${seller.id}`);
      const withdrawalData = await res.json();
      const withdrawals = withdrawalData.success ? (withdrawalData.requests || []) : [];

      const { data: penaltyData } = await supabase
        .from("penalty_ledger")
        .select("*")
        .eq("seller_id", seller.id)
        .order("created_at", { ascending: false });
      const penalties = penaltyData || [];

      const orderIds = [...new Set((orders || []).map((o: any) => o.order_id))];
      let profileMap: Record<string, any> = {};
      if (orderIds.length > 0) {
        const { data: profiles } = await supabase
          .from("Your Profile")
          .select("order_id, Status, Tracking_ID")
          .in("order_id", orderIds);
        (profiles || []).forEach((p: any) => {
          profileMap[p.order_id] = p;
        });
      }

      const rows: string[] = [];
      const escape = (v: any) => {
        const s = String(v ?? "");
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      rows.push("ORDER TRANSACTIONS");
      rows.push([
        "Order ID", "Date", "Customer Name", "Customer Email", "Product",
        "Quantity", "Item Price", "Shipping Cost", "Total",
        "Commission Earned", "Seller Payout", "Payout Status", "Status", "Tracking ID",
      ].join(","));

      (orders || []).forEach((o: any) => {
        const status = profileMap[o.order_id]?.Status || "pending";
        const tracking = profileMap[o.order_id]?.Tracking_ID || "";
        rows.push([
          o.order_id, o["Order Date"], o.Name, o.Email, o.Product,
          o.Quantity, o["Total Price"], o["Shipping Cost"],
          ((parseFloat(o["Total Price"]) || 0) + (parseFloat(o["Shipping Cost"]) || 0)).toFixed(2),
          o.commission_earned || "0", o.seller_payout || "0",
          "in balance", status, tracking,
        ].map(escape).join(","));
      });

      rows.push("");

      rows.push("REVENUE SUMMARY");
      rows.push(["Metric", "Value"].join(","));

      const totalItemAmount = (orders || []).reduce((s: number, o: any) => s + (parseFloat(o["Total Price"]) || 0), 0);
      const totalShipping = (orders || []).reduce((s: number, o: any) => s + (parseFloat(o["Shipping Cost"]) || 0), 0);
      const totalGrossRevenue = totalItemAmount + totalShipping;
      const totalCommission = (orders || []).reduce((s: number, o: any) => s + (parseFloat(o.commission_earned) || 0), 0);
      const totalRazorpayFee = totalItemAmount * 0.02;
      const totalNetRevenue = totalGrossRevenue - totalCommission - totalRazorpayFee;

      rows.push(`"Total Gross Revenue (Items + Shipping)",${totalGrossRevenue.toFixed(2)}`);
      rows.push(`"Total Item Sales",${totalItemAmount.toFixed(2)}`);
      rows.push(`"Total Shipping Collected",${totalShipping.toFixed(2)}`);
      rows.push(`"Total Commission Deducted",${totalCommission.toFixed(2)}`);
      rows.push(`"Total Payment Gateway Fees (2%)",${totalRazorpayFee.toFixed(2)}`);
      rows.push(`"Total Net Revenue (After Deductions)",${totalNetRevenue.toFixed(2)}`);
      rows.push(`"Total Orders",${(orders || []).length}`);

      rows.push("");

      rows.push("PAYOUT BREAKDOWN");
      rows.push(["Category", "Amount"].join(","));

      const totalPayoutsSum = (orders || []).reduce((s: number, o: any) => {
        const total = parseFloat(o["Total Price"]) || 0;
        const shipping = parseFloat(o["Shipping Cost"]) || 0;
        const commission = parseFloat(o.commission_earned) || 0;
        return s + total - total * 0.02 - commission + shipping;
      }, 0);

      const paidViaWithdrawals = (withdrawals || []).filter((w: any) => w.status === "paid").reduce((s: number, w: any) => s + w.amount, 0);
      const pendingWithdrawalsTotal = (withdrawals || []).filter((w: any) => w.status === "pending").reduce((s: number, w: any) => s + w.amount, 0);
      const totalBalance = totalPayoutsSum - paidViaWithdrawals;

      const totalPenalties = (penalties || []).reduce((s: number, p: any) => s + Math.abs(p.amount), 0);
      const adjustedBalance = totalBalance - totalPenalties;

      rows.push(`"Total Paid Out (via Withdrawals)",${paidViaWithdrawals.toFixed(2)}`);
      rows.push(`"Pending Withdrawals",${pendingWithdrawalsTotal.toFixed(2)}`);
      rows.push(`"Total Account Balance (before penalties)",${totalBalance.toFixed(2)}`);
      rows.push(`"Total Penalties",${totalPenalties.toFixed(2)}`);
      rows.push(`"Total Account Balance (after penalties)",${Math.max(0, adjustedBalance).toFixed(2)}`);
      rows.push(`"Total Lifetime Earnings",${totalPayoutsSum.toFixed(2)}`);

      rows.push("");

      rows.push("PENALTY LEDGER");
      rows.push(["ID", "Order ID", "Amount", "Reason", "Date"].join(","));

      (penalties || []).forEach((p: any) => {
        rows.push([p.id, p.order_id, p.amount.toFixed(2), p.reason, p.created_at].map(escape).join(","));
      });

      rows.push("");

      rows.push("WITHDRAWAL REQUESTS");
      rows.push(["Request ID", "Amount", "Status", "UPI Transaction ID", "Requested At", "Paid At"].join(","));

      (withdrawals || []).forEach((w: any) => {
        rows.push([w.id, w.amount.toFixed(2), w.status, w.upi_transaction_id || "", w.created_at, w.paid_at || ""].map(escape).join(","));
      });

      rows.push("");

      rows.push("PRODUCTS LISTED");
      rows.push(["Product ID", "Product Name", "Price", "Quantity in Stock", "Category", "Status"].join(","));

      (inventory || []).forEach((p: any) => {
        rows.push([p.id, p.Product, p.Price, p.Quantity, p.Tag, p.status || "active"].map(escape).join(","));
      });

      rows.push("");

      rows.push("MONTHLY EARNINGS BREAKDOWN");
      rows.push(["Year-Month", "Total Sales", "Shipping", "Commission", "Fees", "Net Revenue"].join(","));

      const monthlyMap = new Map<string, { sales: number; shipping: number; commission: number; fees: number }>();
      (orders || []).forEach((o: any) => {
        const d = new Date(o["Order Date"]);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthlyMap.get(key) || { sales: 0, shipping: 0, commission: 0, fees: 0 };
        entry.sales += parseFloat(o["Total Price"]) || 0;
        entry.shipping += parseFloat(o["Shipping Cost"]) || 0;
        entry.commission += parseFloat(o.commission_earned) || 0;
        monthlyMap.set(key, entry);
      });

      const sortedMonths = Array.from(monthlyMap.keys()).sort();
      sortedMonths.forEach((month) => {
        const entry = monthlyMap.get(month)!;
        const fees = entry.sales * 0.02;
        const net = entry.sales + entry.shipping - entry.commission - fees;
        rows.push([month, entry.sales.toFixed(2), entry.shipping.toFixed(2), entry.commission.toFixed(2), fees.toFixed(2), net.toFixed(2)].map(escape).join(","));
      });

      const csvContent = rows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-ledger-${seller.shop_name?.replace(/\s+/g, "-").toLowerCase() || "seller"}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download ledger:", err);
    }

    setDownloading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-[600] text-[#22223B] leading-[40px]">Financials</h1>
        <p className="text-[#47464d] text-[16px] leading-[24px] font-[400]">
          Download your complete financial ledger for tax purposes.
        </p>
      </div>

      {/* Download Card */}
      <div className="bg-white rounded-xl border border-[#22223B]/5 shadow-sm overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-[#e6eeff] rounded-2xl flex items-center justify-center text-[#22223B] shrink-0">
            <FileText className="w-10 h-10" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-[24px] leading-[32px] font-[600] text-[#22223B] mb-2">Financial Ledger</h3>
            <p className="text-[#47464d] text-[16px] leading-[24px] font-[400] mb-2">
              Download a complete record of all your transactions, payouts, and earnings for tax filing and accounting purposes.
            </p>
            <p className="text-[#47464d] text-[14px] leading-[20px] font-[500]">
              CSV format • Includes all historical data • Ready for your accountant
            </p>
          </div>
          <button onClick={downloadLedger} disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 bg-[#22223B] text-white font-bold rounded-lg hover:shadow-lg transition-all active:scale-95 text-sm shrink-0 disabled:opacity-60">
            {downloading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><Download className="w-5 h-5" /> Download Ledger</>
            )}
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#22223B]/5 shadow-sm">
          <Receipt className="w-6 h-6 text-[#22223B] mb-3" />
          <h4 className="text-[16px] leading-[24px] font-[600] text-[#22223B] mb-2">Transaction History</h4>
          <p className="text-[#47464d] text-[14px] leading-[20px] font-[400]">
            Every sale, refund, and adjustment recorded with timestamps and order references.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#22223B]/5 shadow-sm">
          <DollarSign className="w-6 h-6 text-[#22223B] mb-3" />
          <h4 className="text-[16px] leading-[24px] font-[600] text-[#22223B] mb-2">Payout Records</h4>
          <p className="text-[#47464d] text-[14px] leading-[20px] font-[400]">
            Complete payout history including dates, amounts, and settlement status.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#22223B]/5 shadow-sm">
          <FileCheck className="w-6 h-6 text-[#22223B] mb-3" />
          <h4 className="text-[16px] leading-[24px] font-[600] text-[#22223B] mb-2">Tax Summary</h4>
          <p className="text-[#47464d] text-[14px] leading-[20px] font-[400]">
            Annual earnings breakdown with commission deductions for easy tax filing.
          </p>
        </div>
      </div>
    </div>
  );
}
