"use client";
import { useState } from "react";
import { Scale } from "lucide-react";

interface TermsModalProps {
  onAccept: () => Promise<void>;
  onSkip: () => void;
}

export default function TermsModal({ onAccept, onSkip }: TermsModalProps) {
  const [accepting, setAccepting] = useState(false);
  const [denied, setDenied] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await onAccept();
    } catch {
      setAccepting(false);
    }
  };

  if (denied) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Scale className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Terms Not Accepted</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            You will not be able to request withdrawals until you accept the Seller Terms &amp; Conditions.
            You can view and accept them anytime from your{" "}
            <strong>Settings → Terms</strong> page.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setDenied(false)}
              className="w-full py-3 rounded-xl bg-deep-navy text-white font-bold hover:opacity-90 transition-all">
              Review Terms Again
            </button>
            <button onClick={onSkip}
              className="w-full py-3 rounded-xl border border-outline text-on-surface font-semibold hover:bg-surface-container transition-all">
              Skip for now (go to dashboard)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 relative animate-in fade-in zoom-in duration-200">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-6 h-6 text-deep-navy" />
            <h3 className="text-xl font-bold text-gray-900">Seller Terms &amp; Conditions</h3>
          </div>

          <p className="text-sm text-on-surface-variant mb-4">
            Please review and accept the Seller Terms &amp; Conditions before proceeding.
            You can also view and update this anytime from{" "}
            <strong>Settings → Terms</strong>.
          </p>

          <div className="max-h-80 overflow-y-auto bg-surface-blue p-4 rounded-lg border border-outline-variant/30 mb-6 text-sm text-on-surface-variant leading-relaxed space-y-3">
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

          <div className="flex flex-col gap-3">
            <button onClick={handleAccept} disabled={accepting}
              className="w-full py-3 rounded-xl bg-deep-navy text-white font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
              {accepting ? "Accepting..." : "Accept Terms & Continue"}
            </button>
            <button onClick={() => setDenied(true)}
              className="w-full py-3 rounded-xl border border-outline text-on-surface font-semibold hover:bg-surface-container transition-all">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
