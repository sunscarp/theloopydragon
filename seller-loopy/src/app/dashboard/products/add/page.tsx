"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { storage } from "@/utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Plus, Upload, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useTutorial, TutorialHelpButton } from "@/components/tutorial/TutorialProvider";

export default function AddProductPage() {
  const tutorial = useTutorial();
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);
  const [inventoryMode, setInventoryMode] = useState<"stock" | "demand">(() => {
    try {
      const stored = localStorage.getItem("seller-loopy-auth");
      if (stored) {
        const s = JSON.parse(stored);
        return s.inventory_mode === "demand" ? "demand" : "stock";
      }
    } catch {}
    return "stock";
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({
    image1: false, image2: false, image3: false, image4: false, image5: false,
  });

  const [formData, setFormData] = useState({
    Product: "", Quantity: 0, Price: 0, ImageUrl1: "", Weight: 0,
    Length: 0, Width: 0, Height: 0, Tag: "", ImageUrl2: "", ImageUrl3: "",
    ImageUrl4: "", ImageUrl5: "", Description: "", Material: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) { router.push("/"); return; }
    setSeller(JSON.parse(stored));
  }, [router]);

  const handleImageUpload = async (file: File, field: string, key: string) => {
    setUploadingImages(prev => ({ ...prev, [key]: true }));
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `product-images/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, [field]: url }));
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
    } finally {
      setUploadingImages(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Product || !formData.ImageUrl1) {
      toast.error("Product name and at least one image are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, seller_id: seller.id }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Product added successfully!");
        router.push("/dashboard/products");
      } else {
        toast.error(result.error || "Failed to add product");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {inventoryMode === "demand" && (
          <div className="shrink-0 bg-surface-blue border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface-variant">
            <span className="font-semibold">Made on Demand</span> — quantities hidden
          </div>
        )}
      </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
            <p className="text-xs text-gray-400">List a new product in your store</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Product Name *</label>
              <input type="text" value={formData.Product} required
                onChange={e => setFormData(p => ({ ...p, Product: e.target.value }))}
                className={inputClass} placeholder="Asymmetrical Beaded Earrings" />
            </div>
            <div>
              <label className={labelClass}>Price (₹) *</label>
              <input type="number" value={formData.Price || ""} step="0.01" required
                onChange={e => setFormData(p => ({ ...p, Price: parseFloat(e.target.value) || 0 }))}
                className={inputClass} placeholder="100" />
            </div>
            {inventoryMode === "stock" && (
            <div>
              <label className={labelClass}>Quantity</label>
              <input type="number" value={formData.Quantity || ""}
                onChange={e => setFormData(p => ({ ...p, Quantity: parseFloat(e.target.value) || 0 }))}
                className={inputClass} placeholder="999" />
            </div>
            )}
            <div>
              <label className={labelClass}>Weight (grams)</label>
              <input type="number" value={formData.Weight || ""} step="0.01"
                onChange={e => setFormData(p => ({ ...p, Weight: parseFloat(e.target.value) || 0 }))}
                className={inputClass} placeholder="120" />
            </div>
            <div>
              <label className={labelClass}>Material</label>
              <input type="text" value={formData.Material}
                onChange={e => setFormData(p => ({ ...p, Material: e.target.value }))}
                className={inputClass} placeholder="Beads, Chains" />
            </div>
            <div>
              <label className={labelClass}>Length (cm)</label>
              <input type="number" value={formData.Length || ""} step="0.1"
                onChange={e => setFormData(p => ({ ...p, Length: parseFloat(e.target.value) || 0 }))}
                className={inputClass} placeholder="0.5" />
            </div>
            <div>
              <label className={labelClass}>Width (cm)</label>
              <input type="number" value={formData.Width || ""} step="0.1"
                onChange={e => setFormData(p => ({ ...p, Width: parseFloat(e.target.value) || 0 }))}
                className={inputClass} placeholder="0.5" />
            </div>
            <div>
              <label className={labelClass}>Height (cm)</label>
              <input type="number" value={formData.Height || ""} step="0.1"
                onChange={e => setFormData(p => ({ ...p, Height: parseFloat(e.target.value) || 0 }))}
                className={inputClass} placeholder="6" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Tags</label>
            <input type="text" value={formData.Tag}
              onChange={e => setFormData(p => ({ ...p, Tag: e.target.value }))}
              className={inputClass} placeholder="Earrings, Jewellery, Beaded, Yellow" />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={formData.Description} rows={3}
              onChange={e => setFormData(p => ({ ...p, Description: e.target.value }))}
              className={inputClass + " resize-none"} placeholder="Product description..." />
          </div>

          {/* Image Upload */}
          <div>
            <label className={labelClass}>Product Images *</label>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">Upload at least 1 image. First image is the main photo.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map(i => {
                const field = `ImageUrl${i}` as keyof typeof formData;
                const key = `image${i}`;
                const uploading = uploadingImages[key];
                const hasUrl = formData[field];

                return (
                  <div key={i}>
                    <label className={`flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      hasUrl
                        ? "border-violet-500/30 bg-violet-500/5"
                        : "border-gray-300 hover:border-violet-500/30 bg-gray-50"
                    }`}>
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                      ) : hasUrl ? (
                        <div className="w-full h-full relative group/img">
                          <img src={String(formData[field])} alt="" className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1.5" />
                          <span className="text-[10px] text-gray-400">Image {i}{i === 1 ? " *" : ""}</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, field, key);
                        }} />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button type="submit" disabled={submitting || !formData.Product || !formData.ImageUrl1}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Adding Product...</>
              ) : (
                <><Plus className="w-4 h-4" /> Add Product</>
              )}
            </button>
          </div>
        </form>
      </div>
      {!tutorial.isOnboarding && <TutorialHelpButton onClick={() => tutorial.startPageTutorial("products")} />}
    </div>
  );
}
