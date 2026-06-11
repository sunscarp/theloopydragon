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

export default function SellerPage() {
  const params = useParams();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div
        key={product.id}
        className="rounded-3xl p-4 sm:p-6 transition-all duration-300"
        style={{ height: '100%', width: '100%' }}
      >
        <Link
          href={`/product/${encodeURIComponent(product.Product)}`}
          className="relative block w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 mb-2 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
          tabIndex={-1}
          scroll={false}
        >
          {images.length === 0 ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
              <span className="text-6xl opacity-60 transition-opacity select-none" role="img" aria-label={product.Product}>📦</span>
              <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-400 font-medium pointer-events-none">No Image</div>
            </div>
          ) : (
            <img
              src={images[0]}
              alt={product.Product}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-[#F5F9FF]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center py-2">
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '17px', fontWeight: 400, color: '#1F2937' }}>
              View Product
            </span>
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
          {product.Tag && (
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: '#7C3AED', marginTop: '2px' }}>
              {product.Tag.split(',').slice(0, 2).join(', ')}
            </span>
          )}
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
      {/* Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
          : 'bg-transparent'
      }`}>
        <Navbar />
      </div>

      <div style={{ height: '80px' }}></div>

      {/* Hero Banner */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden">
        {seller.banner_url ? (
          <img
            src={seller.banner_url}
            alt={`${seller.shop_name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Store Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20 relative z-10 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {seller.logo_url ? (
              <img
                src={seller.logo_url}
                alt={`${seller.shop_name} logo`}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-xl object-cover bg-white"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Store className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="pb-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {seller.shop_name}
              </h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-sm text-white/80" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Package className="w-3.5 h-3.5 inline mr-1 mb-0.5" />
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </span>
                {seller.free_delivery && (
                  <span className="text-xs bg-green-500/90 text-white px-2.5 py-0.5 rounded-full font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Truck className="w-3 h-3 inline mr-1 mb-0.5" />
                    Free Delivery
                  </span>
                )}

              </div>
            </div>
          </div>

        </div>



        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products in this store..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                borderRadius: '0.75rem',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#1F2937',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: '400',
                fontSize: '15px',
              }}
              className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-sm"
            />
          </div>
          <div style={{
            position: 'relative',
            borderRadius: '0.75rem',
            border: '1px solid #A4A4A4',
            backgroundColor: '#FFFFFF',
            padding: '0.25rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)',
            minWidth: '180px',
          }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                appearance: 'none',
                background: 'transparent',
                padding: '0.5rem 2rem 0.5rem 0.5rem',
                color: '#1F2937',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                width: '100%',
              }}
            >
              <option value="name">Sort by: Relevance</option>
              <option value="price-asc">Sort by: Price Low to High</option>
              <option value="price-desc">Sort by: Price High to Low</option>
            </select>
            <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {search ? `Search results (${sortedProducts.length})` : "All Products"}
          </h2>
          <span className="text-sm text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Products Grid */}
        <section className="pb-16">
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
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {sortedProducts.map(renderProductCard)}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
