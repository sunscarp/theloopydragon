"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/utils/supabase";
import {
  Search, ArrowUpDown, Loader2, ExternalLink, Package,
  MapPin, CreditCard, RefreshCw, X, Check, Pencil,
} from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  Product?: string; product_name?: string; quantity?: number;
  Quantity?: number; qty?: number; Price?: number; price?: number;
  keyChain?: boolean; giftWrap?: boolean; customMessage?: string;
}

interface OrderDetails {
  "Total Price"?: number; Address?: string; Pincode?: string;
  "Order Date"?: string; "Shipping Cost"?: number; uid?: string;
}

interface Order {
  order_id: string; Status: string; "Order Date": string;
  Products: Product[] | string; uid: string; Orders?: OrderDetails;
  Tracking_ID?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "total" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [customStatus, setCustomStatus] = useState("");
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [customTracking, setCustomTracking] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: sellerOrderIds } = await supabase
        .from("Orders")
        .select("order_id")
        .not("seller_id", "is", null);

      const excludedIds = new Set((sellerOrderIds || []).map(o => o.order_id));

      const { data: profileData } = await supabase
        .from("Your Profile")
        .select('order_id, Status, "Order Date", Products, uid, Tracking_ID')
        .order("Order Date", { ascending: false });

      const { data: ordersData } = await supabase
        .from("Orders")
        .select('order_id, "Total Price", Address, Pincode, "Order Date", "Shipping Cost", uid');

      const ordersMap = new Map<string, OrderDetails>();
      ordersData?.forEach(o => ordersMap.set(o.order_id, o));

      setOrders((profileData || [])
        .filter(p => !excludedIds.has(p.order_id))
        .map(p => ({
        ...p, Orders: ordersMap.get(p.order_id) || {},
      })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    const { error } = await supabase.from("Your Profile").update({ Status: newStatus }).eq("order_id", orderId);
    if (error) { toast.error("Failed to update status"); setUpdatingStatus(null); return; }
    setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, Status: newStatus } : o));
    setSelectedOrder(prev => prev?.order_id === orderId ? { ...prev, Status: newStatus } : prev);
    setEditingStatus(null);
    setUpdatingStatus(null);
    toast.success("Status updated");
  };

  const updateTracking = async (orderId: string, trackingId: string) => {
    const { error } = await supabase.from("Your Profile").update({ Tracking_ID: trackingId }).eq("order_id", orderId);
    if (error) { toast.error("Failed to update tracking"); return; }
    setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, Tracking_ID: trackingId } : o));
    setEditingTracking(null);
    toast.success("Tracking ID updated");
  };

  const parseProducts = (products: Product[] | string): Product[] => {
    try {
      if (typeof products === "string") return JSON.parse(products);
      if (products && typeof products === "object") return Array.isArray(products) ? products : [products];
      return [];
    } catch { return []; }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(o =>
      o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.Orders?.Address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortBy === "date") { aVal = new Date(a["Order Date"] || "").getTime(); bVal = new Date(b["Order Date"] || "").getTime(); }
      else if (sortBy === "total") { aVal = a.Orders?.["Total Price"] || 0; bVal = b.Orders?.["Total Price"] || 0; }
      else { aVal = a.Status; bVal = b.Status; }
      return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    return filtered;
  }, [orders, searchTerm, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("pending")) return "bg-amber-100 text-amber-700 border-amber-200";
    if (s.includes("process")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (s.includes("ship")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (s.includes("deliver")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s.includes("cancel")) return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const calculateTotal = (products: Product[]) =>
    products.reduce((sum, p) => sum + ((p.Price || p.price || 0) * (p.quantity || p.Quantity || p.qty || 0)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Search & Sort */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID, UID, or Address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-800 placeholder:text-slate-400" />
          </div>
          <div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-700">
              <option value="date">Sort by Date</option>
              <option value="total">Sort by Total</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
          <div>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-700">
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No orders found</p>
          <p className="text-sm text-slate-400 mt-1">{searchTerm ? "Try adjusting your search" : "Orders will appear here"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map(order => {
            const products = parseProducts(order.Products);
            const total = calculateTotal(products);
            const shipping = order.Orders?.["Shipping Cost"] || 0;

            return (
              <div key={order.order_id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800 cursor-pointer hover:text-purple-600 transition-colors" title={order.order_id} onClick={() => { navigator.clipboard.writeText(order.order_id); toast.success("Order ID copied!"); }}>#{order.order_id}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {order["Order Date"] ? new Date(order["Order Date"]).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      }) : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingStatus === order.order_id ? (
                      <div className="flex items-center gap-1">
                        <input type="text" value={customStatus} onChange={e => setCustomStatus(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && customStatus.trim()) updateStatus(order.order_id, customStatus); }}
                          className="w-40 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                          placeholder="Enter status..." autoFocus />
                        <button onClick={() => { setEditingStatus(null); setCustomStatus(""); }}
                          className="p-1 text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingStatus(order.order_id); setCustomStatus(order.Status); }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-all hover:opacity-80 ${getStatusColor(order.Status)}`}>
                        {order.Status}
                        <Pencil className="w-3 h-3 opacity-50" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-1.5 mb-4">
                  {products.slice(0, 3).map((prod, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 truncate max-w-[60%]">
                        {prod.Product || prod.product_name || "Unknown"}
                      </span>
                      <span className="text-slate-500 text-xs whitespace-nowrap">
                        x{prod.quantity || prod.Quantity || prod.qty || 0} — ₹{((prod.Price || prod.price || 0) * (prod.quantity || prod.Quantity || prod.qty || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {products.length > 3 && (
                    <p className="text-xs text-slate-400">+{products.length - 3} more items</p>
                  )}
                  {(products[0]?.keyChain || products[0]?.giftWrap) && (
                    <div className="flex gap-1.5 mt-1">
                      {products[0]?.keyChain && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">+Keychain</span>}
                      {products[0]?.giftWrap && <span className="text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded">+Gift Wrap</span>}
                    </div>
                  )}
                </div>

                {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[140px]">{order.Orders?.Address || "No address"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">₹{(total + shipping).toFixed(2)}</span>
                      {shipping > 0 && <span className="text-slate-400">(+₹{shipping} shipping)</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1 p-1.5 text-xs text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View details">
                      <ExternalLink className="w-3.5 h-3.5" /> Details
                    </button>
                    {/* Tracking */}
                    {editingTracking === order.order_id ? (
                      <div className="flex items-center gap-1">
                        <input type="text" value={customTracking} onChange={e => setCustomTracking(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && customTracking.trim()) updateTracking(order.order_id, customTracking); }}
                          className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none"
                          placeholder="Tracking ID..." autoFocus />
                        <button onClick={() => setEditingTracking(null)} className="p-1 text-slate-400 hover:text-slate-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : order.Tracking_ID ? (
                      <a href={order.Tracking_ID.startsWith("http") ? order.Tracking_ID : `https://www.ship24.com/tracking/${order.Tracking_ID}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
                        <ExternalLink className="w-3 h-3" /> Track
                      </a>
                    ) : (
                      <button onClick={() => { setEditingTracking(order.order_id); setCustomTracking(""); }}
                        className="text-xs text-slate-400 hover:text-slate-600 font-medium">
                        + Add Tracking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Order #{selectedOrder.order_id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedOrder.Status)}`}>
                    {selectedOrder.Status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Order Date</p>
                  <p className="text-sm text-slate-700">{new Date(selectedOrder["Order Date"] || "").toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Customer</p>
                  <p className="text-sm text-slate-700 font-mono text-xs">{selectedOrder.uid || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tracking</p>
                  {selectedOrder.Tracking_ID ? (
                    <a href={selectedOrder.Tracking_ID.startsWith("http") ? selectedOrder.Tracking_ID : `https://www.ship24.com/tracking/${selectedOrder.Tracking_ID}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                      {selectedOrder.Tracking_ID} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">Not set</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Shipping Cost</p>
                  <p className="text-sm text-slate-700">₹{(selectedOrder.Orders?.["Shipping Cost"] || 0).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Products ({parseProducts(selectedOrder.Products).length})</h3>
                <div className="divide-y divide-slate-100">
                  {parseProducts(selectedOrder.Products).map((prod, idx) => {
                    const qty = prod.quantity || prod.Quantity || prod.qty || 0;
                    const price = prod.Price || prod.price || 0;
                    const addonPrice = ((prod.keyChain ? 10 : 0) + (prod.giftWrap ? 10 : 0)) * qty;
                    return (
                      <div key={idx} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{prod.Product || prod.product_name}</p>
                          <div className="flex gap-2 text-xs text-slate-400 mt-0.5">
                            <span>Qty: {qty}</span>
                            {prod.keyChain && <span>+Keychain</span>}
                            {prod.giftWrap && <span>+Gift Wrap</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">₹{(price * qty + addonPrice).toFixed(2)}</p>
                          <p className="text-xs text-slate-400">₹{price}/pc</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedOrder.Orders?.Address && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Shipping Address</h3>
                  <p className="text-sm text-slate-600">{selectedOrder.Orders.Address}</p>
                  {selectedOrder.Orders.Pincode && <p className="text-sm text-slate-500">PIN: {selectedOrder.Orders.Pincode}</p>}
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-700">₹{calculateTotal(parseProducts(selectedOrder.Products)).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Shipping</span><span className="text-slate-700">₹{(selectedOrder.Orders?.["Shipping Cost"] || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100"><span className="text-slate-800">Total</span><span className="text-purple-700">₹{(calculateTotal(parseProducts(selectedOrder.Products)) + (selectedOrder.Orders?.["Shipping Cost"] || 0)).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
