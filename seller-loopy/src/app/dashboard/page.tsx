"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Package, ShoppingBag, DollarSign, Wallet,
  Store, RefreshCw, TrendingUp,
  ChevronRight, ShoppingBasket, Copy, HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useTutorial, TutorialHelpButton } from "@/components/tutorial/TutorialProvider";

interface RecentOrder {
  id: number;
  order_id: string;
  Name: string;
  "Total Price": string;
  "Order Date": string;
  status: string;
}

export default function SellerDashboard() {
  const tutorial = useTutorial();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pendingPayout: 0, revenueChange: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const copyOrderId = async (orderId: string) => {
    await navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const fetchStats = async (sellerId: number) => {
    const { count: products } = await supabase
      .from("Inventory")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", sellerId);

    const { data: allOrders } = await supabase
      .from("Orders")
      .select("\"Total Price\", \"Shipping Cost\", commission_earned, seller_payout, payout_status, \"Order Date\", order_id, Name")
      .eq("seller_id", sellerId);

    const ordersArray = allOrders || [];

    const allOrderIds = [...new Set(ordersArray.map((o: any) => o.order_id))];
    const acceptedOrderIds = new Set<string>();
    if (allOrderIds.length > 0) {
      const { data: profileData } = await supabase
        .from("Your Profile")
        .select("order_id, seller_action")
        .in("order_id", allOrderIds);
      (profileData || []).forEach((p: any) => {
        if (p.seller_action === "accepted") acceptedOrderIds.add(p.order_id);
      });
    }
    const acceptedOrders = ordersArray.filter((o: any) => acceptedOrderIds.has(o.order_id));

    const orderMap = new Map<string, any[]>();
    acceptedOrders.forEach((o: any) => {
      const existing = orderMap.get(o.order_id) || [];
      existing.push(o);
      orderMap.set(o.order_id, existing);
    });
    const groupedOrders = Array.from(orderMap.entries()).map(([orderId, items]) => ({
      ...items[0],
      items,
      orderTotal: items.reduce((sum: number, i: any) => sum + (parseFloat(i["Total Price"]) || 0), 0),
    }));
    const uniqueCount = groupedOrders.length;

    const revenue = acceptedOrders.reduce((sum: number, o: any) =>
      sum + (parseFloat(o["Total Price"]) || 0) + (parseFloat(o["Shipping Cost"]) || 0), 0);

    const totalPayoutsSum = acceptedOrders.reduce((sum: number, o: any) => {
      const total = parseFloat(o["Total Price"]) || 0;
      const shipping = parseFloat(o["Shipping Cost"]) || 0;
      const commission = parseFloat(o.commission_earned) || 0;
      return sum + total - total * 0.02 - commission + shipping;
    }, 0);

    const { data: withdrawalData } = await supabase
      .from("withdrawal_requests")
      .select("amount, status")
      .eq("seller_id", sellerId);
    const paidWithdrawals = (withdrawalData || [])
      .filter((w: any) => w.status === "paid")
      .reduce((sum: number, w: any) => sum + w.amount, 0);

    const { data: penaltyData } = await supabase
      .from("penalty_ledger")
      .select("amount")
      .eq("seller_id", sellerId);
    const totalPenalties = (penaltyData || [])
      .reduce((sum: number, p: any) => sum + Math.abs(p.amount), 0);

    const pendingPayout = totalPayoutsSum - paidWithdrawals - totalPenalties;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    acceptedOrders.forEach((o: any) => {
      const d = new Date(o["Order Date"]);
      const total = (parseFloat(o["Total Price"]) || 0) + (parseFloat(o["Shipping Cost"]) || 0);
      if (d >= thisMonthStart) {
        thisMonthRevenue += total;
      } else if (d >= lastMonthStart && d <= lastMonthEnd) {
        lastMonthRevenue += total;
      }
    });

    let revenueChange = 0;
    if (lastMonthRevenue > 0) {
      revenueChange = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    }

    setStats({
      products: products || 0,
      orders: uniqueCount,
      revenue: Math.round(revenue * 100) / 100,
      pendingPayout: Math.round(pendingPayout * 100) / 100,
      revenueChange: Math.round(revenueChange * 10) / 10,
    });

    const orderIds = [...new Set(ordersArray.map((o: any) => o.order_id))].slice(0, 5);
    let profileMap: Record<string, string> = {};
    if (orderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("Your Profile")
        .select("order_id, Status")
        .in("order_id", orderIds);
      (profiles || []).forEach((p: any) => {
        profileMap[p.order_id] = p.Status || "pending";
      });
    }

    const recent = groupedOrders.slice(0, 5).map(g => ({
      id: g.id,
      order_id: g.order_id,
      Name: g.Name || "—",
      "Total Price": g.orderTotal.toFixed(2),
      "Order Date": g["Order Date"],
      status: profileMap[g.order_id] || "pending",
    }));
    setRecentOrders(recent);
    setLoading(false);
    setLastRefreshed(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
  };

  useEffect(() => {
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) return;
    const s = JSON.parse(stored);
    setSeller(s);
    fetchStats(s.id);
    const interval = setInterval(() => fetchStats(s.id), 10000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-[#F59E0B]/20 text-[#F59E0B]",
      processing: "bg-blue-100 text-blue-700",
      shipped: "bg-purple-100 text-purple-700",
      delivered: "bg-[#10B981]/20 text-[#10B981]",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Store className="w-5 h-5 text-violet-400" />
          </div>
        </div>
      </div>
    );
  }

  const changeColor = stats.revenueChange >= 0 ? "text-[#10B981]" : "text-red-500";
  const changeIcon = stats.revenueChange >= 0 ? "+" : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-[600] text-[#22223B] leading-[40px]">Dashboard</h1>
          {lastRefreshed && (
            <p className="text-[#47464d] text-[16px] leading-[24px] font-[400]">
              Updated {lastRefreshed}
            </p>
          )}
        </div>
        <button onClick={() => fetchStats(seller.id)}
            className="flex items-center gap-2 px-4 py-2 bg-[#22223B] text-white rounded-lg font-bold hover:shadow-lg transition-all active:scale-95 text-sm">
            <RefreshCw className="w-[20px] h-[20px]" />
            Refresh
          </button>
      </div>

      {/* Recent Orders Table - full width on top */}
      <div data-tut="dash-recent-orders" className="bg-white rounded-xl border border-[#22223B]/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#22223B]/10 flex items-center justify-between">
          <h4 className="text-[20px] leading-[28px] font-[600] text-[#22223B]">Recent Orders</h4>
          {recentOrders.length > 0 && (
            <Link href="/dashboard/orders"
              className="text-[#22223B] font-bold text-[12px] leading-[16px] font-[600] hover:underline">
              See all activity
            </Link>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5F9FF]">
              <tr>
                <th className="px-6 py-4 text-[12px] leading-[16px] font-[600] text-[#47464d] uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-[12px] leading-[16px] font-[600] text-[#47464d] uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-[12px] leading-[16px] font-[600] text-[#47464d] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[12px] leading-[16px] font-[600] text-[#47464d] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] leading-[16px] font-[600] text-[#47464d] uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22223B]/10">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#47464d] text-sm">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-[#eff4ff] transition-colors">
                    <td className="px-6 py-4">
  <span className="inline-flex items-center gap-2 font-mono text-sm text-[#22223B]">
    <span className="cursor-pointer hover:text-purple-600 transition-colors" title={order.order_id} onClick={() => copyOrderId(order.order_id)}>#{order.order_id.slice(0, 8)}</span>
    <button onClick={() => copyOrderId(order.order_id)} className="text-gray-400 hover:text-gray-600 transition-colors">
      <Copy className="w-3.5 h-3.5" />
    </button>
    {/* "Copied!" indicator removed - caused table layout shift */}
  </span>
</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#22223B]">{order.Name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-[#22223B]">₹{order["Total Price"]}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[12px] leading-[16px] font-[600] ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#47464d]">{formatDate(order["Order Date"])}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards - below Recent Orders */}
      <div data-tut="dash-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products Listed */}
        <div data-tut="dash-stat-products" className="bg-white p-5 rounded-xl border border-[#22223B]/5 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[#47464d] text-[11px] leading-[16px] font-[600] uppercase tracking-wider">Products Listed</span>
              <div className="w-9 h-9 bg-[#e6eeff] rounded-lg flex items-center justify-center text-[#22223B]">
                <Package className="w-[18px] h-[18px]" />
              </div>
            </div>
            <h3 className="text-[36px] leading-[44px] font-[700] text-[#22223B] tracking-[-0.02em] mb-1">{stats.products}</h3>
          </div>
          <Link href="/dashboard/products"
            className="w-full py-2.5 bg-[#efdbff] text-[#290848] font-bold rounded-lg hover:bg-[#dcb8ff] transition-colors flex items-center justify-center gap-2 text-sm mt-3">
            Manage Products
            <ChevronRight className="w-[18px] h-[18px]" />
          </Link>
        </div>

        {/* Items Sold */}
        <div data-tut="dash-stat-sold" className="bg-white p-5 rounded-xl border border-[#22223B]/5 shadow-sm flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[#47464d] text-[11px] leading-[16px] font-[600] uppercase tracking-wider">Items Sold</span>
              <div className="w-9 h-9 bg-[#e6eeff] rounded-lg flex items-center justify-center text-[#22223B]">
                <ShoppingBasket className="w-[18px] h-[18px]" />
              </div>
            </div>
            <h3 className="text-[36px] leading-[44px] font-[700] text-[#22223B] tracking-[-0.02em] mb-1">{stats.orders}</h3>
          </div>
          <Link href="/dashboard/orders"
            className="w-full py-2.5 bg-[#D7B3FB] text-[#22223B] font-bold rounded-lg hover:bg-[#D7B3FB]/80 transition-colors flex items-center justify-center gap-2 text-sm mt-3">
            View Orders
            <ShoppingBag className="w-[18px] h-[18px]" />
          </Link>
        </div>

        {/* Total Revenue */}
        <div data-tut="dash-stat-revenue" className="bg-white p-5 rounded-xl border border-[#22223B]/5 shadow-sm flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#10B981]/5 rounded-bl-full" />
          <div className="flex justify-between items-start mb-3 relative">
            <span className="text-[#47464d] text-[11px] leading-[16px] font-[600] uppercase tracking-wider">Total Revenue</span>
            <div className="w-9 h-9 bg-[#10B981]/10 rounded-lg flex items-center justify-center text-[#10B981]">
              <DollarSign className="w-[18px] h-[18px]" />
            </div>
          </div>
          <h3 className="text-[36px] leading-[44px] font-[700] text-[#22223B] tracking-[-0.02em] mb-1">₹{stats.revenue.toFixed(2)}</h3>
          <div className={`flex items-center gap-2 font-bold text-[11px] leading-[16px] font-[600] ${changeColor}`}>
            <TrendingUp className={`w-[16px] h-[16px] ${stats.revenueChange < 0 ? "rotate-180" : ""}`} />
            {changeIcon}{stats.revenueChange}% from last month
          </div>
          <div className="mt-3 h-10 w-full flex items-end gap-1">
            <div className="flex-1 bg-[#10B981]/20 rounded-t-sm h-[30%]" />
            <div className="flex-1 bg-[#10B981]/20 rounded-t-sm h-[45%]" />
            <div className="flex-1 bg-[#10B981]/20 rounded-t-sm h-[35%]" />
            <div className="flex-1 bg-[#10B981]/20 rounded-t-sm h-[60%]" />
            <div className="flex-1 bg-[#10B981]/20 rounded-t-sm h-[50%]" />
            <div className="flex-1 bg-[#10B981]/20 rounded-t-sm h-[80%]" />
            <div className="flex-1 bg-[#10B981] h-[90%]" />
          </div>
        </div>

        {/* Pending Payout */}
        <div data-tut="dash-stat-payout" className="bg-white p-5 rounded-xl border border-[#22223B]/5 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[#47464d] text-[11px] leading-[16px] font-[600] uppercase tracking-wider">Pending Payout</span>
            <div className="w-9 h-9 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center text-[#F59E0B]">
              <Wallet className="w-[18px] h-[18px]" />
            </div>
          </div>
          <h3 className="text-[36px] leading-[44px] font-[700] text-[#22223B] tracking-[-0.02em] mb-1">₹{stats.pendingPayout.toFixed(2)}</h3>
        </div>
      </div>
      {!tutorial.isOnboarding && <TutorialHelpButton onClick={() => tutorial.startPageTutorial("dashboard")} />}
    </div>
  );
}
