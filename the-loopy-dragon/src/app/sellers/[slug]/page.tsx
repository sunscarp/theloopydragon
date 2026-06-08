"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Store } from "lucide-react";

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
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
            {seller?.shop_name || "Seller"}
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
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
          : 'bg-transparent'
      }`}>
        <Navbar />
      </div>

      <div style={{ height: '80px' }}></div>

      {/* Banner */}
      <div className="relative w-full h-24 sm:h-32 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 overflow-hidden">
        {seller.banner_url ? (
          <img
            src={seller.banner_url}
            alt={`${seller.shop_name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-20 select-none">🛍️</div>
          </div>
        )}
      </div>

      {/* Logo + Name */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          {seller.logo_url ? (
            <img
              src={seller.logo_url}
              alt={`${seller.shop_name} logo`}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Store className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {seller.shop_name}
            </h1>
            <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20 select-none">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No products yet
            </h3>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              This seller hasn't listed any products yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map(renderProductCard)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
