"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Store, Search, Package, Truck } from "lucide-react";

type ProductRow = {
  id: number;
  Product: string;
  Quantity: number;
  Price: number;
  Tag?: string | null;
  ImageUrl1?: string | null;
  ImageUrl2?: string | null;
  ImageUrl3?: string | null;
  ImageUrl4?: string | null;
  ImageUrl5?: string | null;
  seller_id?: string | null;
  status?: string | null;
};

function normalizeCategory(str: string) {
  let s = str.trim().toLowerCase();
  if (s === "hairties" || s === "hair ties" || s === "hairtie" || s === "hair tie") return "hairtie";
  if (s === "scrunchies" || s === "scrunchie") return "scrunchie";
  if (s === "claw clips" || s === "claw clip" || s === "clutchers" || s === "clutcher" || s === "claw clips / clutchers") return "clawclip";
  if (s === "upins" || s === "upin") return "upin";
  if (s === "tictac clips" || s === "tictac clip" || s === "tictacclips" || s === "tictacclip") return "tictacclip";
  if (s === "tic tac clips" || s === "tic tac clip") return "tictacclip";
  if (s === "hair accessories" || s === "hair accessory") return "hairaccessory";
  if (s === "plushies" || s === "plushie") return "plushie";
  if (s === "keychains" || s === "keychain") return "keychain";
  if (s === "flowers" || s === "flower") return "flower";
  if (s === "jewellery" || s === "jewelry") return "jewellery";
  if (s === "characters" || s === "character") return "character";
  if (s === "miscellaneous" || s === "misc") return "miscellaneous";
  if (s === "barrette clips" || s === "barrette clip") return "barretteclip";
  if (s === "bobby pins" || s === "bobby pin") return "bobbypin";
  if (s === "hairbands" || s === "hairband") return "hairband";
  if (s === "alligator clips" || s === "alligator clip") return "alligatorclip";
  if (s.endsWith('ies')) { s = s.slice(0, -3) + 'y'; }
  else if (s.endsWith('es')) { s = s.slice(0, -2); }
  else if (s.endsWith('s')) { s = s.slice(0, -1); }
  return s.replace(/\s+/g, '');
}

const CATEGORIES = ['All Products', 'Best Sellers', 'Plushies', 'Keychains', 'Hair accessories', 'Flowers', 'Jewellery', 'Characters', 'Miscellaneous'];
const HAIR_SUBCATEGORIES = ['Barrette Clips', 'Bobby Pins', 'Scrunchies', 'Hairties', 'Hairbands', 'Claw Clips / Clutchers', 'Upins', 'Alligator Clips', 'Tictac Clips'];

export default function SellerPage() {
  const params = useParams();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [isHairAccessoriesOpen, setIsHairAccessoriesOpen] = useState(false);

  useEffect(() => {
    async function fetchSeller() {
      setLoading(true);
      const slug = params?.slug?.toString();
      if (!slug) { setNotFound(true); setLoading(false); return; }

      const { data: sellerData, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("slug", slug)
        .neq("status", "removed")
        .single();

      if (error || !sellerData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setSeller(sellerData);

      const { data: productData } = await supabase
        .from("Inventory")
        .select("id, Product, Quantity, Price, Tag, ImageUrl1, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5, seller_id, status")
        .eq("seller_id", sellerData.id)
        .neq("status", "deactivated");

      setProducts(productData || []);
      setLoading(false);
    }
    fetchSeller();
  }, [params]);

  const filteredProducts = products
    .filter(product => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        product.Product.toLowerCase().includes(q) ||
        (product.Tag && product.Tag.toLowerCase().includes(q))
      );
    })
    .filter(product => {
      if (selectedCategory === "All Products") return true;
      const normalizedSelected = normalizeCategory(selectedCategory);
      const productTags = product.Tag
        ? product.Tag.split(',').map(tag => normalizeCategory(tag))
        : [];
      return productTags.some(tag => tag === normalizedSelected);
    });

  const sortedProducts = sortBy === "price-asc"
    ? [...filteredProducts].sort((a, b) => a.Price - b.Price)
    : sortBy === "price-desc"
      ? [...filteredProducts].sort((a, b) => b.Price - a.Price)
      : filteredProducts;

  const renderProductCard = (product: ProductRow) => {
    const images = [
      product.ImageUrl1,
      product.ImageUrl2,
      product.ImageUrl3,
      product.ImageUrl4,
      product.ImageUrl5,
    ].filter((img): img is string => !!img);
    const isOutOfStock = product.Quantity <= 0;

    return (
      <div key={product.id} className="rounded-3xl p-4 sm:p-6 transition-all duration-300" style={{ height: '100%', width: '100%' }}>
        <Link href={`/product/${encodeURIComponent(product.Product)}`}
          className="relative block w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 mb-2 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
          tabIndex={-1} scroll={false}>
          {images.length === 0 ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
              <span className="text-6xl opacity-60 transition-opacity select-none" role="img" aria-label={product.Product}>📦</span>
              <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-400 font-medium pointer-events-none">No Image</div>
            </div>
          ) : (
            <img src={images[0]} alt={product.Product}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy" decoding="async" fetchPriority="low" />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-[#F5F9FF]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center py-2">
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '17px', fontWeight: 400, color: '#1F2937' }}>View Product</span>
          </div>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">Sold Out</span>
            </div>
          )}
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '18px', fontWeight: 400, color: '#1F2937', marginBottom: '4px', lineHeight: '1.4' }}>
            {product.Product}
          </h3>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>
            ₹{product.Price.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F5F9FF]">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50">
          <Navbar />
        </div>
        <div style={{ height: '80px' }}></div>
        <div className="flex flex-col items-center justify-center py-32">
          <Store className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Store not found</h2>
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>The seller you're looking for doesn't exist or has been removed.</p>
          <Link href="/shop" className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all text-sm">
            Browse Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FF]" style={{ fontFamily: 'sans-serif' }}>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50">
        <Navbar />
      </div>

      <div style={{ height: '80px' }}></div>

      {/* Hero Banner */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 overflow-hidden">
        {seller.banner_url ? (
          <img src={seller.banner_url} alt={`${seller.shop_name} banner`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
        )}
      </div>

      {/* Store Info - Below Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 mb-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {seller.logo_url ? (
            <img src={seller.logo_url} alt={`${seller.shop_name} logo`}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-white shadow-xl object-cover bg-white" />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {seller.shop_name}
            </h1>
            {seller.free_delivery && (
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium mt-1 inline-block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Truck className="w-3 h-3 inline mr-1 mb-0.5" />
                Free Delivery
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-24">
              {/* Categories */}
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '14px', color: '#22223B', marginBottom: '0.75rem' }}>
                Categories
              </h3>
              <div style={{ borderBottom: '1px solid #E5E7EB', marginBottom: '0.75rem' }}></div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {CATEGORIES.map((category) => (
                  <li key={category}>
                    {category === 'Hair accessories' ? (
                      <div>
                        <button
                          style={{
                            width: '100%', textAlign: 'left', padding: '0.4rem 0.75rem',
                            borderRadius: '0.75rem', fontFamily: 'Montserrat, sans-serif',
                            fontSize: '13px', color: selectedCategory === category ? '#000000' : '#1F2937',
                            fontWeight: selectedCategory === category ? 700 : 400,
                            backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                            transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}
                          onClick={() => { setIsHairAccessoriesOpen(!isHairAccessoriesOpen); setSelectedCategory(category); }}
                          className={selectedCategory === category ? '' : 'hover:text-purple-600'}
                        >
                          {category}
                          <svg className={`w-3 h-3 transition-transform ${isHairAccessoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isHairAccessoriesOpen && (
                          <ul style={{ marginLeft: '0.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {HAIR_SUBCATEGORIES.map(sub => (
                              <li key={sub}>
                                <button
                                  style={{
                                    width: '100%', textAlign: 'left', padding: '0.3rem 0.75rem',
                                    borderRadius: '0.75rem', fontFamily: 'Montserrat, sans-serif',
                                    fontSize: '12px', color: selectedCategory === sub ? '#000000' : '#4B5563',
                                    fontWeight: selectedCategory === sub ? 700 : 400,
                                    backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onClick={() => setSelectedCategory(sub)}
                                  className={selectedCategory === sub ? '' : 'hover:text-purple-600'}>
                                  {sub}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <button
                        style={{
                          width: '100%', textAlign: 'left', padding: '0.4rem 0.75rem',
                          borderRadius: '0.75rem', fontFamily: 'Montserrat, sans-serif',
                          fontSize: '13px', color: selectedCategory === category ? '#000000' : '#1F2937',
                          fontWeight: selectedCategory === category ? 700 : 400,
                          backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category ? '' : 'hover:text-purple-600'}>
                        {category}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Products Area */}
          <div className="lg:col-span-9">
            {/* Search */}
            <div style={{ marginBottom: '1rem', width: '100%' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input type="text" placeholder="What are you looking for?"
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem 1rem 0.75rem 3.5rem',
                    border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', color: '#1F2937',
                    outline: 'none', fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
                  }}
                  className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded" />
              </div>
            </div>

            {/* Sort and Product Count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#1F2937', fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 400 }}>
                  Sort by:
                </span>
                <div style={{ position: 'relative', border: '1px solid #A4A4A4', backgroundColor: '#F5F9FF', padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center' }}>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                    style={{
                      appearance: 'none', background: 'transparent', padding: '0.5rem 2rem 0.5rem 0.5rem',
                      color: '#1F2937', border: 'none', cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 400
                    }}>
                    <option value="name">Relevance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.875rem', color: '#4B4B64', fontWeight: 500 }}>
                {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {search ? `Search results (${sortedProducts.length})` : "All Products"}
            </h2>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-20 select-none">
                  {search ? "🔍" : "📦"}
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {search ? "No products found" : "No products yet"}
                </h3>
                <p className="text-gray-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {search ? "Try adjusting your search terms" : "This seller hasn't listed any products yet."}
                </p>
                {search && (
                  <button onClick={() => setSearch("")}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 text-sm">
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {sortedProducts.map(renderProductCard)}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
