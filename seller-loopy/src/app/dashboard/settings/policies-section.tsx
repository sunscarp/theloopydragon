import { FileText, Info, Lightbulb } from "lucide-react";

interface PoliciesSectionProps {
  allowRefunds: boolean;
  setAllowRefunds: (v: boolean) => void;
  allowReturns: boolean;
  setAllowReturns: (v: boolean) => void;
  infoTooltip: string | null;
  setInfoTooltip: (v: string | null) => void;
}

export default function PoliciesSection({
  allowRefunds, setAllowRefunds,
  allowReturns, setAllowReturns,
  infoTooltip, setInfoTooltip,
}: PoliciesSectionProps) {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 border border-primary/5 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-deep-navy" />
        <h3 className="text-title-lg text-deep-navy font-title-lg">Seller Policies</h3>
        <button onClick={() => setInfoTooltip(infoTooltip === "policies" ? null : "policies")} className="ml-auto p-1.5 text-on-surface-variant hover:text-deep-navy hover:bg-surface-blue rounded-lg transition-all">
          <Info className="w-4 h-4" />
        </button>
      </div>
      {infoTooltip === "policies" && (
        <div className="mb-6 bg-surface-blue border border-outline-variant/30 rounded-lg p-4 text-sm text-on-surface-variant leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
          Configure your return and exchange policies. Toggle 'Allow Returns' to let customers return items, and 'Allow Exchanges' to offer replacements. When enabled, customers see your policy at checkout, and requests come to your email for manual approval.
        </div>
      )}
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
  );
}
