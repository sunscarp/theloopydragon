"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { storage } from "@/utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Loader2, Truck, Smartphone, Lock, DollarSign,
  Eye, EyeOff, Store, Check, X, FileText, Upload, Image as ImageIcon,
  Wallet, Scale, Lightbulb, CheckCircle, Info, Pencil, ArrowRight,
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allowRefunds, setAllowRefunds] = useState(false);
  const [allowReturns, setAllowReturns] = useState(false);
  const [originPincode, setOriginPincode] = useState("411033");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("");
  const [saved, setSaved] = useState(false);

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
    setAllowRefunds(s.allow_refunds ?? false);
    setAllowReturns(s.allow_returns ?? false);
    setOriginPincode(s.origin_pincode || "411033");
    setFreeDeliveryThreshold(s.free_delivery_threshold ? String(s.free_delivery_threshold) : "");
    setLoading(false);
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
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
        allow_refunds: allowRefunds,
        allow_returns: allowReturns,
        origin_pincode: originPincode,
        free_delivery_threshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : 0,
      };
      localStorage.setItem("seller-loopy-auth", JSON.stringify(updated));
      setSeller(updated);
      setSaved(true);
      toast.success("Settings saved");
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error(data.error || "Failed to save");
    }
    setSaving(false);
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
      {/* Header */}
      <header>
        <h2 className="text-headline-lg text-deep-navy font-headline-lg">Store Settings</h2>
        <p className="text-body-md text-on-surface-variant">Configure your store preferences and payout details</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Primary Settings */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Payment Preferences */}
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-primary/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-6 h-6 text-deep-navy" />
              <h3 className="text-title-lg text-deep-navy font-title-lg">Payment Preferences</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="col-span-2 flex items-center justify-between p-4 bg-surface-blue rounded-lg">
                <div>
                  <p className="text-body-lg font-bold">Free Delivery</p>
                  <p className="text-label-sm text-on-surface-variant">Offer free delivery on all orders to boost sales.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={!!freeDelivery}
                    onChange={e => setFreeDelivery(e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer-checked:bg-lavender-accent transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 peer-checked:bg-white"></div>
                </label>
              </div>
              <div className="space-y-2">
                <label className="font-label-sm text-on-surface-variant uppercase tracking-wide">Origin Pincode</label>
                <input type="text" value={originPincode}
                  onChange={e => setOriginPincode(e.target.value)}
                  className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none transition-all font-data-mono text-data-mono" />
              </div>
              <div className="space-y-2">
                <label className="font-label-sm text-on-surface-variant uppercase tracking-wide">Free Delivery Threshold</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-data-mono text-data-mono pointer-events-none">₹</span>
                  <input type="number" value={freeDeliveryThreshold}
                    onChange={e => setFreeDeliveryThreshold(e.target.value)}
                    className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 pl-7 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none transition-all font-data-mono text-data-mono" />
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-surface-container">
              <h4 className="font-label-sm text-on-surface-variant mb-4 uppercase tracking-widest opacity-60">UPI Payment Details</h4>
              <div className="space-y-2">
                <label className="font-label-sm text-on-surface-variant uppercase tracking-wide">UPI ID / VPA</label>
                <div className="relative">
                  <input type="text" value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none transition-all font-data-mono text-data-mono"
                    placeholder="merchant@upi" />
                  {upiId && (
                    <CheckCircle className="absolute right-3 top-3 text-status-success w-5 h-5" />
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-1">
                  <Info className="w-3.5 h-3.5" />
                  Payouts are securely processed and sent here via Razorpay every Tuesday.
                </p>
              </div>
            </div>
          </section>

          {/* Seller Policies */}
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-primary/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-deep-navy" />
              <h3 className="text-title-lg text-deep-navy font-title-lg">Seller Policies</h3>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-body-md font-semibold">Allow Returns</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={!!allowRefunds}
                    onChange={e => setAllowRefunds(e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer-checked:bg-lavender-accent transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 peer-checked:bg-white"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-body-md font-semibold">Allow Exchanges</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={!!allowReturns}
                    onChange={e => setAllowReturns(e.target.checked)}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer-checked:bg-lavender-accent transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 peer-checked:bg-white"></div>
                </label>
              </div>
            </div>
            <div className="bg-surface-blue p-4 rounded-lg flex gap-3">
              <Lightbulb className="w-5 h-5 text-deep-navy shrink-0" />
              <p className="text-body-md italic text-on-surface-variant leading-relaxed">
                When enabled, customers will see your policy on the product page and checkout. Return/exchange requests go directly to your seller email for manual approval.
              </p>
            </div>
          </section>

          {/* Terms & Conditions */}
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-primary/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6 text-deep-navy" />
              <h3 className="text-title-lg text-deep-navy font-title-lg">Seller Terms &amp; Conditions</h3>
            </div>
            <div className="max-h-60 overflow-y-auto bg-surface-blue p-6 rounded-lg border border-outline-variant/30 mb-6 text-sm text-on-surface-variant leading-relaxed space-y-3">
              <p className="font-semibold text-deep-navy">The Loopy Dragon — Seller Terms &amp; Conditions</p>
              <p><strong>1. Introduction</strong><br />Welcome to The Loopy Dragon! We're a marketplace connecting independent creators and sellers with customers who love unique, handcrafted, and curated products. By registering as a seller or listing any product on our platform, you agree to be bound by these Seller Terms &amp; Conditions. Please read them carefully before you get started.</p>
              <p><strong>2. Seller Eligibility</strong><br />To sell on The Loopy Dragon, you must: • Be at least 18 years of age. • Be the rightful owner of, or have full authorisation to sell, all listed products. • Have a valid UPI-linked bank account for receiving payouts. • Comply with all applicable Indian laws related to the sale of goods, GST (if applicable), and consumer protection. The Loopy Dragon reserves the right to approve or reject any seller application at its discretion, without being required to provide a reason.</p>
              <p><strong>3. Fees &amp; Pricing</strong><br />A 2% Razorpay payment processing fee is deducted from every transaction automatically. You will always receive: Sale Price – 2% Razorpay Fee = Your Payout. Fee structures may change in the future. Sellers will be notified via email at least 7 days in advance of any such change. Continued listing of products after the notice period constitutes acceptance of the revised rates.</p>
              <p><strong>4. Product Listings</strong><br />Sellers are responsible for the accuracy and quality of their listings. When creating a listing, you must: • Provide accurate product titles, descriptions, and photographs that genuinely represent the item. • Clearly state product dimensions, materials, and care instructions where relevant. • List the correct price in Indian Rupees (INR). • Clearly state expected processing and shipping timelines. • Promptly update or remove listings if a product becomes unavailable. The Loopy Dragon may remove or delist any product that is inaccurately described, violates these terms, or is otherwise deemed unsuitable for the marketplace.</p>
              <p><strong>5. Prohibited Items &amp; Conduct</strong><br />The following are strictly not permitted on The Loopy Dragon: • Counterfeit, replica, or infringing products (trademark, copyright, or otherwise). • Items that are illegal to sell in India. • Hazardous, unsafe, or improperly labelled products. • Adult-only content or products without proper age gating. • Products making false health or medical claims. The following conduct is also prohibited: • Communicating with buyers outside the platform to circumvent fees or platform processes. • Submitting, soliciting, or incentivising fake or misleading reviews. • Harassing, threatening, or being disrespectful to buyers or The Loopy Dragon team. • Creating multiple seller accounts to evade suspension or policy violations. • Misrepresenting your identity or the nature of your business.</p>
              <p><strong>6. Orders &amp; Fulfilment</strong><br />Once a buyer places an order, you are responsible for fulfilling it in a timely and professional manner. Specifically: • You must ship orders within the processing time stated in your listing. • All items must be carefully and appropriately packaged to prevent damage in transit. • You must provide accurate tracking information to the buyer wherever available. • You remain responsible for the order until it is delivered to and accepted by the buyer. • If you are unable to fulfil an order (e.g. item is out of stock), you must notify the buyer and The Loopy Dragon immediately and arrange a full refund. Repeated fulfilment failures or excessive cancellations may result in account review or suspension.</p>
              <p><strong>7. Payments &amp; Payouts</strong><br />All buyer payments are collected via Razorpay. Payouts to your registered UPI account are made after deducting the applicable Razorpay processing fee (2%) and any platform commission. Payouts are typically processed within 5–7 business days of a successfully completed order, unless: • The order is under a dispute or return request. • Suspected fraudulent activity has been flagged on the transaction. • The seller&apos;s account is under review or suspension. The Loopy Dragon reserves the right to withhold payouts in such cases until the matter is resolved. You are responsible for reporting and paying any taxes (including GST) applicable to your earnings.</p>
              <p><strong>8. Returns &amp; Refunds</strong><br />Each seller must maintain a clearly stated return and refund policy on their shop/listings. At a minimum: • You must accept returns or offer refunds for items that arrive damaged, defective, or significantly not as described. • You must respond to buyer return/refund requests within 3 business days. • Return shipping costs should be clearly communicated in your return policy. The Loopy Dragon may mediate disputes between buyers and sellers. In cases where no satisfactory resolution is reached, The Loopy Dragon&apos;s decision will be final and binding on both parties. Repeated refund or dispute issues may result in seller account review.</p>
              <p><strong>9. Intellectual Property</strong><br />By listing on The Loopy Dragon, you confirm that: • All content you upload (photos, descriptions, artwork, branding) is your own original work or you have full rights to use it. • You are not infringing on any third-party intellectual property, including trademarks, copyrights, or registered designs. You grant The Loopy Dragon a non-exclusive, royalty-free licence to display, share, and promote your listings and associated content for the purpose of operating and marketing the marketplace (including on social media). This licence ends when your listing is removed.</p>
              <p><strong>10. Privacy &amp; Data</strong><br />By registering as a seller, you agree to The Loopy Dragon&apos;s Privacy Policy. In particular: • Buyer personal data (name, address, contact details) shared with you for the purpose of fulfilling an order must be used only for that purpose. • You must not store, share, sell, or misuse buyer data in any way. • Any breach of buyer data privacy may result in immediate account suspension.</p>
              <p><strong>11. Suspension &amp; Termination</strong><br />The Loopy Dragon reserves the right to suspend or permanently terminate any seller account for: • Violation of any of these terms. • Repeated negative buyer experiences, disputes, or refunds. • Suspected fraud or illegal activity. • Inactivity for extended periods without notice. In the event of termination, you must still fulfil all pending orders unless buyers are individually notified and refunded. Any withheld payouts due to disputes may be released after matters are resolved satisfactorily. You may voluntarily close your seller account at any time by contacting us, provided all pending orders are fulfilled.</p>
              <p><strong>12. Limitation of Liability</strong><br />The Loopy Dragon is a marketplace platform that facilitates transactions between independent sellers and buyers. We are not a party to any sale agreement between you and a buyer. Accordingly: • We are not liable for shipping delays, lost parcels, transit damage, or buyer dissatisfaction arising from seller actions. • We do not guarantee a minimum level of sales or visibility for any seller. • We are not responsible for any losses arising from platform downtime, technical issues, or payment processor errors beyond our control. Our total liability to you in any circumstance shall not exceed the total platform fees (if any) paid by you to The Loopy Dragon in the preceding three months.</p>
              <p><strong>13. Changes to These Terms</strong><br />The Loopy Dragon may update these Seller Terms from time to time. When material changes are made, we will notify you via the email address on your account at least 7 days before the changes take effect. Continuing to sell on the platform after that date means you accept the revised terms.</p>
              <p><strong>14. Contact Us</strong><br />If you have any questions about these terms or your seller account, please reach out to us: 📧 theloopydragon123@gmail.com. We aim to respond to all queries within 2–3 business days. By listing on The Loopy Dragon, you confirm that you have read, understood, and agree to all of the terms above. Last updated: June 2025</p>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={!!termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-deep-navy border-outline-variant rounded focus:ring-lavender-accent" id="tc-accept" />
              <label htmlFor="tc-accept">
                <span className="block font-semibold text-deep-navy">I accept the Seller Terms &amp; Conditions</span>
                <span className="block text-label-sm text-on-surface-variant">Required to receive payouts. You can update this anytime.</span>
              </label>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 pb-12">
            <button onClick={() => {
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
            }}
              className="px-8 py-3 rounded-xl border border-outline text-on-surface font-semibold hover:bg-surface-container transition-all">
              Discard Changes
            </button>
            <button onClick={handleSave} disabled={saving}
              className={`px-12 py-3 rounded-xl text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-md ${saved ? 'bg-status-success' : 'bg-deep-navy'}`}>
              {saving ? "Saving..." : saved ? "Saved Successfully!" : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Right Column: Profile & Account */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Profile Appearance */}
          <section className="bg-surface-container-lowest rounded-xl p-8 border border-primary/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Store className="w-6 h-6 text-deep-navy" />
              <h3 className="text-title-lg text-deep-navy font-title-lg">Profile Appearance</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-sm text-on-surface-variant uppercase tracking-wide">URL Slug</label>
                <div className="flex items-center">
                  <span className="bg-surface-blue border-y border-l border-outline-variant/50 rounded-l-lg px-3 py-3 text-on-surface-variant text-sm font-data-mono">theloopydragon.in/</span>
                  <input type="text" value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full bg-white border border-outline-variant/50 rounded-r-lg p-3 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none font-data-mono text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-sm text-on-surface-variant uppercase tracking-wide">Store Logo</label>
                <label className={`border-2 border-dashed border-outline-variant/50 rounded-xl p-6 text-center hover:border-lavender-accent transition-colors cursor-pointer group flex flex-col items-center ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploadingLogo ? (
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin mx-auto" />
                  ) : logoUrl ? (
                    <div className="relative w-full group/img">
                      <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain rounded-xl mx-auto mb-2" />
                      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-surface-blue rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 text-on-surface-variant group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-label-sm font-bold text-deep-navy">Click to upload logo</p>
                      <p className="text-[10px] text-on-surface-variant">SVG, PNG or JPG (Max 2MB)</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
                </label>
              </div>
              <div className="space-y-2">
                <label className="font-label-sm text-on-surface-variant uppercase tracking-wide">Store Banner</label>
                <div className="relative h-28 rounded-xl overflow-hidden border border-outline-variant/30 mb-2">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="w-full h-full bg-surface-variant/50 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-outline-variant" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-deep-navy/40 text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    {uploadingBanner ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Pencil className="w-5 h-5" />
                    )}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); }} />
                  </label>
                </div>
                <p className="text-[10px] text-center text-on-surface-variant italic">Recommended aspect ratio 3:1</p>
              </div>
            </div>
          </section>

          {/* Change Password */}
          <PasswordChangeSection sellerId={seller.id} />

          {/* Help Card */}
          <div className="bg-deep-navy rounded-xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-title-lg mb-2 font-title-lg">Need help?</h4>
              <p className="text-sm opacity-80 mb-4">Contact our seller support for any technical issues or payout queries.</p>
              <a href="/dashboard/support" className="inline-flex items-center gap-2 text-lavender-accent font-bold hover:gap-3 transition-all">
                Chat with us
                <ArrowRight className="w-[18px] h-[18px]" />
              </a>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-lavender-accent/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
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

  const pwInputClass = "w-full bg-white border border-outline-variant/50 rounded-lg p-3 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none transition-all";

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 border border-primary/5 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="w-6 h-6 text-deep-navy" />
        <h3 className="text-title-lg text-deep-navy font-title-lg">Security</h3>
      </div>
      <form onSubmit={handleChangePassword} className="space-y-5">
        <div className="space-y-1">
          <label className="font-label-sm text-on-surface-variant uppercase">Current Password</label>
          <div className="relative">
            <input type={showCurrent ? "text" : "password"} value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className={pwInputClass} placeholder="••••••••" />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-deep-navy transition-colors">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-label-sm text-on-surface-variant uppercase">New Password</label>
          <div className="relative">
            <input type={showNew ? "text" : "password"} value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className={pwInputClass} placeholder="Enter new password" />
            <button type="button" onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-deep-navy transition-colors">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="font-label-sm text-on-surface-variant uppercase">Confirm Password</label>
          <div className="relative">
            <input type="password" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={pwInputClass} placeholder="Confirm new password" />
            {confirmPassword && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {confirmPassword === newPassword ? (
                  <Check className="w-4 h-4 text-status-success" />
                ) : (
                  <X className="w-4 h-4 text-status-error" />
                )}
              </div>
            )}
          </div>
        </div>
        <button type="submit" disabled={changing}
          className="w-full py-3 bg-surface-container-high text-deep-navy font-bold rounded-lg hover:bg-lavender-accent transition-all active:scale-95">
          {changing ? "Changing..." : "Update Password"}
        </button>
      </form>
    </section>
  );
}
