"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  ClipboardList, Mail, CheckCircle, XCircle, Reply, Plus, Trash2,
  Loader2, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

type CustomOrder = {
  id: number; uid: string; "Full Name": string; Email: string;
  Phone: string; "Order Details": string; Quantity: string; Material: string;
  ImageUrl1?: string | null; ImageUrl2?: string | null; ImageUrl3?: string | null;
};

type ProductItem = {
  Product: string; Price: number; Quantity: number;
  "Total Price": string; "Shipping Cost": string;
  keyChain?: boolean; giftWrap?: boolean;
};

const sendMail = async (to: string, subject: string, body: string) => {
  try {
    const res = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to, subject, text: body,
        html: body.split("\n").map(l => `<p>${l}</p>`).join(""),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export default function CustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptingOrder, setAcceptingOrder] = useState<null | { id: number; uid?: string; email: string }>(null);
  const [products, setProducts] = useState<ProductItem[]>([{
    Product: "", Price: 0, Quantity: 1, "Total Price": "", "Shipping Cost": "",
  }]);
  const [acceptLoading, setAcceptLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("Custom")
        .select('id, uid, "Full Name", Email, Phone, "Order Details", Quantity, Material, ImageUrl1, ImageUrl2, ImageUrl3')
        .order("id", { ascending: false });
      if (!error) setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const generateOrderId = async () => {
    let orderId: string;
    let exists = true;
    while (exists) {
      orderId = `ODR-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data } = await supabase.from("Your Profile").select("order_id").eq("order_id", orderId);
      exists = !!(data && data.length > 0);
    }
    return orderId!;
  };

  const handleReply = async (order: CustomOrder) => {
    setActionLoading(true);
    const ok = await sendMail(order.Email, "Reply to your custom order", replyText);
    setActionLoading(false);
    if (ok) {
      toast.success("Reply sent!");
      setReplyingId(null);
      setReplyText("");
    } else {
      toast.error("Failed to send reply");
    }
  };

  const handleAccept = (order: CustomOrder) => {
    setAcceptingOrder({ id: order.id, uid: order.uid, email: order.Email });
    setProducts([{ Product: "", Price: 0, Quantity: 1, "Total Price": "", "Shipping Cost": "" }]);
  };

  const updateProduct = (index: number, field: keyof ProductItem, value: string | number | boolean) => {
    const newProducts = [...products];
    if (field === "keyChain" || field === "giftWrap") {
      (newProducts[index] as any)[field] = value;
      const addonPrice = ((newProducts[index].keyChain ? 10 : 0) + (newProducts[index].giftWrap ? 10 : 0));
      newProducts[index]["Total Price"] = ((newProducts[index].Price + addonPrice) * newProducts[index].Quantity || 0).toFixed(2);
    } else if (field === "Shipping Cost") {
      newProducts[index] = { ...newProducts[index], [field]: value.toString() };
    } else {
      newProducts[index] = { ...newProducts[index], [field]: value };
      if (field === "Price" || field === "Quantity") {
        const price = newProducts[index].Price;
        const qty = newProducts[index].Quantity;
        const addonPrice = ((newProducts[index].keyChain ? 10 : 0) + (newProducts[index].giftWrap ? 10 : 0));
        newProducts[index]["Total Price"] = ((price + addonPrice) * qty || 0).toFixed(2);
      }
    }
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { Product: "", Price: 0, Quantity: 1, "Total Price": "", "Shipping Cost": "" }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) setProducts(products.filter((_, i) => i !== index));
  };

  const handleAcceptSubmit = async () => {
    const invalid = products.filter(p => !p.Product.trim() || p.Price <= 0 || p.Quantity <= 0);
    if (invalid.length > 0) {
      toast.error("Please fill in all product details");
      return;
    }
    setAcceptLoading(true);
    try {
      const orderId = await generateOrderId();
      const now = new Date().toISOString();
      const formattedProducts = products.map(p => ({
        Price: p.Price, Product: p.Product, Quantity: p.Quantity,
        "Total Price": (p.Price * p.Quantity).toFixed(2), "Shipping Cost": p["Shipping Cost"],
      }));
      const totalShipping = formattedProducts.reduce((s, p) => s + parseFloat(p["Shipping Cost"] || "0"), 0);
      const totalProducts = formattedProducts.reduce((s, p) => s + (p.Price * p.Quantity), 0);

      const { error } = await supabase.from("Your Profile").insert([{
        order_id: orderId, Status: "Pending Payment",
        "Order Date": now, Products: formattedProducts, uid: acceptingOrder?.uid,
      }]);
      if (error) throw error;

      const productsText = formattedProducts.map(p =>
        `${p.Product}: ${p.Quantity} x ₹${p.Price} = ₹${p["Total Price"]}`
      ).join("\n");

      await sendMail(acceptingOrder!.email, "Your Custom Order is Ready for Payment",
        `Your custom order has been accepted!\n\nOrder ID: ${orderId}\n\nProducts:\n${productsText}\n\nShipping: ₹${totalShipping}\nTotal: ₹${totalProducts + totalShipping}\n\nPay here: ${window.location.origin}/profile`
      );

      const { error: deleteError } = await supabase.from("Custom").delete().eq("id", acceptingOrder?.id);
      if (deleteError) throw deleteError;

      setOrders(prev => prev.filter(o => o.id !== acceptingOrder?.id));
      toast.success("Order accepted and customer notified!");
      setAcceptingOrder(null);
    } catch (e: any) {
      toast.error(e.message || "Error accepting order");
    }
    setAcceptLoading(false);
  };

  const handleReject = async (order: CustomOrder) => {
    setActionLoading(true);
    const ok = await sendMail(order.Email, "Custom Order Update",
      "We're sorry, but we are unable to accept your custom order at this time.");
    if (ok) {
      await supabase.from("Custom").delete().eq("id", order.id);
      setOrders(prev => prev.filter(o => o.id !== order.id));
      toast.success("Order rejected and customer notified");
    } else {
      toast.error("Failed to send rejection");
    }
    setActionLoading(false);
  };

  const ImageWithFallback = ({ src, alt }: { src: string | null; alt: string }) => {
    const [error, setError] = useState(false);
    if (!src) return null;
    return error ? (
      <div className="w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200">
        <span className="text-xs text-slate-400">No image</span>
      </div>
    ) : (
      <img src={src} alt={alt} onError={() => setError(true)}
        className="w-28 h-28 object-cover rounded-xl border border-slate-200" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Custom Orders</h1>
        <p className="text-sm text-slate-500 mt-1">{orders.length} pending custom orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No custom orders</p>
          <p className="text-sm text-slate-400 mt-1">Custom orders from customers will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map(order => (
            <div key={order.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 animate-fade-in">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">#{order.id}</p>
                  <p className="text-base font-semibold text-slate-700 mt-1">{order["Full Name"]}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Mail className="w-3 h-3" />
                  <span>{order.Email}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-slate-700">{order.Phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Quantity</p>
                    <p className="text-slate-700">{order.Quantity}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Material</p>
                  <p className="text-slate-700">{order.Material}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Order Details</p>
                  <p className="text-slate-600 bg-slate-50 rounded-lg p-3 mt-1 text-sm">{order["Order Details"]}</p>
                </div>
              </div>

              {/* Images */}
              {(order.ImageUrl1 || order.ImageUrl2 || order.ImageUrl3) && (
                <div className="flex gap-3 mb-4">
                  {[order.ImageUrl1, order.ImageUrl2, order.ImageUrl3].map((url, i) =>
                    url && <ImageWithFallback key={i} src={url} alt={`Image ${i + 1}`} />
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                {replyingId === order.id ? (
                  <div className="space-y-2">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                      rows={3} placeholder="Type your reply..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none text-slate-800" />
                    <div className="flex gap-2">
                      <button onClick={() => handleReply(order)} disabled={actionLoading || !replyText.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Reply className="w-4 h-4" />}
                        Send Reply
                      </button>
                      <button onClick={() => { setReplyingId(null); setReplyText(""); }}
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setReplyingId(order.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors w-full justify-center">
                    <Reply className="w-4 h-4" /> Reply via Email
                  </button>
                )}
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(order)} disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    <CheckCircle className="w-4 h-4" /> Accept
                  </button>
                  <button onClick={() => handleReject(order)} disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Modal */}
      {acceptingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setAcceptingOrder(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Accept Order — Add Products</h3>
            </div>
            <div className="p-6 space-y-4">
              {products.map((product, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-slate-700">Product {idx + 1}</h4>
                    {products.length > 1 && (
                      <button onClick={() => removeProduct(idx)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs text-slate-500 mb-1 block">Name *</label>
                      <input type="text" value={product.Product}
                        onChange={e => updateProduct(idx, "Product", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Price *</label>
                      <input type="number" step="0.01" value={product.Price || ""}
                        onChange={e => updateProduct(idx, "Price", parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Qty *</label>
                      <input type="number" value={product.Quantity || ""}
                        onChange={e => updateProduct(idx, "Quantity", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Shipping</label>
                      <input type="number" step="0.01" value={product["Shipping Cost"]}
                        onChange={e => updateProduct(idx, "Shipping Cost", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                    </div>
                    <div className="flex items-center gap-3 col-span-2">
                      <label className="flex items-center gap-1.5 text-xs text-slate-600">
                        <input type="checkbox" checked={!!product.keyChain}
                          onChange={e => updateProduct(idx, "keyChain", e.target.checked)} />
                        Keychain +₹10
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600">
                        <input type="checkbox" checked={!!product.giftWrap}
                          onChange={e => updateProduct(idx, "giftWrap", e.target.checked)} />
                        Gift Wrap +₹10
                      </label>
                    </div>
                  </div>
                  <div className="mt-3 text-right">
                    <span className="text-sm font-semibold text-purple-700">Total: ₹{product["Total Price"] || "0.00"}</span>
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <button onClick={addProduct}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                  <Plus className="w-4 h-4" /> Add Another Product
                </button>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="text-right text-lg font-bold text-slate-800 mb-4">
                  Grand Total: ₹{products.reduce((s, p) => s + parseFloat(p["Total Price"] || "0") + parseFloat(p["Shipping Cost"] || "0"), 0).toFixed(2)}
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setAcceptingOrder(null)} disabled={acceptLoading}
                    className="px-6 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAcceptSubmit} disabled={acceptLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    {acceptLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Accept & Notify
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
