import { useState } from "react";
import { Store, Info, Upload, Image as ImageIcon, Pencil, Loader2, ExternalLink, Copy, Check, Package } from "lucide-react";

interface ProfileSectionProps {
  slug: string;
  setSlug: (v: string) => void;
  logoUrl: string;
  bannerUrl: string;
  uploadingLogo: boolean;
  uploadingBanner: boolean;
  handleLogoUpload: (file: File) => Promise<void>;
  handleBannerUpload: (file: File) => Promise<void>;
  infoTooltip: string | null;
  setInfoTooltip: (v: string | null) => void;
  inventoryMode: "stock" | "demand";
  setInventoryMode: (v: "stock" | "demand") => void;
}

export default function ProfileSection({
  slug, setSlug,
  logoUrl,
  bannerUrl,
  uploadingLogo, uploadingBanner,
  handleLogoUpload, handleBannerUpload,
  infoTooltip, setInfoTooltip,
  inventoryMode, setInventoryMode,
}: ProfileSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleSlugChange = (value: string) => {
    setSlug(value.replace(/\s+/g, "-"));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://theloopydragon.in/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 border border-primary/5 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Store className="w-6 h-6 text-deep-navy" />
        <h3 className="text-title-lg text-deep-navy font-title-lg">Profile Appearance</h3>
        <button onClick={() => setInfoTooltip(infoTooltip === "profile" ? null : "profile")} className="ml-auto p-1.5 text-on-surface-variant hover:text-deep-navy hover:bg-surface-blue rounded-lg transition-all">
          <Info className="w-4 h-4" />
        </button>
      </div>
      {infoTooltip === "profile" && (
        <div className="mb-6 bg-surface-blue border border-outline-variant/30 rounded-lg p-4 text-sm text-on-surface-variant leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
          Here you can customize your public storefront. Set your URL Slug (the custom part of your store URL), upload a store logo and banner image. Your store will be accessible at theloopydragon.in/your-slug.
        </div>
      )}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="font-label-sm text-on-surface-variant tracking-wide">Store URL</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="bg-surface-blue border-y border-l border-outline-variant/50 rounded-l-lg px-3 py-3 text-on-surface-variant text-sm font-data-mono whitespace-nowrap">theloopydragon.in/</span>
              <input type="text" value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                className="w-40 bg-white border border-outline-variant/50 rounded-r-lg p-3 focus:ring-2 focus:ring-lavender-accent focus:border-lavender-accent outline-none font-data-mono text-sm" />
            </div>
            {slug && (
              <div className="flex items-center gap-1.5">
                <a href={`https://theloopydragon.in/${slug}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-3 border border-outline-variant/50 text-on-surface-variant font-semibold text-sm rounded-lg hover:text-deep-navy hover:border-lavender-accent transition-all">
                  <ExternalLink className="w-4 h-4" />
                  Visit
                </a>
                <button onClick={handleCopyLink}
                  className="inline-flex items-center px-3 py-3 border border-outline-variant/50 text-on-surface-variant rounded-lg hover:text-deep-navy hover:border-lavender-accent transition-all">
                  {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="font-label-sm text-on-surface-variant tracking-wide">Inventory Mode</label>
          <div className="flex items-center gap-4 p-4 bg-surface-blue rounded-lg">
            <Package className="w-5 h-5 text-deep-navy" />
            <div className={`flex-1 ${inventoryMode === "stock" ? "text-lavender-accent" : "text-on-surface-variant"}`}>
              <p className="text-sm font-semibold">Stock Based</p>
              <p className="text-xs ">Track quantities — products go out of stock when count reaches 0</p>
            </div>
            <button
              onClick={() => setInventoryMode(inventoryMode === "stock" ? "demand" : "stock")}
              className={`relative w-12 h-6 rounded-full transition-colors ${inventoryMode === "stock" ? "bg-lavender-accent" : "bg-surface-variant"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${inventoryMode === "stock" ? "translate-x-0.5" : "translate-x-6"}`} />
            </button>
            <div className={`flex-1 text-right ${inventoryMode === "demand" ? "text-lavender-accent" : "text-on-surface-variant"}`}>
              <p className="text-sm font-semibold">Made on Demand</p>
              <p className="text-xs ">No stock tracking — products are always available</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2 space-y-2">
            <label className="font-label-sm text-on-surface-variant tracking-wide">Store Logo</label>
            <div className={`border-2 border-dashed border-outline-variant/50 rounded-xl text-center hover:border-lavender-accent transition-colors cursor-pointer group flex flex-col items-center justify-center h-40 sm:h-48 md:h-56 ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                {uploadingLogo ? (
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
                ) : logoUrl ? (
                  <div className="relative group/img">
                    <img src={logoUrl} alt="Logo" className="w-36 h-36 object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-surface-blue rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-on-surface-variant group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-sm font-semibold text-deep-navy">Upload Logo</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">SVG, PNG or JPG</p>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }} />
              </label>
            </div>
          </div>
          <div className="col-span-3 space-y-2">
            <label className="font-label-sm text-on-surface-variant tracking-wide">Store Banner</label>
            <div className="relative w-full h-40 sm:h-48 md:h-56 rounded-xl overflow-hidden border-2 border-dashed border-outline-variant/50 hover:border-lavender-accent transition-colors">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-variant/50 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-8 h-8 text-outline-variant" />
                  <p className="text-sm font-semibold text-deep-navy">Upload Banner</p>
                  <p className="text-[11px] text-on-surface-variant">Full-width banner for your store page</p>
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-deep-navy/40 text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingBanner ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm font-semibold">{bannerUrl ? "Change" : "Upload"}</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f); }} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
