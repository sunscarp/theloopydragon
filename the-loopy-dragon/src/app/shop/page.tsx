"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import Footer from "@/components/Footer";
import { redirectToMobile } from "@/utils/deviceDetection";

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
};

export default function Shop() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [search, setSearch] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products");
  const [isHairAccessoriesOpen, setIsHairAccessoriesOpen] = useState(false);
  const { cart, addToCart, isLoaded } = useCart();
  const router = useRouter();

  // Add mobile redirect check
  useEffect(() => {
    redirectToMobile();
  }, []);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("Inventory")
        .select("id, Product, Quantity, Price, Tag, ImageUrl1, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5");

      if (error) {
        setProducts([]);
        let msg = "Failed to fetch products: " + error.message;
        if (
          error.message.includes('relation "public.Inventory" does not exist') ||
          error.message.includes('relation "Inventory" does not exist')
        ) {
          msg +=
            "\n\nThis means your Supabase table 'Inventory' does not exist or is not public.\n" +
            "Please:\n" +
            "1. Go to your Supabase dashboard.\n" +
            "2. Ensure there is a table named 'Inventory' (case-sensitive).\n" +
            "3. The table should have columns: id, Product, Quantity, Price, Tag.\n" +
            "4. Make sure Row Level Security (RLS) is disabled or a public select policy is enabled.";
        }
        setErrorMsg(msg);
        console.error("Supabase error:", error);
      } else if (data) {
        setProducts(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("products", JSON.stringify(data));
          window.dispatchEvent(new CustomEvent("productsUpdated", { detail: data }));
        }
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F9FF]">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <div className="text-gray-600 text-lg font-medium">
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.Product.toLowerCase().includes(search.toLowerCase());
    
    // Category filtering logic
    if (selectedCategory === "All Products") {
      return matchesSearch;
    }
    
    // Check if product has the selected category in its tags
    const productTags = product.Tag ? product.Tag.split(',').map(tag => tag.trim()) : [];
    const matchesCategory = productTags.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name") {
      return a.Product.localeCompare(b.Product);
    } else if (sortBy === "price-asc") {
      return a.Price - b.Price;
    } else if (sortBy === "price-desc") {
      return b.Price - a.Price;
    }
    return 0;
  });

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
              <span
                className="text-6xl opacity-60 transition-opacity select-none"
                role="img"
                aria-label={product.Product}
              >
                📦
              </span>
              <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-400 font-medium pointer-events-none">
                No Image
              </div>
            </div>
          ) : (
            <img
              src={images[0]}
              alt={product.Product}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-[#F5F9FF]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center py-2">
            <span style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '17px',
              fontWeight: 400,
              color: '#1F2937'
            }}>
              View Product
            </span>
          </div>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            color: '#1F2937',
            marginBottom: '4px',
            lineHeight: '1.4'
          }}>
            {product.Product}
          </h3>
          <span style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: '#1F2937'
          }}>
            ₹{product.Price.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  const renderNoProductsMessage = () => (
    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0' }}>
      <div className="text-6xl mb-6 opacity-20">🔍</div>
      <div className="text-xl font-semibold text-gray-600 mb-2">
        No products found
      </div>
      <div className="text-gray-500 mb-4 text-sm">
        Try adjusting your search or filters
      </div>
      <button
        onClick={() => {
          setSearch("");
          setSelectedCategory("All Products");
          setSortBy("name");
        }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 text-sm"
      >
        Clear All Filters
      </button>
    </div>
  );

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
      
      {/* Header Section */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '40px',
            fontWeight: 700,
            color: '#22223B',
            marginBottom: '1rem'
          }}>
            OUR SHOP
          </h2>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '20px',
            fontWeight: 400,
            color: '#22223B',
            maxWidth: '100%',
            margin: '0 auto',
            lineHeight: '1.2'
          }}>
            Your one-stop cozy shop, serving handmade charm all day
          </p>
        </div>

        {/* Search Section */}
        <div style={{ marginBottom: '1.5rem', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3.5rem',
                borderRadius: '0',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#1F2937',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: '400',
                fontSize: '16px'
              }}
              className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-sm"
            />
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '256px 1fr', gap: '1.5rem' }}>
          {/* Categories Sidebar */}
          <div>
            <div style={{ position: 'sticky', top: '6rem' }}>
              <h3 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                lineHeight: '1.2',
                letterSpacing: '0.01em',
                color: '#22223B',
                marginBottom: '1rem'
              }}>
                Categories
              </h3>
              <div style={{ borderBottom: '1px solid #000000', marginBottom: '1rem' }}></div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['All Products', 'Best Sellers', 'Plushies', 'Keychains', 'Hair accessories', 'Flowers', 'Jewellery', 'Characters', 'Miscellaneous'].map((category) => (
                  <li key={category}>
                    {category === 'Hair accessories' ? (
                      <div>
                        <button
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '14px',
                            color: selectedCategory === category ? '#000000' : '#1F2937',
                            fontWeight: selectedCategory === category ? 700 : 400,
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => {
                            setIsHairAccessoriesOpen(!isHairAccessoriesOpen);
                            setSelectedCategory(category);
                          }}
                          className={selectedCategory === category ? '' : 'hover:text-purple-600'}
                        >
                          {category}
                          <svg
                            className={`w-4 h-4 transition-transform ${isHairAccessoriesOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isHairAccessoriesOpen && (
                          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {['Barrette Clips', 'Bobby Pins', 'Scrunchies', 'Hairties', 'Hairbands', 'Claw Clips / Clutchers', 'Upins', 'Alligator Clips', 'Tictac Clips'].map((subCategory) => (
                              <li key={subCategory}>
                                <button
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.75rem',
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontSize: '14px',
                                    color: selectedCategory === subCategory ? '#000000' : '#1F2937',
                                    fontWeight: selectedCategory === subCategory ? 700 : 400,
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onClick={() => setSelectedCategory(subCategory)}
                                  className={selectedCategory === subCategory ? '' : 'hover:text-purple-600'}
                                >
                                  {subCategory}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <button
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.75rem',
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '14px',
                          color: selectedCategory === category ? '#000000' : '#1F2937',
                          fontWeight: selectedCategory === category ? 700 : 400,
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category ? '' : 'hover:text-purple-600'}
                      >
                        {category}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Products Area */}
          <div style={{ width: '100%' }}>
            {/* Sort and Product Count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  color: '#1F2937', 
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  marginRight: '0.25rem' 
                }}>
                  Sort by:
                </span>
                <div style={{
                  position: 'relative',
                  borderRadius: '0',
                  border: '1px solid #A4A4A4',
                  backgroundColor: '#F5F9FF',
                  padding: '0.25rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)'
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
                      fontWeight: 400
                    }}
                  >
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
              <div style={{ fontSize: '0.875rem', color: '#4B4B64', fontWeight: 500 }}>
                {loading ? "Loading..." : `${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''}`}
              </div>
            </div>
            
            {/* Products Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              minHeight: '400px'
            }}>
              {loading ? (
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' }}>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                  <div className="text-lg text-gray-600 animate-pulse">
                    Loading beautiful creations...
                  </div>
                </div>
              ) : errorMsg ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0' }}>
                  <div className="text-6xl mb-6 opacity-20">⚠️</div>
                  <div className="text-xl font-semibold text-red-600 mb-4">
                    Oops! Something went wrong
                  </div>
                  <div className="text-red-500 whitespace-pre-line bg-red-50 rounded-2xl p-6 max-w-2xl mx-auto text-sm leading-relaxed">
                    {errorMsg}
                  </div>
                </div>
              ) : sortedProducts.length === 0 ? (
                renderNoProductsMessage()
              ) : (
                sortedProducts.map(renderProductCard)
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
