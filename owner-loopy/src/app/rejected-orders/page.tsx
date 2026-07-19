"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/utils/supabase";
import {
  Search, Loader2, RefreshCw, Check, AlertTriangle,
  Package, Ban, Clock, ThumbsDown,
} from "lucide-react";
import toast from "react-hot-toast";

interface RejectedOrder {
  order_id: string;
  Status: string;
  "Order Date": string;
  Products: any;
  uid: string;
  Tracking_ID?: string;
  seller_action: string;
  seller_action_at: string;
  refund_initiated: boolean;
  payment_approval_status?: string;
  Orders?: {
    "Total Price"?: number;
    Address?: string;
    Pincode?: string;
    "Shipping Cost"?: number;
    Name?: string;
    Email?: string;
  };
}

export default function RejectedOrdersPage() {
  const [orders, setOrders] = useState<RejectedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);
  const [processingCancel, setProcessingCancel] = useState<string | null>(null);
  const [processingManualReject, setProcessingManualReject] = useState<string | null>(null);

  const fetchRejectedOrders = async () => {
    setLoading(true);
    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

      const { data: sellerOrderIds } = await supabase
        .from("Orders")
        .select("order_id")
        .not("seller_id", "is", null);

      const sellerIdSet = new Set((sellerOrderIds || []).map(o => o.order_id));

      if (sellerIdSet.size === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("Your Profile")
        .select('order_id, Status, "Order Date", Products, uid, Tracking_ID, seller_action, seller_action_at, refund_initiated, payment_approval_status')
        .in("order_id", [...sellerIdSet])
        .order("Order Date", { ascending: false });

      const { data: ordersData } = await supabase
        .from("Orders")
        .select('order_id, "Total Price", Address, Pincode, "Shipping Cost", Name, Email');

      const ordersMap = new Map<string, any>();
      ordersData?.forEach(o => ordersMap.set(o.order_id, o));

      const sellerOrders = (profileData || []).map(p => ({
        ...p,
        Orders: ordersMap.get(p.order_id) || {},
      }));

      const rejected = sellerOrders.filter(
        (o: any) => o.seller_action === "rejected"
      );

      const stale = sellerOrders.filter(
        (o: any) =>
          !o.seller_action &&
          o["Order Date"] &&
          new Date(o["Order Date"]).getTime() < new Date(twoDaysAgo).getTime()
      );

      setOrders([...stale, ...rejected]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load rejected orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRejectedOrders(); }, []);

  const processRefund = async (orderId: string) => {
    setProcessingRefund(orderId);
    const order = orders.find(o => o.order_id === orderId);
    if (!order) { toast.error("Order not found"); setProcessingRefund(null); return; }

    const { error } = await supabase
      .from("Your Profile")
      .update({ refund_initiated: true })
      .eq("order_id", orderId);

    if (error) {
      toast.error("Failed to process refund");
      setProcessingRefund(null);
      return;
    }

    try {
      await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: order.Orders?.Email || "",
          subject: `Refund Initiated for Order #${orderId} - The Loopy Dragon`,
          html: `
            <h2>Refund Initiated - The Loopy Dragon</h2>
            <p>Dear Customer,</p>
            <p>We have initiated the refund for your order <b>#${orderId}</b>.</p>
            <p>The amount will be credited back to your original payment method within <b>2 business days</b>.</p>
            <p>We sincerely apologise for the inconvenience caused.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p style="margin-top:20px;text-align:center;color:#666;">— The Loopy Dragon Team 🐲</p>
          `,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send refund email:", emailError);
    }

    setOrders(prev => prev.map(o =>
      o.order_id === orderId ? { ...o, refund_initiated: true } : o
    ));
    toast.success("Refund processed successfully");
    setProcessingRefund(null);
  };

  const manualRejectRefund = async (orderId: string) => {
    setProcessingManualReject(orderId);
    try {
      const res = await fetch("/api/sellers/orders/manual-reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order rejected, penalty ₹${data.penaltyAmount} applied`);
        fetchRejectedOrders();
      } else {
        toast.error(data.error || "Failed to reject order");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setProcessingManualReject(null);
  };

  const autoCancelOrder = async (orderId: string) => {
    setProcessingCancel(orderId);
    const order = orders.find(o => o.order_id === orderId);
    if (!order) { toast.error("Order not found"); setProcessingCancel(null); return; }

    const { error } = await supabase
      .from("Your Profile")
      .update({
        seller_action: "auto_cancelled",
        seller_action_at: new Date().toISOString(),
        Status: "auto_cancelled",
        refund_initiated: true,
      })
      .eq("order_id", orderId);

    if (error) {
      toast.error("Failed to cancel order");
      setProcessingCancel(null);
      return;
    }

    try {
      await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: order.Orders?.Email || "",
          subject: `Order #${orderId} Cancelled - The Loopy Dragon`,
          html: `
            <h2>Order Cancellation - The Loopy Dragon</h2>
            <p>Dear Customer,</p>
            <p>We regret to inform you that your order <b>#${orderId}</b> has been cancelled as the seller did not respond within the expected timeframe.</p>
            <p>We sincerely apologise for the inconvenience caused.</p>
            <p><b>Refund Information:</b></p>
            <ul>
              <li>Your full refund will be processed within <b>2 business days</b>.</li>
              <li>The refund will be credited back to your original payment method.</li>
            </ul>
            <p>If you have any questions, please contact our support team.</p>
            <p>Thank you for your understanding.</p>
            <p style="margin-top:20px;text-align:center;color:#666;">— The Loopy Dragon Team 🐲</p>
          `,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }

    setOrders(prev => prev.map(o =>
      o.order_id === orderId ? { ...o, seller_action: "auto_cancelled", refund_initiated: true, Status: "auto_cancelled" } : o
    ));
    toast.success("Order cancelled and customer notified");
    setProcessingCancel(null);
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const q = searchTerm.toLowerCase();
    return orders.filter(o =>
      o.order_id.toLowerCase().includes(q) ||
      o.uid?.toLowerCase().includes(q) ||
      o.Orders?.Address?.toLowerCase().includes(q) ||
      o.Orders?.Name?.toLowerCase().includes(q)
    );
  }, [orders, searchTerm]);

  const staleOrders = filteredOrders.filter(o => !o.seller_action);
  const rejectedOrders = filteredOrders.filter(o => o.seller_action === "rejected");
  const autoCancelledOrders = filteredOrders.filter(o => o.seller_action === "auto_cancelled");

  const parseProducts = (products: any): any[] => {
    try {
      if (typeof products === "string") return JSON.parse(products);
      if (products && typeof products === "object") return Array.isArray(products) ? products : [products];
      return [];
    } catch { return []; }
  };

  const formatDate = (d: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading rejected orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rejected Orders & Approval Escalation</h1>
          <p className="text-sm text-slate-500 mt-1">
            {staleOrders.length} pending action &middot; {rejectedOrders.length} rejected &middot; {autoCancelledOrders.length} auto-cancelled
          </p>
        </div>
        <button onClick={fetchRejectedOrders} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, UID, Name, or Address..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-800 placeholder:text-slate-400" />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No rejected or pending orders</p>
          <p className="text-sm text-slate-400 mt-1">All seller orders are being handled</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stale Orders - Approval Escalation */}
          {staleOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Approval Escalation (&gt;48h no response)
                <span className="text-xs font-normal text-slate-400">({staleOrders.length})</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {staleOrders.map(order => {
                  const products = parseProducts(order.Products);
                  const itemTotal = (order.Orders?.["Total Price"] || 0);
                  const penaltyEstimate = Math.round(itemTotal * 0.05 * 100) / 100;
                  return (
                    <div key={order.order_id} className="bg-white rounded-2xl border border-amber-300 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-slate-800">#{order.order_id}</p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            Ordered {formatDate(order["Order Date"])}
                          </p>
                          {order.Orders?.Name && (
                            <p className="text-xs text-slate-500 mt-1">Customer: {order.Orders.Name}</p>
                          )}
                        </div>
                        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full border bg-amber-100 text-amber-700 border-amber-200">
                          Stale
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mb-3">
                        {products.slice(0, 2).map((p: any, i: number) => (
                          <div key={i} className="truncate">{p.Product || p.product_name}</div>
                        ))}
                        {products.length > 2 && <div className="text-slate-400">+{products.length - 2} more</div>}
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        Order total: ₹{itemTotal.toFixed(2)} &middot; Penalty if rejected: <span className="text-red-600 font-semibold">-₹{penaltyEstimate.toFixed(2)}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => manualRejectRefund(order.order_id)}
                          disabled={processingManualReject === order.order_id}
                          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                          {processingManualReject === order.order_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ThumbsDown className="w-3.5 h-3.5" />
                          )}
                          Manual Reject & Refund
                        </button>
                        <button
                          onClick={() => autoCancelOrder(order.order_id)}
                          disabled={processingCancel === order.order_id}
                          className="flex-1 px-4 py-2.5 bg-slate-600 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                          {processingCancel === order.order_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          Cancel & Refund (no penalty)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rejected by Seller */}
          {rejectedOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Rejected by Seller
                <span className="text-xs font-normal text-slate-400">({rejectedOrders.length})</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {rejectedOrders.map(order => {
                  const products = parseProducts(order.Products);
                  return (
                    <div key={order.order_id} className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-slate-800">#{order.order_id}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ordered {formatDate(order["Order Date"])}
                          </p>
                          {order.Orders?.Name && (
                            <p className="text-xs text-slate-500 mt-1">Customer: {order.Orders.Name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {order.refund_initiated ? (
                            <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-700 border-green-200">
                              Refunded
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-700 border-red-200">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mb-3">
                        {products.slice(0, 2).map((p: any, i: number) => (
                          <div key={i} className="truncate">{p.Product || p.product_name}</div>
                        ))}
                        {products.length > 2 && <div className="text-slate-400">+{products.length - 2} more</div>}
                      </div>
                      {!order.refund_initiated && (
                        <button
                          onClick={() => processRefund(order.order_id)}
                          disabled={processingRefund === order.order_id}
                          className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                          {processingRefund === order.order_id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Process Refund
                        </button>
                      )}
                      {order.refund_initiated && (
                        <div className="w-full px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium text-center border border-green-200">
                          Refund processed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auto-Cancelled */}
          {autoCancelledOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Ban className="w-5 h-5 text-slate-500" />
                Auto-Cancelled
                <span className="text-xs font-normal text-slate-400">({autoCancelledOrders.length})</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {autoCancelledOrders.map(order => {
                  const products = parseProducts(order.Products);
                  return (
                    <div key={order.order_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 opacity-75">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-slate-800">#{order.order_id}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cancelled {formatDate(order.seller_action_at)}
                          </p>
                          {order.Orders?.Name && (
                            <p className="text-xs text-slate-500 mt-1">Customer: {order.Orders.Name}</p>
                          )}
                        </div>
                        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full border bg-slate-100 text-slate-600 border-slate-200">
                          {order.refund_initiated ? "Refunded" : "Cancelled"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {products.slice(0, 2).map((p: any, i: number) => (
                          <div key={i} className="truncate">{p.Product || p.product_name}</div>
                        ))}
                        {products.length > 2 && <div className="text-slate-400">+{products.length - 2} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
