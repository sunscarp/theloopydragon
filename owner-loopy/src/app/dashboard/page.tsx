"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { storage } from "@/utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import {
  Package, ShoppingBag, Users, ClipboardList, Plus, Upload,
  Image as ImageIcon, Loader2, TrendingUp, DollarSign,
} from "lucide-react";

interface ProductFormData {
  Product: string; Quantity: number; Price: number; ImageUrl1: string;
  Weight: number; Length: number; Width: number; Height: number; Tag: string;
  ImageUrl2: string; ImageUrl3: string; ImageUrl4: string; ImageUrl5: string;
  Description: string; Material: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, sellers: 0, customOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({
    image1: false, image2: false, image3: false, image4: false, image5: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    Product: "", Quantity: 0, Price: 0, ImageUrl1: "", Weight: 0,
    Length: 0, Width: 0, Height: 0, Tag: "", ImageUrl2: "", ImageUrl3: "",
    ImageUrl4: "", ImageUrl5: "", Description: "", Material: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: products } = await supabase.from("Inventory").select("*", { count: "exact", head: true });
      const { count: orders } = await supabase.from("Your Profile").select("*", { count: "exact", head: true });
      const { count: sellers } = await supabase.from("sellers").select("*", { count: "exact", head: true }).neq("status", "removed");
      const { count: customOrders } = await supabase.from("Custom").select("*", { count: "exact", head: true });
      setStats({
        products: products || 0, orders: orders || 0,
        sellers: sellers || 0, customOrders: customOrders || 0,
      });

      const { data: recent } = await supabase
        .from("Your Profile")
        .select("order_id, Status, \"Order Date\", \"Tracking_ID\"")
        .order("Order Date", { ascending: false })
        .limit(5);
      setRecentOrders(recent || []);
    };
    fetchStats();
  }, []);

  const handleImageUpload = async (file: File, field: string, key: string) => {
    setUploadingImages(prev => ({ ...prev, [key]: true }));
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `product-images/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploadingImages(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Product || !formData.ImageUrl1) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setFormData({
          Product: "", Quantity: 0, Price: 0, ImageUrl1: "", Weight: 0,
          Length: 0, Width: 0, Height: 0, Tag: "", ImageUrl2: "", ImageUrl3: "",
          ImageUrl4: "", ImageUrl5: "", Description: "", Material: "",
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats.products, icon: Package, color: "from-purple-500 to-indigo-500" },
          { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "from-blue-500 to-cyan-500" },
          { label: "Sellers", value: stats.sellers, icon: Users, color: "from-emerald-500 to-teal-500" },
          { label: "Custom Orders", value: stats.customOrders, icon: ClipboardList, color: "from-orange-500 to-amber-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/orders", label: "Manage Orders", icon: ShoppingBag },
          { href: "/products", label: "Product Approval", icon: Package },
          { href: "/sellers", label: "Seller Management", icon: Users },
          { href: "/custom-orders", label: "Custom Orders", icon: ClipboardList },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-purple-200 hover:shadow-sm transition-all group"
          >
            <Icon className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">{label}</span>
          </Link>
        ))}
      </div>

      {/* Add Product Form + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Product Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Add Product</h2>
              <p className="text-xs text-slate-500">Add a new product to the inventory</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Product Name *</label>
                <input type="text" name="Product" value={formData.Product} required
                  onChange={e => setFormData(p => ({ ...p, Product: e.target.value }))}
                  className={inputClass} placeholder="Asymmetrical Beaded Earrings" />
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input type="number" name="Quantity" value={formData.Quantity || ""}
                  onChange={e => setFormData(p => ({ ...p, Quantity: parseFloat(e.target.value) || 0 }))}
                  className={inputClass} placeholder="999" />
              </div>
              <div>
                <label className={labelClass}>Price (₹)</label>
                <input type="number" name="Price" value={formData.Price || ""} step="0.01"
                  onChange={e => setFormData(p => ({ ...p, Price: parseFloat(e.target.value) || 0 }))}
                  className={inputClass} placeholder="100" />
              </div>
              <div>
                <label className={labelClass}>Weight (grams)</label>
                <input type="number" name="Weight" value={formData.Weight || ""} step="0.01"
                  onChange={e => setFormData(p => ({ ...p, Weight: parseFloat(e.target.value) || 0 }))}
                  className={inputClass} placeholder="120" />
              </div>
              <div>
                <label className={labelClass}>Length (cm)</label>
                <input type="number" name="Length" value={formData.Length || ""} step="0.1"
                  onChange={e => setFormData(p => ({ ...p, Length: parseFloat(e.target.value) || 0 }))}
                  className={inputClass} placeholder="0.5" />
              </div>
              <div>
                <label className={labelClass}>Width (cm)</label>
                <input type="number" name="Width" value={formData.Width || ""} step="0.1"
                  onChange={e => setFormData(p => ({ ...p, Width: parseFloat(e.target.value) || 0 }))}
                  className={inputClass} placeholder="0.5" />
              </div>
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input type="number" name="Height" value={formData.Height || ""} step="0.1"
                  onChange={e => setFormData(p => ({ ...p, Height: parseFloat(e.target.value) || 0 }))}
                  className={inputClass} placeholder="6" />
              </div>
              <div>
                <label className={labelClass}>Material</label>
                <input type="text" name="Material" value={formData.Material}
                  onChange={e => setFormData(p => ({ ...p, Material: e.target.value }))}
                  className={inputClass} placeholder="Beads, Chains" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className={labelClass}>Tags (comma-separated)</label>
              <input type="text" name="Tag" value={formData.Tag}
                onChange={e => setFormData(p => ({ ...p, Tag: e.target.value }))}
                className={inputClass} placeholder="Earrings, Jewellery, Beaded, Yellow" />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea name="Description" value={formData.Description} rows={3}
                onChange={e => setFormData(p => ({ ...p, Description: e.target.value }))}
                className={inputClass + " resize-none"} placeholder="Product description..." />
            </div>

            {/* Image Uploads */}
            <div>
              <label className={labelClass}>Product Images</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map(i => {
                  const field = `ImageUrl${i}` as keyof ProductFormData;
                  const key = `image${i}`;
                  const uploading = uploadingImages[key];
                  const hasUrl = formData[field];

                  return (
                    <div key={i} className="relative">
                      <label className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all
                        ${hasUrl ? "border-purple-300 bg-purple-50" : "border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50/50"}`}>
                        {uploading ? (
                          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                        ) : hasUrl ? (
                          <img src={String(formData[field])} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                            <span className="text-[10px] text-slate-400">Image {i}{i === 1 ? " *" : ""}</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, field, key);
                          }} />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={submitting || !formData.Product || !formData.ImageUrl1}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Add Product</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
                <p className="text-xs text-slate-500">Latest 5 orders</p>
              </div>
            </div>
            <Link href="/orders" className="text-xs text-purple-600 hover:text-purple-700 font-medium">View all</Link>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No orders yet</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.order_id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">#{order.order_id}</p>
                    <p className="text-xs text-slate-400">
                      {order["Order Date"] ? new Date(order["Order Date"]).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${
                    order.Status?.toLowerCase().includes("pending") ? "bg-amber-100 text-amber-700" :
                    order.Status?.toLowerCase().includes("delivered") ? "bg-emerald-100 text-emerald-700" :
                    order.Status?.toLowerCase().includes("cancelled") ? "bg-red-100 text-red-700" :
                    order.Status?.toLowerCase().includes("shipped") ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {order.Status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
