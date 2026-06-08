"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { storage } from "@/utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Package, Plus, Loader2, Eye, Trash2, Search, RefreshCw,
  Sparkles, Pencil, X, Upload, Save, Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ Product: "", Price: 0, Quantity: 0, Description: "", Material: "", Tag: "", ImageUrl1: "", ImageUrl2: "", ImageUrl3: "", ImageUrl4: "", ImageUrl5: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState<string | null>(null);
  const router = useRouter();

  const fetchProducts = async (sellerId: number) => {
    setLoading(true);
    const { data } = await supabase
      .from("Inventory")
      .select("*")
      .eq("seller_id", sellerId)
      .order("id", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) return;
    const s = JSON.parse(stored);
    setSeller(s);
    fetchProducts(s.id);
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("Inventory").delete().eq("id", id).eq("seller_id", seller.id);
    if (error) {
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted");
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      Product: product.Product || "",
      Price: product.Price || 0,
      Quantity: product.Quantity || 0,
      Description: product.Description || "",
      Material: product.Material || "",
      Tag: product.Tag || "",
      ImageUrl1: product.ImageUrl1 || "",
      ImageUrl2: product.ImageUrl2 || "",
      ImageUrl3: product.ImageUrl3 || "",
      ImageUrl4: product.ImageUrl4 || "",
      ImageUrl5: product.ImageUrl5 || "",
    });
  };

  const handleEditImageUpload = async (file: File, field: string) => {
    const key = field;
    setUploadingEditImage(key);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `product-images/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditForm(prev => ({ ...prev, [field]: url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploadingEditImage(null);
    }
  };

  const saveEdit = async () => {
    if (!editForm.Product.trim()) { toast.error("Product name is required"); return; }
    setSavingEdit(true);
    const { error } = await supabase
      .from("Inventory")
      .update({
        Product: editForm.Product, Price: editForm.Price, Quantity: editForm.Quantity,
        Description: editForm.Description, Material: editForm.Material, Tag: editForm.Tag,
        ImageUrl1: editForm.ImageUrl1, ImageUrl2: editForm.ImageUrl2, ImageUrl3: editForm.ImageUrl3,
        ImageUrl4: editForm.ImageUrl4, ImageUrl5: editForm.ImageUrl5,
      })
      .eq("id", editingProduct.id)
      .eq("seller_id", seller.id);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Product updated");
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...editForm } : p));
      setEditingProduct(null);
    }
    setSavingEdit(false);
  };

  const filtered = products.filter(p =>
    !searchTerm || p.Product?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-5 h-5 text-violet-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            <span className="text-gray-700 font-medium">{products.length}</span> product{products.length !== 1 ? "s" : ""} listed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchProducts(seller.id)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => router.push("/dashboard/products/add")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-violet-500/20">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      {products.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white border border-gray-200">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200">
            <Package className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-700 font-medium">No products yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first product to start selling on The Loopy Dragon</p>
          <button onClick={() => router.push("/dashboard/products/add")}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-violet-500/20">
            <Plus className="w-4 h-4" /> Add Your First Product
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white border border-gray-200">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200">
            <Search className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-700 font-medium">No products match &quot;{searchTerm}&quot;</p>
          <button onClick={() => setSearchTerm("")}
            className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(product => (
            <div key={product.id}
              className="group relative rounded-2xl bg-white border border-gray-200 overflow-hidden hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
              {/* Image */}
              <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                {product.ImageUrl1 ? (
                  <img src={product.ImageUrl1} alt={product.Product}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-200" />
                  </div>
                )}
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                    product.status === "active"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}>
                    {product.status === "active" && <Sparkles className="w-2.5 h-2.5" />}
                    {product.status || "active"}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                  {product.Product}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-lg font-bold text-gray-900">
                    ₹<span className="text-purple-600">{product.Price}</span>
                  </p>
                  <p className="text-xs text-gray-400">Stock: {product.Quantity}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  <a href={`https://the-loopydragon.vercel.app/product/${encodeURIComponent(product.Product)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                  <button onClick={() => openEdit(product)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-purple-600/60 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(product.id, product.Product)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500/60 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setEditingProduct(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Edit Product</h2>
                <p className="text-xs text-gray-400 mt-0.5">{editingProduct.Product}</p>
              </div>
              <button onClick={() => setEditingProduct(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Product Name</label>
                <input type="text" value={editForm.Product}
                  onChange={e => setEditForm(p => ({ ...p, Product: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Price (₹)</label>
                  <input type="number" value={editForm.Price} step="0.01"
                    onChange={e => setEditForm(p => ({ ...p, Price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Quantity</label>
                  <input type="number" value={editForm.Quantity}
                    onChange={e => setEditForm(p => ({ ...p, Quantity: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Tags</label>
                <input type="text" value={editForm.Tag}
                  onChange={e => setEditForm(p => ({ ...p, Tag: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Material</label>
                <input type="text" value={editForm.Material}
                  onChange={e => setEditForm(p => ({ ...p, Material: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
              </div>
              {/* Images */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Images</label>
                <div className="grid grid-cols-5 gap-2">
                  {["ImageUrl1", "ImageUrl2", "ImageUrl3", "ImageUrl4", "ImageUrl5"].map((field, i) => {
                    const url = (editForm as any)[field];
                    const uploading = uploadingEditImage === field;
                    return (
                      <div key={field}>
                        <label className={`flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          url ? "border-violet-500/30 bg-violet-50" : "border-gray-300 hover:border-violet-500/30 bg-gray-50"
                        }`}>
                          {uploading ? (
                            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                          ) : url ? (
                            <div className="w-full h-full relative group/img">
                              <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <ImageIcon className="w-4 h-4 text-gray-300 mx-auto mb-1" />
                              <span className="text-[8px] text-gray-300">{i + 1}</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleEditImageUpload(file, field);
                            }} />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea value={editForm.Description} rows={3}
                  onChange={e => setEditForm(p => ({ ...p, Description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6 pt-2 border-t border-gray-100">
              <button onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">Cancel</button>
              <button onClick={saveEdit} disabled={savingEdit}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
                {savingEdit ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
