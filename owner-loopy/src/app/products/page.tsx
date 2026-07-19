"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Package, Loader2, Pencil, X, Save, Eye, ArrowUpDown, GripVertical, Trash2, LayoutGrid, ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  { label: "Select a category", value: "" },
  { label: "Plushies", value: "Plushies" },
  { label: "Keychains", value: "Keychains" },
  { label: "Hair accessories", value: "Hair accessories" },
  { label: "Flowers", value: "Flowers" },
  { label: "Jewellery", value: "Jewellery" },
  { label: "Characters", value: "Characters" },
  { label: "Best Sellers", value: "Best Sellers" },
  { label: "Apparel", value: "Apparel" },
  { label: "Miscellaneous", value: "Miscellaneous" },
];

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "relevance">("newest");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    Product: "", Price: 0, Quantity: 0, Description: "", Material: "", Tag: "",
    ImageUrl1: "", ImageUrl2: "", ImageUrl3: "", ImageUrl4: "", ImageUrl5: "",
    sort_order: 0,
  });
  const [editCategory, setEditCategory] = useState("");
  const [editExtraTags, setEditExtraTags] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [showConfigure, setShowConfigure] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Inventory")
      .select("*, sellers(shop_name, slug)")
      .order("id", { ascending: false });
    let list: any[];
    if (error || !data) {
      const { data: fallback } = await supabase
        .from("Inventory")
        .select("*")
        .order("id", { ascending: false });
      list = fallback || [];
    } else {
      list = [...data];
    }
    if (sortBy === "oldest") {
      list = [...list].sort((a, b) => (a.id || 0) - (b.id || 0));
    } else if (sortBy === "relevance") {
      list = [...list].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
    }
    setProducts(list);
    setLoading(false);
  };

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const pagedProducts = useMemo(
    () => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [products, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const openEdit = (product: any) => {
    const tagStr = product.Tag || "";
    const tags = tagStr.split(",").map((t: string) => t.trim()).filter(Boolean);
    const categoryValues = CATEGORIES.map(c => c.value).filter(Boolean);
    const matchedCategory = tags.find((t: string) => categoryValues.includes(t)) || "";
    const extra = matchedCategory ? tags.filter((t: string) => t !== matchedCategory).join(", ") : tagStr;
    setEditingProduct(product);
    setEditCategory(matchedCategory);
    setEditExtraTags(extra);
    setEditForm({
      Product: product.Product || "",
      Price: product.Price || 0,
      Quantity: product.Quantity || 0,
      Description: product.Description || "",
      Material: product.Material || "",
      Tag: tagStr,
      ImageUrl1: product.ImageUrl1 || "",
      ImageUrl2: product.ImageUrl2 || "",
      ImageUrl3: product.ImageUrl3 || "",
      ImageUrl4: product.ImageUrl4 || "",
      ImageUrl5: product.ImageUrl5 || "",
      sort_order: product.sort_order ?? 0,
    });
  };

  const saveEdit = async () => {
    if (!editForm.Product.trim()) { toast.error("Product name is required"); return; }
    setSavingEdit(true);
    const categoryTag = editCategory || "";
    const extra = editExtraTags.split(",").map(t => t.trim()).filter(Boolean).join(", ");
    const combinedTag = [categoryTag, extra].filter(Boolean).join(", ");
    const { error } = await supabase
      .from("Inventory")
      .update({
        Product: editForm.Product,
        Price: editForm.Price,
        Quantity: editForm.Quantity,
        Description: editForm.Description,
        Material: editForm.Material,
        Tag: combinedTag,
        ImageUrl1: editForm.ImageUrl1,
        ImageUrl2: editForm.ImageUrl2,
        ImageUrl3: editForm.ImageUrl3,
        ImageUrl4: editForm.ImageUrl4,
        ImageUrl5: editForm.ImageUrl5,
        sort_order: editForm.sort_order,
      })
      .eq("id", editingProduct.id);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Product updated");
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...editForm, Tag: combinedTag } : p));
      setEditingProduct(null);
    }
    setSavingEdit(false);
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "relevance", label: "Relevance" },
  ];

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700",
      deactivated: "bg-slate-100 text-slate-600",
      pending_approval: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
      draft: "bg-slate-100 text-slate-600",
    };
    return colors[status] || "bg-slate-100 text-slate-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-1">All products — edit details, sort, and configure the /shop display order</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowConfigure(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors">
            <LayoutGrid className="w-4 h-4" /> Configure /shop
          </button>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer">
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Product</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Seller</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Price</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Sort</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.ImageUrl1 ? (
                          <img src={p.ImageUrl1} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <span className="font-medium text-slate-800">{p.Product}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{p.sellers?.shop_name || "Platform"}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">₹{p.Price}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-400 font-mono">{p.sort_order ?? 0}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge(p.status)}`}>
                        {p.status || "active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {products.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, products.length)} of {products.length}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setEditingProduct(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Edit Product</h2>
                <p className="text-xs text-slate-400 mt-0.5">{editingProduct.Product}</p>
              </div>
              <button onClick={() => setEditingProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Product Name</label>
                <input type="text" value={editForm.Product}
                  onChange={e => setEditForm(p => ({ ...p, Product: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Price (₹)</label>
                  <input type="number" value={editForm.Price} step="0.01" min="0" max="100000"
                    onChange={e => setEditForm(p => ({ ...p, Price: Math.min(parseFloat(e.target.value) || 0, 100000) }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Quantity</label>
                  <input type="number" value={editForm.Quantity}
                    onChange={e => setEditForm(p => ({ ...p, Quantity: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Category</label>
                  <select value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all">
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Additional Tags</label>
                  <input type="text" value={editExtraTags}
                    onChange={e => setEditExtraTags(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Material</label>
                <input type="text" value={editForm.Material}
                  onChange={e => setEditForm(p => ({ ...p, Material: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Sort Order (Relevance)</label>
                <input type="number" value={editForm.sort_order} min="0" step="1"
                  onChange={e => setEditForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                <p className="text-xs text-slate-400 mt-1">Lower numbers appear first when sorted by Relevance</p>
              </div>
              {/* Images */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2 uppercase tracking-wider">Images</label>
                <div className="grid grid-cols-5 gap-2">
                  {["ImageUrl1", "ImageUrl2", "ImageUrl3", "ImageUrl4", "ImageUrl5"].map((field, i) => {
                    const url = (editForm as any)[field];
                    return (
                      <div key={field} className="aspect-[4/3] rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                        {url ? (
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-slate-300">{i + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea value={editForm.Description} rows={3}
                  onChange={e => setEditForm(p => ({ ...p, Description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all resize-none" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {editingProduct.ImageUrl1 && (
                  <a href={`https://theloopydragon.in/product/${encodeURIComponent(editingProduct.Product)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700">
                    <Eye className="w-3.5 h-3.5" /> View live product
                  </a>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 pb-6 pt-2 border-t border-slate-100">
              <button onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">Cancel</button>
              <button onClick={saveEdit} disabled={savingEdit}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all disabled:opacity-50">
                {savingEdit ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure /shop Modal */}
      {showConfigure && (
        <ConfigureShopModal
          products={products}
          onClose={() => setShowConfigure(false)}
          onSaved={() => { setShowConfigure(false); fetchProducts(); }}
        />
      )}
    </div>
  );
}

function ConfigureShopModal({
  products,
  onClose,
  onSaved,
}: {
  products: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [slots, setSlots] = useState<(any | null)[]>(() => {
    const arr: (any | null)[] = Array(15).fill(null);
    products.forEach((p) => {
      if (p.sort_order && p.sort_order >= 1 && p.sort_order <= 15) {
        arr[p.sort_order - 1] = p;
      }
    });
    return arr;
  });
  const [search, setSearch] = useState("");
  const [draggedProduct, setDraggedProduct] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const unassigned = products.filter(
    (p) => p.status !== "deactivated" && !slots.some((s) => s?.id === p.id)
  );

  const filteredUnassigned = search
    ? unassigned.filter((p) =>
        p.Product?.toLowerCase().includes(search.toLowerCase())
      )
    : unassigned;

  const handleDropOnSlot = (slotIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const productId = parseInt(e.dataTransfer.getData("productId"));
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setSlots((prev) => {
      const next = [...prev];
      // if the product is already in another slot, remove it from there
      const existingIdx = next.findIndex((s) => s?.id === productId);
      if (existingIdx !== -1) next[existingIdx] = null;
      next[slotIndex] = product;
      return next;
    });
  };

  const handleRemoveSlot = (slotIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const assignedIds = new Set(slots.filter(Boolean).map((s) => s.id));
    const toSet: { id: number; sort_order: number | null }[] = [];

    slots.forEach((product, i) => {
      if (product) toSet.push({ id: product.id, sort_order: i + 1 });
    });

    products.forEach((p) => {
      if (!assignedIds.has(p.id) && (p.sort_order ?? 0) > 0) {
        toSet.push({ id: p.id, sort_order: null });
      }
    });

    if (toSet.length === 0) {
      setSaving(false);
      onSaved();
      return;
    }

    const results = await Promise.all(
      toSet.map((u) =>
        supabase.from("Inventory").update({ sort_order: u.sort_order }).eq("id", u.id)
      )
    );

    setSaving(false);
    const firstError = results.find((r) => r.error);
    if (firstError) {
      console.error("Supabase save error:", firstError.error);
      toast.error(firstError.error?.message || "Failed to save configuration");
    } else {
      toast.success("Shop configuration saved!");
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-5xl rounded-2xl bg-white border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Configure /shop</h2>
            <p className="text-xs text-slate-400 mt-0.5">Drag products into the 15 slots to set the first items shown when sorted by Relevance</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 flex gap-6">
          {/* Product List */}
          <div className="w-72 flex-shrink-0">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Search products..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {!search ? (
                <p className="text-sm text-slate-400 text-center py-8">Search for a product to add to slots</p>
              ) : filteredUnassigned.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No products match your search</p>
              ) : (
                filteredUnassigned.map((p) => (
                  <div key={p.id} draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("productId", String(p.id));
                      setDraggedProduct(p);
                    }}
                    onDragEnd={() => setDraggedProduct(null)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 cursor-grab active:cursor-grabbing hover:bg-purple-50 hover:border-purple-200 transition-colors">
                    {p.ImageUrl1 ? (
                      <img src={p.ImageUrl1} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                        <Package className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <span className="text-sm text-slate-700 truncate flex-1">{p.Product}</span>
                    <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Slots Grid */}
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">
              Featured Slots — 15 products
            </p>
            <div className="grid grid-cols-3 gap-3">
              {slots.map((product, i) => (
                <div key={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropOnSlot(i)}
                  className={`relative aspect-[4/3] rounded-xl border-2 border-dashed transition-all ${
                    product
                      ? "border-purple-300 bg-purple-50"
                      : draggedProduct
                        ? "border-purple-400 bg-purple-50/50"
                        : "border-slate-200 bg-slate-50"
                  }`}>
                  {product ? (
                    <div className="relative w-full h-full group">
                      <img src={product.ImageUrl1 || "/placeholder.png"} alt=""
                        className="w-full h-full object-cover rounded-[10px]" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[10px] flex items-center justify-center">
                        <button onClick={() => handleRemoveSlot(i)}
                          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="absolute top-1 left-1 bg-white/90 text-[10px] font-bold text-slate-600 px-1.5 py-0.5 rounded-md shadow-sm">
                        #{i + 1}
                      </span>
                      <span className="absolute bottom-1 left-1 right-1 bg-white/90 text-[10px] text-slate-700 px-1.5 py-0.5 rounded-md truncate shadow-sm">
                        {product.Product}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <span className="text-xs text-slate-300 font-medium">Slot {i + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-6 pt-2 border-t border-slate-100">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Configuration</>}
          </button>
        </div>
      </div>
    </div>
  );
}
