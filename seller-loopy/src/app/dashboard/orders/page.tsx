"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/utils/supabase";
import {
  ShoppingBag, Loader2, Search, RefreshCw, ChevronDown, ChevronUp,
  X, Check, Truck, ExternalLink, Package, Clock, Filter,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

interface OrderRow {
  id: number;
  order_id: string;
  Product: string;
  Quantity: number;
  "Total Price": string;
  "Shipping Cost": string;
  Name: string;
  Address: string;
  Pincode: string;
  Contact: string;
  Email: string;
  uid: string;
  "Order Date": string;
  payment_id: string;
  commission_earned: string;
  seller_payout: string;
  seller_id: number;
  Status?: string;
  Tracking_ID?: string;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "total" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [customStatus, setCustomStatus] = useState("");
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [updatingTracking, setUpdatingTracking] = useState<string | null>(null);
  const [customTracking, setCustomTracking] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [profileOrders, setProfileOrders] = useState<Record<string, any>>({});

  useEffect(() => {
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) return;
    const s = JSON.parse(stored);
    setSeller(s);
    fetchOrders(s.id);
  }, []);

  const fetchOrders = async (sellerId: number) => {
    setLoading(true);
    const { data: orderRows } = await supabase
      .from("Orders")
      .select("*")
      .eq("seller_id", sellerId)
      .order("Order Date", { ascending: false });

    setOrders(orderRows || []);

    const orderIds = [...new Set((orderRows || []).map((o: any) => o.order_id))];
    if (orderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("Your Profile")
        .select("order_id, Status, Tracking_ID")
        .in("order_id", orderIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => {
        profileMap[p.order_id] = p;
      });
      setProfileOrders(profileMap);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    const { error } = await supabase
      .from("Your Profile")
      .update({ Status: newStatus })
      .eq("order_id", orderId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      setProfileOrders(prev => ({ ...prev, [orderId]: { ...prev[orderId], Status: newStatus } }));
      toast.success("Status updated");
      setEditingStatus(null);
    }
    setUpdatingStatus(null);
  };

  const updateTrackingID = async (orderId: string, newTracking: string) => {
    setUpdatingTracking(orderId);
    const { error } = await supabase
      .from("Your Profile")
      .update({ Tracking_ID: newTracking })
      .eq("order_id", orderId);
    if (error) {
      toast.error("Failed to update tracking ID");
    } else {
      setProfileOrders(prev => ({ ...prev, [orderId]: { ...prev[orderId], Tracking_ID: newTracking } }));
      toast.success("Tracking ID saved");
      setEditingTracking(null);
    }
    setUpdatingTracking(null);
  };

  const totalRevenue = orders.reduce((sum: number, o: any) =>
    sum + (parseFloat(o["Total Price"]) || 0), 0);

  const groupedOrders = useMemo(() => {
    const map = new Map<string, OrderRow[]>();
    orders.forEach(o => {
      const existing = map.get(o.order_id) || [];
      existing.push(o);
      map.set(o.order_id, existing);
    });
    return Array.from(map.entries()).map(([orderId, items]) => {
      const first = items[0];
      const status = profileOrders[orderId]?.Status || "pending";
      const trackingId = profileOrders[orderId]?.Tracking_ID || "";
      const orderTotal = items.reduce((sum, i) => sum + (parseFloat(i["Total Price"]) || 0), 0);
      const shipping = parseFloat(first["Shipping Cost"] || "0");
      return { orderId, items, status, trackingId, orderTotal, shipping, first };
    });
  }, [orders, profileOrders]);

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = groupedOrders.filter(g => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return g.orderId.toLowerCase().includes(q)
        || g.first.Name?.toLowerCase().includes(q)
        || g.first.uid?.toLowerCase().includes(q)
        || g.first.Address?.toLowerCase().includes(q);
    });
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case "date":
          aVal = new Date(a.first["Order Date"] || "").getTime();
          bVal = new Date(b.first["Order Date"] || "").getTime();
          break;
        case "total":
          aVal = a.orderTotal;
          bVal = b.orderTotal;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        default: return 0;
      }
      return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    return filtered;
  }, [groupedOrders, searchTerm, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      shipped: "bg-purple-100 text-purple-700 border-purple-200",
      delivered: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-500 border-gray-200";
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
            <ShoppingBag className="w-5 h-5 text-violet-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            <span className="text-gray-700 font-medium">{orders.length}</span> items sold &middot;
            <span className="text-gray-700 font-medium"> ₹{totalRevenue.toFixed(2)}</span> total &middot;
            <span className="text-gray-700 font-medium"> {groupedOrders.length}</span> orders
          </p>
        </div>
        <button onClick={() => fetchOrders(seller.id)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Search & filters */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID, Customer, UID, or Address..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="pl-9 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 appearance-none cursor-pointer">
                <option value="date" className="bg-white">Sort: Date</option>
                <option value="total" className="bg-white">Sort: Total</option>
                <option value="status" className="bg-white">Sort: Status</option>
              </select>
            </div>
            <button onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{sortOrder === "asc" ? "Asc" : "Desc"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders list */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white border border-gray-200">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200">
            <ShoppingBag className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-700 font-medium">
            {searchTerm ? "No orders match your search" : "No orders yet"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? "Try a different search term" : "Orders will appear here once customers buy your products"}
          </p>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")}
              className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedOrders.map(group => {
            const isExpanded = expandedOrder === group.orderId;
            const isEditingStatus = editingStatus === group.orderId;
            const isUpdatingStatus = updatingStatus === group.orderId;
            const isEditingTrk = editingTracking === group.orderId;
            const isUpdatingTrk = updatingTracking === group.orderId;

            return (
              <div key={group.orderId}
                className="rounded-2xl bg-white border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-200">
                {/* Order header */}
                <div className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="font-mono text-xs text-gray-400">#{group.orderId.slice(0, 10)}</span>
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full border ${getStatusColor(group.status)}`}>
                          {group.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{group.first.Name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(group.first["Order Date"])}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{group.orderTotal.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">{group.items.length} item{group.items.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Status & tracking actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                    {!isEditingStatus ? (
                      <button onClick={() => { setEditingStatus(group.orderId); setCustomStatus(group.status); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all font-medium">
                        <Package className="w-3 h-3" /> Change Status
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input type="text" value={customStatus}
                          onChange={e => setCustomStatus(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && customStatus.trim()) updateOrderStatus(group.orderId, customStatus); }}
                          placeholder="Enter status..."
                          className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-28"
                          autoFocus />
                        <button onClick={() => { if (customStatus.trim()) updateOrderStatus(group.orderId, customStatus); }}
                          disabled={isUpdatingStatus}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                          {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                         <button onClick={() => setEditingStatus(null)}
                           className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                           <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {!isEditingTrk ? (
                      <button onClick={() => { setEditingTracking(group.orderId); setCustomTracking(group.trackingId || ""); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all font-medium">
                        <Truck className="w-3 h-3" /> {group.trackingId ? "Edit Tracking" : "Add Tracking"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input type="text" value={customTracking}
                          onChange={e => setCustomTracking(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && customTracking.trim()) updateTrackingID(group.orderId, customTracking); }}
                          placeholder="Tracking ID or URL..."
                          className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-40"
                          autoFocus />
                        <button onClick={() => { if (customTracking.trim()) updateTrackingID(group.orderId, customTracking); }}
                          disabled={isUpdatingTrk}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                          {isUpdatingTrk ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setEditingTracking(null)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {group.trackingId && !isEditingTrk && (
                      <a href={group.trackingId.startsWith("http") ? group.trackingId : `https://www.ship24.com/tracking/${group.trackingId}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all font-medium">
                        <ExternalLink className="w-3 h-3" /> Track
                      </a>
                    )}

                    <button onClick={() => setExpandedOrder(isExpanded ? null : group.orderId)}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                      {isExpanded ? "Hide" : "Details"}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Customer</p>
                          <p className="text-sm text-gray-900 font-medium">{group.first.Name}</p>
                          <p className="text-xs text-gray-500">{group.first.Email}</p>
                          <p className="text-xs text-gray-500">{group.first.Contact}</p>
                          <p className="text-xs text-gray-400">UID: <span className="font-mono">{group.first.uid}</span></p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Shipping</p>
                          <p className="text-sm text-gray-900">{group.first.Address}</p>
                          <p className="text-xs text-gray-500">Pincode: {group.first.Pincode}</p>
                          <p className="text-xs text-gray-500">Shipping: ₹{parseFloat(group.first["Shipping Cost"] || "0").toFixed(2)}</p>
                          <p className="text-xs text-gray-400">Payment: <span className="font-mono">{group.first.payment_id?.slice(0, 12)}...</span></p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Products</p>
                        <div className="space-y-2">
                          {group.items.map((item, idx) => (
                            <div key={idx}
                              className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.Product}</p>
                                <p className="text-xs text-gray-400">Qty: {item.Quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">₹{parseFloat(item["Total Price"]).toFixed(2)}</p>
                                <p className="text-xs text-gray-400">Commission: ₹{parseFloat(item.commission_earned || "0").toFixed(2)}</p>
                                <p className="text-xs text-emerald-600">You get: ₹{parseFloat(item.seller_payout || "0").toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          {group.items.length} product{group.items.length > 1 ? "s" : ""} &middot; Shipping ₹{group.shipping.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: <span className="text-lg font-bold text-gray-900">₹{group.orderTotal.toFixed(2)}</span>
                        </p>
                      </div>
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
