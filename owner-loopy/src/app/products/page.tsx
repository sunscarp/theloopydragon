"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Package, CheckCircle, XCircle, Loader2, Filter, Ban, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from("Inventory")
      .select("*, sellers(shop_name, slug)")
      .order("id", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: number, status: string, reason = "") => {
    const update: any = { status };
    if (reason) update.rejection_reason = reason;
    const { error } = await supabase.from("Inventory").update(update).eq("id", id);
    if (error) {
      toast.error("Failed to update product");
    } else {
      toast.success(`Product ${status}`);
      fetchProducts();
    }
  };

  const handleReject = (id: number) => {
    setRejecting(id);
    setRejectReason("");
  };

  const confirmReject = () => {
    if (rejecting !== null && rejectReason.trim()) {
      updateStatus(rejecting, "rejected", rejectReason.trim());
      setRejecting(null);
      setRejectReason("");
    }
  };

  const filters = [
    { value: "all", label: "All Products", color: "bg-purple-100 text-purple-700" },
    { value: "active", label: "Active", color: "bg-emerald-100 text-emerald-700" },
    { value: "deactivated", label: "Deactivated", color: "bg-slate-100 text-slate-600" },
    { value: "pending_approval", label: "Pending Approval", color: "bg-amber-100 text-amber-700" },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  ];

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700",
      deactivated: "bg-slate-100 text-slate-600",
      pending_approval: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
      draft: "bg-slate-100 text-slate-600",
    };
    return colors[status] || "bg-slate-100 text-slate-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <p className="text-sm text-slate-500 mt-1">All products — approve, reject, or deactivate listings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              filter === f.value
                ? f.color + " ring-2 ring-offset-1 ring-slate-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Product</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Seller</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Price</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.ImageUrl1 ? (
                          <img src={p.ImageUrl1} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <span className="font-medium text-slate-800">{p.Product}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{p.sellers?.shop_name || "Platform"}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">₹{p.Price}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge(p.status)}`}>
                        {p.status || "active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === "active" || (!p.status) ? (
                          <>
                            {p.seller_id && (
                              <button onClick={() => updateStatus(p.id, "deactivated")}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors">
                                <Ban className="w-3.5 h-3.5" /> Deactivate
                              </button>
                            )}
                          </>
                        ) : p.status === "deactivated" ? (
                          <button onClick={() => updateStatus(p.id, "active")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" /> Reactivate
                          </button>
                        ) : p.status === "pending_approval" ? (
                          <>
                            <button onClick={() => updateStatus(p.id, "active")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={() => handleReject(p.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        ) : p.status === "rejected" && p.rejection_reason ? (
                          <span className="text-xs text-slate-400 italic" title={p.rejection_reason}>
                            Reason: {p.rejection_reason.length > 20 ? p.rejection_reason.slice(0, 20) + "..." : p.rejection_reason}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejecting !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setRejecting(null); setRejectReason(""); }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Reject Product</h3>
            <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejection.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              rows={3} placeholder="Enter rejection reason..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none text-slate-800 placeholder:text-slate-400" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setRejecting(null); setRejectReason(""); }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmReject} disabled={!rejectReason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
