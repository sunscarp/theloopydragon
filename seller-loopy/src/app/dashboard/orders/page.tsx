"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/utils/supabase";
import {
  ShoppingBag, Loader2, Search, RefreshCw, Check,
  X, Truck, Package, Info, Clock, AlertTriangle, ArrowUpDown,
  Ban, ThumbsUp, Copy,
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

const STATUS_META: Record<string, { label: string; message: string; icon: any; color: string; badgeBg: string }> = {
  pending: {
    label: "Approval Needed",
    message: "Awaiting your acceptance.",
    icon: Clock,
    color: "text-amber-600",
    badgeBg: "bg-amber-100 text-amber-700 border-amber-200",
  },
  accepted: {
    label: "Accepted",
    message: "Order Placed: Will be dispatched within 2 days of order date.",
    icon: Check,
    color: "text-emerald-600",
    badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  processing: {
    label: "Processing",
    message: "Order is being prepared for dispatch.",
    icon: Clock,
    color: "text-blue-600",
    badgeBg: "bg-blue-100 text-blue-700 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    message: "Order has been shipped and is on its way.",
    icon: Truck,
    color: "text-purple-600",
    badgeBg: "bg-purple-100 text-purple-700 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    message: "Order has been delivered successfully.",
    icon: Check,
    color: "text-status-success",
    badgeBg: "bg-status-success/10 text-status-success border-status-success/20",
  },
  cancelled: {
    label: "Cancelled",
    message: "This order has been cancelled.",
    icon: AlertTriangle,
    color: "text-status-error",
    badgeBg: "bg-red-100 text-red-700 border-red-200",
  },
  rejected: {
    label: "Rejected",
    message: "This order was rejected.",
    icon: Ban,
    color: "text-red-600",
    badgeBg: "bg-red-100 text-red-700 border-red-200",
  },
};

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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ orderId: string; penalty: number } | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

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
        .select("order_id, Status, Tracking_ID, seller_action, payment_approval_status")
        .in("order_id", orderIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => {
        profileMap[p.order_id] = p;
      });
      setProfileOrders(profileMap);
    }
    setLoading(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!seller) return;
    setActionLoading(orderId);
    try {
      const res = await fetch("/api/sellers/orders/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          action: "accept",
          seller_id: seller.id,
          seller_email: seller.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order accepted");
        fetchOrders(seller.id);
      } else {
        toast.error(data.error || "Failed to accept");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setActionLoading(null);
  };

  const handleRejectClick = async (orderId: string) => {
    const total = orders
      .filter(o => o.order_id === orderId)
      .reduce((sum, o) => sum + (parseFloat(o["Total Price"]) || 0), 0);
    const penalty = Math.round(total * 0.05 * 100) / 100;
    setRejectModal({ orderId, penalty });
  };

  const confirmReject = async () => {
    if (!rejectModal || !seller) return;
    setRejecting(true);
    try {
      const res = await fetch("/api/sellers/orders/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: rejectModal.orderId,
          action: "reject",
          seller_id: seller.id,
          seller_email: seller.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order rejected and customer notified");
        fetchOrders(seller.id);
      } else {
        toast.error(data.error || "Failed to reject");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setRejecting(false);
    setRejectModal(null);
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
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, Status: newStatus } : o));
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

  const copyOrderId = async (orderId: string) => {
    await navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
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
      const profile = profileOrders[orderId] || {};
      const status = profile.Status || "pending";
      const trackingId = profile.Tracking_ID || "";
      const sellerAction = profile.seller_action || null;
      const orderTotal = items.reduce((sum, i) => sum + (parseFloat(i["Total Price"]) || 0), 0);
      const shipping = parseFloat(first["Shipping Cost"] || "0");
      return { orderId, items, status, trackingId, orderTotal, shipping, first, sellerAction };
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

  const formatDate = (d: string) => {
    if (!d) return "\u2014";
    return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ["bg-lavender-accent", "bg-secondary-container", "bg-surface-container-highest", "bg-surface-container"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const statusKey = (s: string) => {
    const lower = s.toLowerCase();
    if (STATUS_META[lower]) return lower;
    return "pending";
  };
  const getStatusMeta = (s: string) => STATUS_META[statusKey(s)] || STATUS_META.pending;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-deep-navy mb-1">Orders</h2>
          <p className="text-on-surface-variant font-body-md flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-[18px] h-[18px]" />
              <span>{orders.length} items sold</span>
            </span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span className="font-bold text-primary">₹{totalRevenue.toFixed(2)} total</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span>{groupedOrders.length} orders</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input type="text" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search orders..."
              className="bg-surface-container-lowest border-none rounded-full pl-10 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-lavender-accent w-48 lg:w-64" />
          </div>
          <button onClick={() => fetchOrders(seller?.id)}
            className="bg-white hover:bg-surface-container-high border border-outline-variant/30 text-deep-navy flex items-center gap-2 px-4 py-2 rounded-lg transition-all active:scale-95 text-sm font-semibold">
            <RefreshCw className="w-[20px] h-[20px]" />
            <span>Refresh</span>
          </button>
          <div className="h-8 w-px bg-outline-variant/30 hidden md:block" />
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg p-1 flex items-center gap-1 flex-wrap">
            {(["date", "total", "status"] as const).map(field => (
              <button key={field}
                onClick={() => {
                  if (sortBy === field) setSortOrder(o => o === "desc" ? "asc" : "desc");
                  else { setSortBy(field); setSortOrder("desc"); }
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                  sortBy === field
                    ? "bg-deep-navy text-white shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}>
                Sort: {field.charAt(0).toUpperCase() + field.slice(1)}
                {sortBy === field && (
                  <ArrowUpDown className={`w-[14px] h-[14px] transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white/80 backdrop-blur-sm border border-outline-variant/10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-surface-container-low flex items-center justify-center">
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
        <div className="space-y-4">
          {filteredAndSortedOrders.map(group => {
            const isExpanded = expandedOrder === group.orderId;
            const isEditingStatus = editingStatus === group.orderId;
            const isUpdatingStatus = updatingStatus === group.orderId;
            const isEditingTrk = editingTracking === group.orderId;
            const isUpdatingTrk = updatingTracking === group.orderId;
            const meta = getStatusMeta(group.status);
            const needsApproval = !group.sellerAction && group.status !== "Rejected" && group.status !== "rejected";
            const showTrackingButton = !needsApproval && !isEditingTrk;
            const isCopied = copiedOrderId === group.orderId;

            return (
              <div key={group.orderId}
                className={`bg-white/80 backdrop-blur-sm border border-outline-variant/10 rounded-xl p-6 transition-all ${needsApproval ? 'border-amber-300 bg-amber-50/30' : ''}`}>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-data-mono text-title-lg text-deep-navy inline-flex items-center gap-2">
                        <span className="cursor-pointer hover:text-purple-600 transition-colors" title={group.orderId} onClick={() => copyOrderId(group.orderId)}>#{group.orderId.slice(0, 10)}</span>
                        <button onClick={() => copyOrderId(group.orderId)}
                          className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {isCopied && <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>}
                      </span>
                      <span title={`Status: ${group.status}`}
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${meta.badgeBg}`}>
                        {needsApproval ? "Approval Needed" : STATUS_META[group.status.toLowerCase()] ? meta.label : group.status}
                      </span>
                      <span className="text-sm text-on-surface-variant">{formatDate(group.first["Order Date"])}</span>
                    </div>

                    <div className="space-y-2">
                      {STATUS_META[group.status.toLowerCase()] || needsApproval ? (
                        <p className={`text-sm flex items-center gap-1.5 ${meta.color}`}>
                          <meta.icon className="w-[18px] h-[18px]" />
                          {needsApproval ? "Awaiting your decision to accept or reject." : meta.message}
                        </p>
                      ) : (
                        <p className="text-sm text-on-surface-variant">{group.status}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(group.first.Name)} flex items-center justify-center text-deep-navy font-bold text-xs`}>
                            {getInitials(group.first.Name)}
                          </div>
                          <span className="text-sm text-deep-navy font-semibold">{group.first.Name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <Package className="w-[18px] h-[18px]" />
                          <span className="text-sm">{group.items.length} item{group.items.length > 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-2" title={`Item: ₹${group.orderTotal.toFixed(2)} + Shipping: ₹${group.shipping.toFixed(2)}`}>
                          <ShoppingBag className="w-[18px] h-[18px] text-primary" />
                          <span className="font-data-mono font-bold text-primary">₹{(group.orderTotal + group.shipping).toFixed(2)}</span>
                        </div>
                        {group.trackingId && (
                          <div className="flex items-center gap-2 text-on-surface-variant" title={`Tracking: ${group.trackingId}`}>
                            <Truck className="w-[18px] h-[18px]" />
                            <span className="text-sm font-mono">{group.trackingId.slice(0, 16)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 lg:border-l border-outline-variant/20 lg:pl-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {needsApproval && (
                        <>
                          <button onClick={() => setExpandedOrder(isExpanded ? null : group.orderId)}
                            className="px-4 py-2.5 border border-outline-variant/30 text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high transition-all">
                            Details
                          </button>
                          <button
                            onClick={() => handleAcceptOrder(group.orderId)}
                            disabled={actionLoading === group.orderId}
                            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            {actionLoading === group.orderId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ThumbsUp className="w-3.5 h-3.5" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectClick(group.orderId)}
                            disabled={actionLoading === group.orderId}
                            className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-1.5">
                            <Ban className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {!needsApproval && (
                        <>
                          <button onClick={() => setExpandedOrder(isExpanded ? null : group.orderId)}
                            className="px-4 py-2.5 border border-outline-variant/30 text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high transition-all">
                            {isExpanded ? "Hide" : "Details"}
                          </button>
                          {showTrackingButton && (
                            <button onClick={() => { setEditingTracking(group.orderId); setCustomTracking(group.trackingId || ""); }}
                              className="px-4 py-2.5 border border-outline-variant/30 text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high transition-all">
                              {group.trackingId ? "Edit Tracking" : "Add Tracking"}
                            </button>
                          )}
                          {!isEditingStatus ? (
                            <button onClick={() => { setEditingStatus(group.orderId); setCustomStatus(group.status); }}
                              className="px-4 py-2.5 bg-lavender-accent text-deep-navy rounded-lg text-xs font-bold hover:opacity-80 transition-all">
                              Change Status
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <input type="text" value={customStatus}
                                onChange={e => setCustomStatus(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" && customStatus.trim()) updateOrderStatus(group.orderId, customStatus); }}
                                placeholder="Enter status..."
                                className="px-2.5 py-2 text-xs bg-white border border-outline-variant/30 rounded-lg text-on-surface placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender-accent w-40"
                                autoFocus />
                              <button onClick={() => { if (customStatus.trim()) updateOrderStatus(group.orderId, customStatus); }}
                                disabled={isUpdatingStatus}
                                className="p-2 text-status-success hover:bg-status-success/10 rounded-lg transition-colors">
                                {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => setEditingStatus(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {isEditingTrk && (
                      <div className="flex items-center gap-1.5">
                        <input type="text" value={customTracking}
                          onChange={e => setCustomTracking(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && customTracking.trim()) updateTrackingID(group.orderId, customTracking); }}
                          placeholder="Tracking ID or URL..."
                          className="px-2.5 py-2 text-xs bg-white border border-outline-variant/30 rounded-lg text-on-surface placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender-accent w-32"
                          autoFocus />
                        <button onClick={() => { if (customTracking.trim()) updateTrackingID(group.orderId, customTracking); }}
                          disabled={isUpdatingTrk}
                          className="p-2 text-status-success hover:bg-status-success/10 rounded-lg transition-colors">
                          {isUpdatingTrk ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setEditingTracking(null)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {group.trackingId && !isEditingTrk && (
                      <a href={group.trackingId.startsWith("http") ? group.trackingId : `https://www.ship24.com/tracking/${group.trackingId}`}
                        target="_blank" rel="noopener noreferrer"
                        className="px-4 py-2.5 border border-outline-variant/30 text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high transition-all">
                        Track
                      </a>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-outline-variant/10">
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Customer</p>
                          <p className="text-sm text-deep-navy font-medium">{group.first.Name}</p>
                          <p className="text-xs text-gray-500">{group.first.Email}</p>
                          <p className="text-xs text-gray-500">{group.first.Contact}</p>
                          <p className="text-xs text-gray-400">UID: <span className="font-mono">{group.first.uid}</span></p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Shipping</p>
                          <p className="text-sm text-deep-navy">{group.first.Address}</p>
                          <p className="text-xs text-gray-500">Pincode: {group.first.Pincode}</p>
                          <p className="text-xs text-gray-500">Shipping: ₹{group.shipping.toFixed(2)}</p>
                          {group.trackingId && (
                            <p className="text-xs text-gray-500">
                              Tracking: <span className="font-mono">{group.trackingId}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            Payment ID: <span className="font-mono" title={group.first.payment_id}>{group.first.payment_id?.slice(0, 12)}...</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Products</p>
                        <div className="space-y-2">
                          {group.items.map((item, idx) => (
                            <div key={idx}
                              className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant/10">
                              <div>
                                <p className="text-sm font-medium text-deep-navy">{item.Product}</p>
                                <p className="text-xs text-gray-400">Qty: {item.Quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-deep-navy" title={`Total Price: ₹${parseFloat(item["Total Price"]).toFixed(2)}`}>
                                  ₹{parseFloat(item["Total Price"]).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400">Commission: ₹{parseFloat(item.commission_earned || "0").toFixed(2)}</p>
                                <p className="text-xs text-emerald-600">You get: ₹{parseFloat(item.seller_payout || "0").toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>Subtotal: ₹{group.orderTotal.toFixed(2)}</p>
                          <p>Shipping: ₹{group.shipping.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Total: <span className="text-lg font-bold text-deep-navy">₹{(group.orderTotal + group.shipping).toFixed(2)}</span>
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

      {/* Reject Confirmation Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !rejecting && setRejectModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6"
            onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Ban className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-deep-navy mb-2">Reject Order?</h3>
              <p className="text-sm text-gray-500">
                A <span className="font-bold text-red-600">5% penalty</span> of <span className="font-bold">₹{rejectModal.penalty.toFixed(2)}</span> will be deducted from your account.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> The penalty will be deducted immediately from your available balance. If your balance is insufficient, it will result in a negative balance that must be covered by future earnings.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                disabled={rejecting}
                className="flex-1 px-4 py-3 border border-outline-variant/30 text-on-surface-variant rounded-xl text-sm font-bold hover:bg-surface-container-high transition-all disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={rejecting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {rejecting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting...</>
                ) : (
                  <>Confirm Reject</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
