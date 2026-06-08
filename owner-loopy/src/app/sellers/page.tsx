"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import {
  Users, Plus, X, Mail, KeyRound, Store, RefreshCw, Loader2, Trash2, DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", shop_name: "", commission_rate: "10" });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchSellers(); }, []);

  const fetchSellers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false });
    setSellers(data || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.shop_name) {
      toast.error("All fields are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/sellers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Seller created successfully");
        setShowAddModal(false);
        setFormData({ email: "", password: "", shop_name: "", commission_rate: "10" });
        fetchSellers();
      } else {
        toast.error(data.error || "Failed to create seller");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = async (id: string, shopName: string) => {
    if (!confirm(`Remove "${shopName}"? They will lose access to seller-loopy.`)) return;
    try {
      const res = await fetch("/api/sellers/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Seller removed");
        fetchSellers();
      } else {
        toast.error(data.error || "Failed to remove seller");
      }
    } catch {
      toast.error("Something went wrong");
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Seller Management</h1>
          <p className="text-sm text-slate-500 mt-1">{sellers.length} registered sellers</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchSellers}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add Seller
          </button>
        </div>
      </div>

      {/* Add Seller Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Add Seller</h2>
                  <p className="text-xs text-slate-500">Create a seller account</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-slate-400" />
                    Shop Name
                  </div>
                </label>
                <input type="text" value={formData.shop_name} required
                  onChange={e => setFormData(p => ({ ...p, shop_name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  placeholder="My Handicraft Store" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Email (Gmail)
                  </div>
                </label>
                <input type="email" value={formData.email} required
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  placeholder="seller@gmail.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    Password
                  </div>
                </label>
                <input type="password" value={formData.password} required minLength={4}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  placeholder="Set a password for the seller" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    Commission Rate (%)
                  </div>
                </label>
                <div className="relative">
                  <input type="number" value={formData.commission_rate} min={0} max={100} step={0.5}
                    onChange={e => setFormData(p => ({ ...p, commission_rate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all pr-8"
                    placeholder="10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 transition-all">
                  {creating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Create Seller</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sellers List */}
      {sellers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No sellers registered yet</p>
          <button onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add Your First Seller
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Shop</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Email</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Slug</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Joined</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map(seller => (
                  <tr key={seller.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/sellers/${seller.id}`)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {seller.logo_url ? (
                          <img src={seller.logo_url} alt="" className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{seller.shop_name?.[0] || "S"}</span>
                          </div>
                        )}
                        <span className={`font-medium ${seller.status === "removed" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {seller.shop_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{seller.email}</td>
                    <td className="px-5 py-4 text-slate-500">/{seller.slug}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                        seller.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : seller.status === "removed"
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {seller.status === "removed" ? "Removed" : seller.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {seller.created_at
                        ? new Date(seller.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                      {seller.status === "removed" ? (
                        <button onClick={async () => {
                          const res = await fetch("/api/sellers/update", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: seller.id, status: "active" }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            toast.success("Seller reactivated");
                            fetchSellers();
                          } else {
                            toast.error(data.error || "Failed to reactivate");
                          }
                        }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" /> Reactivate
                        </button>
                      ) : (
                        <button onClick={() => handleRemove(seller.id, seller.shop_name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
