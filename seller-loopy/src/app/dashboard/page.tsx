"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase";
import {
  Package, ShoppingBag, DollarSign, TrendingUp, Loader2,
  Store, RefreshCw, ArrowRight, Wallet, Sparkles, Clock,
} from "lucide-react";
import Link from "next/link";

export default function SellerDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pendingPayout: 0 });
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const fetchStats = async (sellerId: number) => {
    const { count: products } = await supabase
      .from("Inventory")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", sellerId);

    const { data: orders } = await supabase
      .from("Orders")
      .select("\"Total Price\", \"Shipping Cost\", commission_earned, seller_payout, payout_status")
      .eq("seller_id", sellerId);

    const revenue = (orders || []).reduce((sum: number, o: any) =>
      sum + (parseFloat(o["Total Price"]) || 0), 0);

    let totalDue = 0;
    let totalPaid = 0;
    (orders || []).forEach((o: any) => {
      const total = parseFloat(o["Total Price"]) || 0;
      const shipping = parseFloat(o["Shipping Cost"]) || 0;
      const commission = parseFloat(o.commission_earned) || 0;
      const orderDue = total - total * 0.02 - commission + shipping;
      if (o.payout_status === "paid") {
        totalPaid += orderDue;
      }
      totalDue += orderDue;
    });
    const pendingPayout = totalDue - totalPaid;

    setStats({
      products: products || 0,
      orders: orders?.length || 0,
      revenue: Math.round(revenue * 100) / 100,
      pendingPayout: Math.round(pendingPayout * 100) / 100,
    });
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

  const cards = [
    {
      label: "Products Listed", value: stats.products, icon: Package,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
      href: "/dashboard/products",
    },
    {
      label: "Items Sold", value: stats.orders, icon: ShoppingBag,
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
      href: "/dashboard/orders",
    },
    {
      label: "Total Revenue", value: `₹${stats.revenue.toFixed(2)}`, icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
      href: "/dashboard/orders",
    },
    {
      label: "Pending Payout", value: `₹${stats.pendingPayout.toFixed(2)}`, icon: Wallet,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 md:p-8">
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                  {greeting}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {seller?.shop_name}
              </h1>
              <p className="text-gray-500 text-sm max-w-lg">
                Here&apos;s what&apos;s happening with your store today.
              </p>
            </div>
            <button onClick={() => fetchStats(seller.id)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
          {lastRefreshed && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              Updated {lastRefreshed}
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, gradient, shadow, href }) => (
          <Link key={label} href={href}
            className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-5 hover:border-gray-300 transition-all duration-300">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/products"
          className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-5 hover:border-violet-500/30 transition-all duration-300 shadow-sm">
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Manage Products</p>
              <p className="text-sm text-gray-500">{stats.products} products listed</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link href="/dashboard/orders"
          className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-5 hover:border-blue-500/30 transition-all duration-300 shadow-sm">
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">View Orders</p>
              <p className="text-sm text-gray-500">{stats.orders} items sold</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Bottom mobile refresh */}
      <div className="flex sm:hidden justify-center">
        <button onClick={() => fetchStats(seller.id)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-xl transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
    </div>
  );
}
