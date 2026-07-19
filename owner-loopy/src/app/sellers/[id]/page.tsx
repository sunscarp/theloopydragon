"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import {
  ArrowLeft, Package, ShoppingBag, DollarSign, Mail, Phone,
  MapPin, BadgeInfo, ExternalLink, Loader2, Percent, Edit3, Check, X, KeyRound, Save, Ban, RefreshCw, Smartphone, CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SellerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCommission, setEditingCommission] = useState(false);
  const [commissionRate, setCommissionRate] = useState("0");
  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [editingPassword, setEditingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deactivatingProduct, setDeactivatingProduct] = useState<number | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [profileMap, setProfileMap] = useState<Map<string, string>>(new Map());

  const handleSaveCommission = async () => {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Commission rate must be between 0 and 100");
      return;
    }
    const res = await fetch("/api/sellers/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: params.id, commission_rate: rate }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Commission rate updated");
      setEditingCommission(false);
      setSeller((prev: any) => ({ ...prev, commission_rate: rate }));
    } else {
      toast.error(data.error || "Failed to update");
    }
  };

  const handleSaveEmail = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
    setSaving(true);
    const res = await fetch("/api/sellers/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: params.id, email: email.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Email updated");
      setEditingEmail(false);
      setSeller((prev: any) => ({ ...prev, email: email.trim() }));
    } else {
      toast.error(data.error || "Failed to update email");
    }
    setSaving(false);
  };

  const handleSavePassword = async () => {
    if (!password || password.length < 4) { toast.error("Password must be at least 4 characters"); return; }
    setSaving(true);
    const res = await fetch("/api/sellers/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: params.id, password }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Password updated");
      setEditingPassword(false);
      setPassword("");
    } else {
      toast.error(data.error || "Failed to update password");
    }
    setSaving(false);
  };

  const toggleProductStatus = async (productId: number, newStatus: string) => {
    setDeactivatingProduct(productId);
    const { error } = await supabase.from("Inventory").update({ status: newStatus }).eq("id", productId);
    if (error) {
      toast.error("Failed to update product");
    } else {
      toast.success(`Product ${newStatus}`);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p));
    }
    setDeactivatingProduct(null);
  };

  useEffect(() => {
    if (!params.id) return;
    const fetchData = async () => {
      const { data: sellerData } = await supabase.from("sellers").select("*").eq("id", params.id).single();
      setSeller(sellerData);
      setCommissionRate(String(sellerData?.commission_rate ?? 0));
      setEmail(sellerData?.email || "");

      const { data: productData } = await supabase
        .from("Inventory").select("*").eq("seller_id", params.id).order("id", { ascending: false });
      setProducts(productData || []);

      const { data: orderData } = await supabase
        .from("Orders").select("*").eq("seller_id", params.id).order("Order Date", { ascending: false }).limit(20);
      setOrders(orderData || []);

      const orderIds = [...new Set((orderData || []).map((o: any) => o.order_id))];
      const profMap = new Map<string, string>();
      if (orderIds.length > 0) {
        const { data: profileData } = await supabase
          .from("Your Profile")
          .select("order_id, seller_action")
          .in("order_id", orderIds);
        profileData?.forEach((p: any) => profMap.set(p.order_id, p.seller_action));
      }
      setProfileMap(profMap);

      const { data: withdrawalData } = await supabase
        .from("withdrawal_requests")
        .select("amount, status")
        .eq("seller_id", params.id);
      setWithdrawals(withdrawalData || []);

      const { data: penaltyData } = await supabase
        .from("penalty_ledger")
        .select("amount")
        .eq("seller_id", params.id);
      setPenalties(penaltyData || []);

      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 font-medium">Seller not found</p>
      </div>
    );
  }

  const acceptedOrders = orders.filter((o: any) => profileMap.get(o.order_id) === "accepted");

  const totalRevenue = acceptedOrders.reduce((sum: number, o: any) => sum + (parseFloat(o["Total Price"]) || 0), 0);

  const totalPayoutsSum = acceptedOrders.reduce((sum: number, o: any) => {
    const total = parseFloat(o["Total Price"]) || 0;
    const shipping = parseFloat(o["Shipping Cost"]) || 0;
    const commission = parseFloat(o.commission_earned) || 0;
    return sum + total - total * 0.02 - commission + shipping;
  }, 0);

  const totalPenalties = penalties.reduce((sum: number, p: any) => sum + Math.abs(p.amount), 0);

  const paidViaWithdrawals = (withdrawals || [])
    .filter((w: any) => w.status === "paid")
    .reduce((sum: number, w: any) => sum + w.amount, 0);

  const paidOut = paidViaWithdrawals;
  const pendingPayout = totalPayoutsSum - paidViaWithdrawals - totalPenalties;

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700",
      removed: "bg-red-100 text-red-600",
    };
    return colors[status] || "bg-slate-100 text-slate-500";
  };

  const inputClass = "w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all";

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Sellers
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          {seller.logo_url ? (
            <img src={seller.logo_url} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{seller.shop_name?.[0] || "S"}</span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{seller.shop_name}</h1>
              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(seller.status)}`}>
                {seller.status}
              </span>
            </div>
            <p className="text-slate-500">/{seller.slug}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Products", value: products.length, icon: Package, color: "from-purple-500 to-indigo-500" },
            { label: "Orders", value: acceptedOrders.length, icon: ShoppingBag, color: "from-blue-500 to-cyan-500" },
            { label: "Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
            { label: "Paid Out", value: `₹${paidOut.toFixed(2)}`, icon: CheckCircle, color: "from-emerald-500 to-teal-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-4 text-center">
              <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {totalPenalties > 0 && (
          <p className="text-xs text-red-600 text-center mt-3">Penalties: -₹{totalPenalties.toFixed(2)}</p>
        )}
        {pendingPayout > 0 && (
          <p className="text-xs text-amber-600 text-center mt-3">₹{pendingPayout.toFixed(2)} pending payout</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Products ({products.length})</h2>
            {products.length === 0 ? (
              <p className="text-sm text-slate-400">No products yet</p>
            ) : (
              <div className="space-y-2">
                {products.map((p: any) => (
                  <div key={p.id}
                    className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {p.ImageUrl1 ? (
                        <img src={p.ImageUrl1} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-700">{p.Product}</p>
                        <span className={`inline-flex mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          p.status === "active" || !p.status ? "bg-emerald-100 text-emerald-700" :
                          p.status === "deactivated" ? "bg-slate-100 text-slate-600" :
                          p.status === "pending_approval" ? "bg-amber-100 text-amber-700" :
                          p.status === "rejected" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                        }`}>{p.status || "active"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 mr-2">₹{p.Price}</span>
                      {(p.status === "active" || !p.status) ? (
                        <button onClick={() => toggleProductStatus(p.id, "deactivated")} disabled={deactivatingProduct === p.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Deactivate">
                          {deactivatingProduct === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        </button>
                      ) : p.status === "deactivated" ? (
                        <button onClick={() => toggleProductStatus(p.id, "active")} disabled={deactivatingProduct === p.id}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Reactivate">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Email</p>
                  {editingEmail ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={inputClass} />
                      <button onClick={handleSaveEmail} disabled={saving}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => { setEditingEmail(false); setEmail(seller.email); }}
                        className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-medium text-slate-700">{seller.email}</span>
                      <button onClick={() => setEditingEmail(true)}
                        className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <KeyRound className="w-4 h-4 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Password</p>
                  {editingPassword ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input type="password" value={password} placeholder="New password"
                        onChange={e => setPassword(e.target.value)}
                        className={inputClass + " w-32"} />
                      <button onClick={handleSavePassword} disabled={saving}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => { setEditingPassword(false); setPassword(""); }}
                        className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-slate-400">••••••••</span>
                      <button onClick={() => setEditingPassword(true)}
                        className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm text-slate-700">{seller.phone || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">UPI ID (for payouts)</p>
                  <p className="text-sm text-slate-700">{seller.upi_id || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Percent className="w-4 h-4 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Commission Rate</p>
                  {editingCommission ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="relative w-24">
                        <input type="number" value={commissionRate} min={0} max={100} step={0.5}
                          onChange={e => setCommissionRate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none pr-7" />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                      </div>
                      <button onClick={handleSaveCommission}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setEditingCommission(false); setCommissionRate(String(seller.commission_rate ?? 0)); }}
                        className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-medium text-slate-700">{seller.commission_rate ?? 0}%</span>
                      <button onClick={() => setEditingCommission(true)}
                        className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {seller.pickup_address && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Pickup Address</h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-700">{seller.pickup_address.address}</p>
                  <p className="text-sm text-slate-500">
                    {seller.pickup_address.city}, {seller.pickup_address.state} — {seller.pickup_address.pincode}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
