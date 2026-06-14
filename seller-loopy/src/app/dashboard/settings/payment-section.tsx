import { Info, Wallet, X, CheckCircle } from "lucide-react";

interface PaymentSectionProps {
  freeDelivery: boolean;
  setFreeDelivery: (v: boolean) => void;
  originPincode: string;
  setOriginPincode: (v: string) => void;
  freeDeliveryThreshold: string;
  setFreeDeliveryThreshold: (v: string) => void;
  deliverySlabs: { min_distance_km: number; max_distance_km: number; price: number }[];
  setDeliverySlabs: (v: { min_distance_km: number; max_distance_km: number; price: number }[]) => void;
  infoTooltip: string | null;
  setInfoTooltip: (v: string | null) => void;
  upiId: string;
  setUpiId: (v: string) => void;
}

const cardDescriptions: Record<string, { title: string; description: string }> = {
  payment: {
    title: "Payment Preferences",
    description:
      "This section controls your payment and delivery settings. The Free Delivery toggle lets you offer free shipping on all orders to boost sales. Origin Pincode is where your products ship from. The Free Delivery Threshold lets you set a minimum order amount for free delivery — for example, if set to ₹500, customers get free shipping when their cart exceeds ₹500.",
  },
  upi: {
    title: "UPI Payment Details",
    description:
      "Enter your UPI ID (Virtual Payment Address) to receive payouts. Payouts are securely processed via Razorpay every Tuesday. Make sure this is correct — all earnings are sent here.",
  },
};

export default function PaymentSection({
  freeDelivery, setFreeDelivery,
  originPincode, setOriginPincode,
  freeDeliveryThreshold, setFreeDeliveryThreshold,
  deliverySlabs, setDeliverySlabs,
  infoTooltip, setInfoTooltip,
  upiId, setUpiId,
}: PaymentSectionProps) {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 border border-primary/5 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-6 h-6 text-deep-navy" />
        <h3 className="text-title-lg text-deep-navy font-title-lg">Payment Preferences</h3>
        <button onClick={() => setInfoTooltip(infoTooltip === "payment" ? null : "payment")} className="ml-auto p-1.5 text-on-surface-variant hover:text-deep-navy hover:bg-surface-blue rounded-lg transition-all">
          <Info className="w-4 h-4" />
        </button>
      </div>
      {infoTooltip === "payment" && (
        <div className="mb-6 bg-surface-blue border border-outline-variant/30 rounded-lg p-4 text-sm text-on-surface-variant leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
          {cardDescriptions.payment.description}
        </div>
      )}
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
          <label className="font-label-sm text-on-surface-variant tracking-wide">Origin Pincode</label>
          <input type="text" value={originPincode}
            onChange={e => setOriginPincode(e.target.value)}
            className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none transition-all font-data-mono text-data-mono" />
        </div>
        <div className="space-y-2">
          <label className="font-label-sm text-on-surface-variant tracking-wide">Free Delivery Threshold</label>
          <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-data-mono text-data-mono pointer-events-none">₹</span>
              <input type="number" value={freeDeliveryThreshold}
                onChange={e => setFreeDeliveryThreshold(e.target.value)}
                className="w-full bg-white border border-outline-variant/50 rounded-lg p-3 pl-7 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none transition-all font-data-mono text-data-mono" />
            </div>
          </div>
      </div>

      {/* Delivery Slabs */}
      <div className="pt-6 border-t border-surface-container mt-6">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-label-sm text-on-surface-variant tracking-widest opacity-60">Delivery Slabs (by distance)</h4>
          <button onClick={() => setInfoTooltip(infoTooltip === "slabs" ? null : "slabs")} className="p-1 text-on-surface-variant hover:text-deep-navy hover:bg-surface-blue rounded-lg transition-all">
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
        {infoTooltip === "slabs" && (
          <div className="mb-4 bg-surface-blue border border-outline-variant/30 rounded-lg p-3 text-xs text-on-surface-variant leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
            Define delivery price based on distance from your origin pincode. Slabs are sequential — each starts where the previous ends. The last slab can be set to "Beyond" for any distance past its start. Leave empty to always use Delhivery rates.
          </div>
        )}
        {deliverySlabs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="text-left py-2 pr-2 font-label-sm text-on-surface-variant">From (km)</th>
                  <th className="text-left py-2 px-2 font-label-sm text-on-surface-variant">To (km)</th>
                  <th className="text-left py-2 px-2 font-label-sm text-on-surface-variant">Price (₹)</th>
                  <th className="py-2 pl-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {deliverySlabs.map((slab, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/10">
                    <td className="py-1.5 pr-2">
                      <div className="p-2 text-on-surface-variant font-data-mono text-data-mono bg-surface-variant/30 rounded-lg text-center">
                        {idx === 0 ? 0 : Number(deliverySlabs[idx - 1].max_distance_km)}
                      </div>
                    </td>
                    <td className="py-1.5 px-2">
                      {idx === deliverySlabs.length - 1 ? (
                        <div className="p-2 text-on-surface-variant font-data-mono text-data-mono bg-surface-variant/30 rounded-lg text-center italic leading-tight">
                          {deliverySlabs.length === 1 ? "All distances" : `${Number(deliverySlabs[idx - 1]?.max_distance_km) || 0} km+`}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={Number(slab.max_distance_km) === -1 ? "" : slab.max_distance_km}
                          onChange={e => {
                            const val = Number(e.target.value);
                            const next = [...deliverySlabs];
                            next[idx] = { ...next[idx], max_distance_km: val };
                            if (next[idx + 1]) next[idx + 1] = { ...next[idx + 1], min_distance_km: val };
                            setDeliverySlabs(next);;
                          }}
                          className="w-full bg-white border border-outline-variant/50 rounded-lg p-2 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none transition-all font-data-mono text-data-mono"
                        />
                      )}
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="number"
                        value={slab.price}
                        onChange={e => {
                          const next = [...deliverySlabs];
                          next[idx] = { ...next[idx], price: Number(e.target.value) };
                          setDeliverySlabs(next);
                        }}
                        className="w-full bg-white border border-outline-variant/50 rounded-lg p-2 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none transition-all font-data-mono text-data-mono"
                      />
                    </td>
                    <td className="py-1.5 pl-2">
                      <button
                        onClick={() => {
                          const next = deliverySlabs.filter((_, i) => i !== idx);
                          if (next.length > 0) next[next.length - 1] = { ...next[next.length - 1], max_distance_km: -1 };
                          setDeliverySlabs(next);
                        }}
                        className="p-1.5 text-status-error hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-deep-navy">No delivery pricing set</p>
            <p className="text-xs text-on-surface-variant">Click <strong>+ Add Slab</strong> below to set a delivery price based on distance. You can add multiple slabs for different distance ranges.</p>
            <div className="flex items-center justify-center gap-2 pt-1 text-xs text-on-surface-variant opacity-60">
              <span className="bg-surface-variant px-2 py-1 rounded">0–100 km → ₹50</span>
              <span>→</span>
              <span className="bg-surface-variant px-2 py-1 rounded">100–500 km → ₹100</span>
              <span>→</span>
              <span className="bg-surface-variant px-2 py-1 rounded">500 km+ → ₹150</span>
            </div>
          </div>
        )}
        {deliverySlabs.length === 1 && (
          <p className="text-xs text-on-surface-variant text-center mt-3">Want different prices by distance? + Add Slab</p>
        )}
        <div className="flex justify-end mt-3">
          <button onClick={() => {
            if (deliverySlabs.length === 0) {
              setDeliverySlabs([{ min_distance_km: 0, max_distance_km: -1, price: 0 }]);
              return;
            }
            const lastSlab = deliverySlabs[deliverySlabs.length - 1];
            const minDist = Number(lastSlab.max_distance_km) === -1
              ? Number(lastSlab.min_distance_km)
              : Number(lastSlab.max_distance_km);
            const next = deliverySlabs.map((s, i) => i === deliverySlabs.length - 1 ? { ...s, max_distance_km: minDist + 50 } : s);
            next.push({ min_distance_km: minDist + 50, max_distance_km: -1, price: 0 });
            setDeliverySlabs(next);;
          }}
            className="px-4 py-2 text-sm border border-outline-variant/50 rounded-lg text-on-surface-variant hover:text-deep-navy hover:border-lavender-accent transition-all">
            + Add Slab
          </button>
        </div>
      </div>

      {/* UPI Payment Details */}
      <div className="pt-6 border-t border-surface-container">
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-label-sm text-on-surface-variant tracking-widest opacity-60">UPI Payment Details</h4>
          <button onClick={() => setInfoTooltip(infoTooltip === "upi" ? null : "upi")} className="p-1 text-on-surface-variant hover:text-deep-navy hover:bg-surface-blue rounded-lg transition-all">
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
        {infoTooltip === "upi" && (
          <div className="mb-4 bg-surface-blue border border-outline-variant/30 rounded-lg p-3 text-xs text-on-surface-variant leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
            {cardDescriptions.upi.description}
          </div>
        )}
        <div className="space-y-2">
          <label className="font-label-sm text-on-surface-variant tracking-wide">UPI ID / VPA</label>
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
  );
}
