"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

type ProductRow = {
  id: number;
  Product: string;
  Quantity: number;
  Price: number;
  ImageUrl1?: string | null;
  ImageUrl2?: string | null;
  ImageUrl3?: string | null;
  ImageUrl4?: string | null;
  ImageUrl5?: string | null;
};

export default function Home() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterInStock, setFilterInStock] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { cart, addToCart, isLoaded } = useCart();

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
        .select("id, Product, Quantity, Price, ImageUrl1, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5");
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
            "3. The table should have columns: id, Product, Quantity, Price.\n" +
            "4. Make sure Row Level Security (RLS) is disabled or a public select policy is enabled.";
        }
        setErrorMsg(msg);
        console.error("Supabase error:", error);
      } else if (data) {
        setProducts(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("products", JSON.stringify(data));
          // Dispatch custom event to notify CartContext about the update
          window.dispatchEvent(new CustomEvent("productsUpdated", { detail: data }));
        }
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carousel state for each product
  const [carouselIndexes, setCarouselIndexes] = useState<{ [id: number]: number }>({});

  const handleCarouselChange = (productId: number, imagesLength: number, direction: number) => {
    setCarouselIndexes(prev => {
      const current = prev[productId] || 0;
      let next = current + direction;
      if (next < 0) next = imagesLength - 1;
      if (next >= imagesLength) next = 0;
      return { ...prev, [productId]: next };
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Filtering and sorting logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.Product.toLowerCase().includes(search.toLowerCase());
    const matchesStock = !filterInStock || product.Quantity > 0;
    return matchesSearch && matchesStock;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex flex-col font-sans">
      {/* Sticky Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50' 
          : 'bg-transparent'
      }`}>
        <Navbar />
      </div>
      
      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20"></div>
      
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 dark:from-purple-900 dark:via-purple-800 dark:to-purple-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-300/20 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-1/4 w-12 h-12 bg-yellow-300/20 rounded-full blur-lg animate-pulse delay-700"></div>
        
        <div className="relative z-10 py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="max-w-5xl mx-auto">
            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 sm:mb-8 tracking-tight leading-tight">
              Handmade
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200 mt-2">
                Crochet Creations
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed opacity-90 mb-8 sm:mb-10">
              Discover unique, handcrafted crochet items made with love, care, and a touch of magic! 
              Each piece tells a story of creativity and passion.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/collections"
                className="group bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-3 min-w-[200px] justify-center"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                View Collections
              </Link>
              
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="group bg-purple-800/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-purple-700/30 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3 min-w-[200px] justify-center"
              >
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Shop Now
              </button>
            </div>
            
            {/* Decorative separator */}
            <div className="mt-10 sm:mt-12 flex items-center justify-center space-x-4">
              <div className="h-px bg-white/30 w-12 sm:w-16"></div>
              <div className="flex space-x-2 text-2xl sm:text-3xl">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🧶</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms' }}>✨</span>
                <span className="animate-bounce" style={{ animationDelay: '400ms' }}>💜</span>
              </div>
              <div className="h-px bg-white/30 w-12 sm:w-16"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8" id="products">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse our handpicked selection of beautiful crochet pieces
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mt-6"></div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 mb-8 sm:mb-12 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            {/* Filter Button */}
            <div className="relative">
              <button
                className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3 border border-purple-200 dark:border-purple-700"
                onClick={() => setShowFilter(v => !v)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                Filter & Sort
                <svg className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showFilter && (
                <div className="absolute mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-6 z-20 w-72 sm:w-80">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Stock Filter
                      </label>
                      <label className="flex items-center gap-3 text-gray-700 dark:text-gray-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterInStock}
                          onChange={e => setFilterInStock(e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span>Show only items in stock</span>
                      </label>
                    </div>
                    
                    <div>
                      <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Sort by
                      </label>
                      <select
                        id="sort"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      >
                        <option value="name">Name (A-Z)</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for beautiful creations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder-gray-400"
              />
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {loading ? "Loading..." : `${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''} found`}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <div className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
              Loading beautiful creations...
            </div>
          </div>
        ) : errorMsg ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 opacity-20">⚠️</div>
            <div className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              Oops! Something went wrong
            </div>
            <div className="text-red-500 dark:text-red-400 whitespace-pre-line bg-red-50 dark:bg-red-900/50 rounded-2xl p-6 max-w-2xl mx-auto text-sm leading-relaxed">
              {errorMsg}
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl sm:text-8xl mb-6 opacity-20">🔍</div>
            <div className="text-xl sm:text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">
              No products found
            </div>
            <div className="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your search or filters
            </div>
            <button
              onClick={() => {
                setSearch("");
                setFilterInStock(false);
                setSortBy("name");
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {sortedProducts.map((product, index) => {
              // Collect all non-null images
              const images = [
                product.ImageUrl1,
                product.ImageUrl2,
                product.ImageUrl3,
                product.ImageUrl4,
                product.ImageUrl5,
              ].filter((img): img is string => !!img);

              const currentIndex = carouselIndexes[product.id] || 0;
              const isOutOfStock = product.Quantity <= 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl p-4 sm:p-6 flex flex-col transform transition-all duration-300 hover:scale-[1.02] border border-gray-100 dark:border-gray-700"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Product Image(s) Carousel - click to open product page */}
                  <Link
                    href={`/product/${encodeURIComponent(product.Product)}`}
                    className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-4 overflow-hidden group-hover:shadow-lg transition-shadow duration-300 flex items-center justify-center"
                    tabIndex={-1}
                    scroll={false}
                  >
                    {images.length === 0 ? (
                      <div className="flex items-center justify-center h-full w-full">
                        <span className="text-4xl sm:text-5xl lg:text-6xl opacity-40 group-hover:opacity-60 transition-opacity" role="img" aria-label={product.Product}>
                          🧶
                        </span>
                      </div>
                    ) : images.length === 1 ? (
                      <img
                        src={images[0]}
                        alt={product.Product}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <img
                          src={images[currentIndex]}
                          alt={product.Product}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        {/* Carousel Controls */}
                        <button
                          type="button"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-700/70 rounded-full p-1 shadow hover:bg-white dark:hover:bg-gray-800 transition"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCarouselChange(product.id, images.length, -1);
                          }}
                          aria-label="Previous image"
                          tabIndex={-1}
                        >
                          <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-700/70 rounded-full p-1 shadow hover:bg-white dark:hover:bg-gray-800 transition"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCarouselChange(product.id, images.length, 1);
                          }}
                          aria-label="Next image"
                          tabIndex={-1}
                        >
                          <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        {/* Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {images.map((_, i) => (
                            <span
                              key={i}
                              className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {/* Stock indicators */}
                    {product.Quantity <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                          Sold Out
                        </span>
                      </div>
                    )}
                    {product.Quantity > 0 && product.Quantity <= 3 && (
                      <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                        Only {product.Quantity} left
                      </span>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {product.Product}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4 mt-auto">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{product.Price.toFixed(2)}
                        </span>
                      </div>
                      
                      {product.Quantity > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                          In stock
                        </div>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      className={`w-full py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 ${
                        isOutOfStock
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isOutOfStock) addToCart(product.id);
                      }}
                      disabled={isOutOfStock}
                      type="button"
                    >
                      {isOutOfStock ? (
                        <span className="flex items-center justify-center space-x-2">
                          <span>Sold Out</span>
                          <span>😔</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>Add to Cart</span>
                          <span>🛒</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-purple-800 dark:from-gray-900 dark:to-gray-800 py-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px bg-white/30 flex-1 max-w-20"></div>
            <div className="text-3xl">🧶</div>
            <div className="h-px bg-white/30 flex-1 max-w-20"></div>
          </div>
          <p className="text-purple-100 text-lg font-medium mb-2">
            The Loopy Dragon
          </p>
          <p className="text-purple-200 text-sm opacity-80">
            © {new Date().getFullYear()} — Handcrafted with love • All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}