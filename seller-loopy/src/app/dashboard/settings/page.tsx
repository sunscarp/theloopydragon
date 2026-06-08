"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import {
  Loader2, Truck, Smartphone, Lock, DollarSign,
  Eye, EyeOff, Store, Check, X, FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SellerSettingsPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) { router.push("/"); return; }
    const s = JSON.parse(stored);
    setSeller(s);
    setFreeDelivery(s.free_delivery ?? false);
    setUpiId(s.upi_id || "");
    setTermsAccepted(s.terms_accepted ?? false);
    setSlug(s.slug || "");
    setLogoUrl(s.logo_url || "");
    setBannerUrl(s.banner_url || "");
    setLoading(false);
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/sellers/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: seller.id,
        free_delivery: freeDelivery,
        upi_id: upiId,
        terms_accepted: termsAccepted,
        slug,
        logo_url: logoUrl,
        banner_url: bannerUrl,
      }),
    });
    const data = await res.json();
    if (data.success) {
      const updated = {
        ...seller,
        free_delivery: freeDelivery,
        upi_id: upiId,
        terms_accepted: termsAccepted,
        slug,
        logo_url: logoUrl,
        banner_url: bannerUrl,
      };
      localStorage.setItem("seller-loopy-auth", JSON.stringify(updated));
      setSeller(updated);
      toast.success("Settings saved");
    } else {
      toast.error(data.error || "Failed to save");
    }
    setSaving(false);
  };

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

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure your store preferences and payout details</p>
      </div>

      {/* Payment Preferences */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Payment Preferences</h2>
            <p className="text-xs text-gray-400">Control how customers pay for your products</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Free Delivery</p>
              <p className="text-xs text-gray-400">Offer free delivery on all orders from your store</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={freeDelivery}
              onChange={e => setFreeDelivery(e.target.checked)}
              className="sr-only peer" />
            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* UPI Payment Details */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">UPI Payment Details</h2>
            <p className="text-xs text-gray-400">Your commissions will be paid to this UPI ID via Razorpay</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">UPI ID / VPA</label>
            <input type="text" value={upiId}
              onChange={e => setUpiId(e.target.value)}
              className={inputClass} placeholder="sellername@upi" />
          </div>
          <p className="text-xs text-gray-400">Enter your UPI Virtual Payment Address (e.g. name@upi, name@okaxis, name@paytm). Payouts will be sent here via Razorpay.</p>
        </div>

      </div>

      {/* Terms & Conditions */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Seller Terms &amp; Conditions</h2>
            <p className="text-xs text-gray-400">You must accept the terms to receive payouts</p>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-3 border border-gray-100">
          <p className="font-semibold text-gray-800">The Loopy Dragon — Seller Terms &amp; Conditions</p>
          <p><strong>1. Introduction</strong><br />Welcome to The Loopy Dragon Marketplace! These Seller Terms govern your participation as a seller on our platform. By listing any product, you agree to be bound by these terms.</p>
          <p><strong>2. Fees &amp; Commission</strong><br />The Loopy Dragon currently charges 0% platform commission. A 2% Razorpay payment processing fee is deducted on every transaction. Commission rates may change with prior notice via email.</p>
          <p><strong>3. Orders &amp; Fulfilment</strong><br />You are responsible for packaging, shipping, and delivering products to buyers in India. Shipping timelines must be clearly stated. You bear responsibility for the order until it reaches the buyer.</p>
          <p><strong>4. Payments</strong><br />All buyer payments are processed via Razorpay. Payouts to your UPI account are made after deducting Razorpay fees (2%) and any applicable platform commission. The Loopy Dragon may withhold payouts in cases of disputes or suspected fraud.</p>
          <p><strong>5. Returns &amp; Refunds</strong><br />You must state a fair return policy. In case of damaged or defective products, you must work with the buyer to resolve. The Loopy Dragon may mediate disputes; its decision is final.</p>
          <p><strong>6. Prohibited Conduct</strong><br />Sellers must not engage in fraud, communicate with buyers outside the platform to circumvent fees, post false reviews, or harass buyers/staff.</p>
          <p><strong>7. Suspension &amp; Termination</strong><br />The Loopy Dragon may suspend or terminate accounts for policy violations. Pending orders must be fulfilled before account closure.</p>
          <p><strong>8. Limitation of Liability</strong><br />The Loopy Dragon acts as a marketplace platform and is not a party to transactions between buyer and seller. We are not liable for shipping delays, damages, or disputes.</p>
          <p><strong>9. Governing Law</strong><br />These terms are governed by the laws of India under the jurisdiction of Pune, Maharashtra.</p>
          <p><strong>10. Contact</strong><br />Email: theloopydragon123@gmail.com</p>
          <p className="text-gray-400 text-[10px]">By accepting, you confirm you have read, understood, and agree to all terms above.</p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
          <div>
            <span className="text-sm font-medium text-gray-900">I accept the Seller Terms &amp; Conditions</span>
            <p className="text-xs text-gray-400 mt-0.5">Required to receive payouts. You can update this anytime.</p>
          </div>
        </label>
      </div>

      {/* Profile Page */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Profile Page</h2>
            <p className="text-xs text-gray-400">Customize your public seller page on The Loopy Dragon</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 whitespace-nowrap">theloopydragon.com/sellers/</span>
              <input type="text" value={slug}
                onChange={e => setSlug(e.target.value)}
                className={inputClass} placeholder="your-store-name" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Choose a unique URL for your store page</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Logo URL</label>
            <input type="text" value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              className={inputClass} placeholder="https://example.com/logo.png" />
            <p className="text-xs text-gray-400 mt-1">Link to your store logo image (shown on your profile page)</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Banner URL</label>
            <input type="text" value={bannerUrl}
              onChange={e => setBannerUrl(e.target.value)}
              className={inputClass} placeholder="https://example.com/banner.png" />
            <p className="text-xs text-gray-400 mt-1">Link to your banner image (shown at the top of your profile page)</p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Settings"}
        </button>
      </div>

      {/* Change Password */}
      <PasswordChangeSection sellerId={seller.id} />
    </div>
  );
}

function PasswordChangeSection({ sellerId }: { sellerId: number }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("New password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChanging(true);
    try {
      const res = await fetch("/api/sellers/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: sellerId, current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setChanging(false);
    }
  };

  const pwInputClass = "w-full pr-11 pl-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all";

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
          <p className="text-xs text-gray-400">Update your password. The owner won&apos;t be able to see it.</p>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Current Password</label>
          <div className="relative">
            <input type={showCurrent ? "text" : "password"} value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className={pwInputClass} placeholder="Enter current password" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={pwInputClass} placeholder="Min 4 characters" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <input type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={pwInputClass} placeholder="Re-enter new password" />
              {confirmPassword && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {confirmPassword === newPassword ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <button type="submit" disabled={changing}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
          {changing ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</> : "Change Password"}
        </button>
      </form>
    </div>
  );
}
