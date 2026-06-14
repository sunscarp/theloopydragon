"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { storage } from "@/utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Store, Wallet, FileText, Scale, Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import PaymentSection from "./payment-section";
import PoliciesSection from "./policies-section";
import TermsSection from "./terms-section";
import ProfileSection from "./profile-section";
import SecuritySection from "./security-section";

const TABS = [
  { id: "payment", label: "Payment", icon: Wallet },
  { id: "policies", label: "Policies", icon: FileText },
  { id: "terms", label: "Terms", icon: Scale },
  { id: "profile", label: "Profile", icon: Store },
  { id: "security", label: "Security", icon: Lock },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SellerSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("payment");
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allowRefunds, setAllowRefunds] = useState(false);
  const [allowReturns, setAllowReturns] = useState(false);
  const [originPincode, setOriginPincode] = useState("411033");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("");
  const [deliverySlabs, setDeliverySlabs] = useState<{ min_distance_km: number; max_distance_km: number; price: number }[]>([]);
  const [saved, setSaved] = useState(false);
  const [infoTooltip, setInfoTooltip] = useState<string | null>(null);
  const [inventoryMode, setInventoryMode] = useState<"stock" | "demand">("stock");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab as TabId);
    }

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
    setAllowRefunds(s.allow_refunds ?? false);
    setAllowReturns(s.allow_returns ?? false);
    setOriginPincode(s.origin_pincode || "411033");
    setFreeDeliveryThreshold(s.free_delivery_threshold ? String(s.free_delivery_threshold) : "");
    setInventoryMode(s.inventory_mode === "demand" ? "demand" : "stock");

    fetch(`/api/delivery-slabs?seller_id=${s.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.slabs) setDeliverySlabs(data.slabs);
      })
      .catch(() => {});

    setLoading(false);
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const prevMode = seller.inventory_mode === "demand" ? "demand" : "stock";
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
        allow_refunds: allowRefunds,
        allow_returns: allowReturns,
        origin_pincode: originPincode,
        free_delivery_threshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : 0,
        inventory_mode: inventoryMode,
      }),
    });
    const data = await res.json();

    const slabsToSave = deliverySlabs.map((s, i) => {
      const slab = { ...s };
      if (i === 0) slab.min_distance_km = 0;
      if (i === deliverySlabs.length - 1) slab.max_distance_km = -1;
      return slab;
    });
    const slabRes = await fetch("/api/delivery-slabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seller_id: seller.id, slabs: slabsToSave }),
    });
    const slabData = await slabRes.json();

    let modeUpdateSuccess = true;
    if (inventoryMode !== prevMode) {
      const modeRes = await fetch("/api/sellers/update-inventory-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: seller.id, inventory_mode: inventoryMode }),
      });
      const modeData = await modeRes.json();
      modeUpdateSuccess = modeData.success;
    }

    if (data.success && slabData.success && modeUpdateSuccess) {
      const updated = {
        ...seller,
        free_delivery: freeDelivery,
        upi_id: upiId,
        terms_accepted: termsAccepted,
        slug,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        allow_refunds: allowRefunds,
        allow_returns: allowReturns,
        origin_pincode: originPincode,
        free_delivery_threshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : 0,
        inventory_mode: inventoryMode,
      };
      localStorage.setItem("seller-loopy-auth", JSON.stringify(updated));
      setSeller(updated);
      setSaved(true);
      toast.success("Settings saved");
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error(data.error || slabData.error || "Failed to save");
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    setFreeDelivery(seller.free_delivery ?? false);
    setUpiId(seller.upi_id || "");
    setTermsAccepted(seller.terms_accepted ?? false);
    setSlug(seller.slug || "");
    setLogoUrl(seller.logo_url || "");
    setBannerUrl(seller.banner_url || "");
    setAllowRefunds(seller.allow_refunds ?? false);
    setAllowReturns(seller.allow_returns ?? false);
    setOriginPincode(seller.origin_pincode || "411033");
    setFreeDeliveryThreshold(seller.free_delivery_threshold ? String(seller.free_delivery_threshold) : "");
    setInventoryMode(seller.inventory_mode === "demand" ? "demand" : "stock");
    fetch(`/api/delivery-slabs?seller_id=${seller.id}`)
      .then(r => r.json())
      .then(data => { if (data.slabs) setDeliverySlabs(data.slabs); });
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `sellers/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setLogoUrl(url);
      toast.success("Logo uploaded");
    } catch {
      toast.error("Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `sellers/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setBannerUrl(url);
      toast.success("Banner uploaded");
    } catch {
      toast.error("Banner upload failed");
    } finally {
      setUploadingBanner(false);
    }
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

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-headline-lg text-deep-navy font-headline-lg">Store Settings</h2>
          <p className="text-body-md text-on-surface-variant">Configure your store preferences and payout details</p>
        </div>
      </header>

      {/* Sub-navigation Tabs */}
      <nav className="flex gap-1 bg-surface-container-lowest rounded-xl p-1.5 border border-primary/5 shadow-sm overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-deep-navy text-white shadow-sm"
                  : "text-on-surface-variant hover:text-deep-navy hover:bg-surface-blue"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Active Section */}
      <div className="space-y-8">
        {activeTab === "payment" && (
          <PaymentSection
            freeDelivery={freeDelivery} setFreeDelivery={setFreeDelivery}
            originPincode={originPincode} setOriginPincode={setOriginPincode}
            freeDeliveryThreshold={freeDeliveryThreshold} setFreeDeliveryThreshold={setFreeDeliveryThreshold}
            deliverySlabs={deliverySlabs} setDeliverySlabs={setDeliverySlabs}
            infoTooltip={infoTooltip} setInfoTooltip={setInfoTooltip}
            upiId={upiId} setUpiId={setUpiId}
          />
        )}
        {activeTab === "policies" && (
          <PoliciesSection
            allowRefunds={allowRefunds} setAllowRefunds={setAllowRefunds}
            allowReturns={allowReturns} setAllowReturns={setAllowReturns}
            infoTooltip={infoTooltip} setInfoTooltip={setInfoTooltip}
          />
        )}
        {activeTab === "terms" && (
          <TermsSection
            termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted}
            infoTooltip={infoTooltip} setInfoTooltip={setInfoTooltip}
          />
        )}
        {activeTab === "profile" && (
          <ProfileSection
            slug={slug} setSlug={setSlug}
            logoUrl={logoUrl}
            bannerUrl={bannerUrl}
            uploadingLogo={uploadingLogo} uploadingBanner={uploadingBanner}
            handleLogoUpload={handleLogoUpload} handleBannerUpload={handleBannerUpload}
            infoTooltip={infoTooltip} setInfoTooltip={setInfoTooltip}
            inventoryMode={inventoryMode} setInventoryMode={setInventoryMode}
          />
        )}
        {activeTab === "security" && (
          <SecuritySection
            sellerId={seller.id}
            infoTooltip={infoTooltip} setInfoTooltip={setInfoTooltip}
          />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 pb-12">
          <button onClick={handleDiscard}
            className="px-8 py-3 rounded-xl border border-outline text-on-surface font-semibold hover:bg-surface-container transition-all">
            Discard Changes
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`px-12 py-3 rounded-xl text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-md ${saved ? 'bg-status-success' : 'bg-deep-navy'}`}>
            {saving ? "Saving..." : saved ? "Saved Successfully!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
