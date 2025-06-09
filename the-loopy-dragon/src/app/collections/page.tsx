"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

type CollectionProduct = {
  id: number;
  Product: string;
  Price: number;
  Collection: string;
  Quantity?: number;
  ImageUrl1?: string | null;
  ImageUrl2?: string | null;
  ImageUrl3?: string | null;
  ImageUrl4?: string | null;
  ImageUrl5?: string | null;
};

export default function Collections() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { cart, addToCart, isLoaded } = useCart();

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Reduced threshold for smoother transition
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  useEffect(() => {
    async function fetchCollections() {
      setLoading(true);
      const { data, error } = await supabase
        .from('Inventory')
        .select(`
          id,
          Product,
          Price,
          Quantity,
          ImageUrl1,
          ImageUrl2,
          ImageUrl3,
          ImageUrl4,
          ImageUrl5,
          Collections (
            id,
            Collection
          )
        `);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const formattedProducts = data.map((item: any) => ({
          id: item.id,
          Product: item.Product,
          Price: item.Price,
          Quantity: item.Quantity,
          ImageUrl1: item.ImageUrl1,
          ImageUrl2: item.ImageUrl2,
          ImageUrl3: item.ImageUrl3,
          ImageUrl4: item.ImageUrl4,
          ImageUrl5: item.ImageUrl5,
          Collection: item.Collections?.Collection || 'Other'
        }));
        setProducts(formattedProducts);
      }
      setLoading(false);
    }

    fetchCollections();
  }, []);

  const groupedProducts = useMemo(() => {
    return products
      .filter(product => product.Collection && product.Collection.trim() !== "" && product.Collection !== "Other")
      .reduce((groups: { [key: string]: CollectionProduct[] }, product) => {
        const collection = product.Collection;
        if (!groups[collection]) {
          groups[collection] = [];
        }
        groups[collection].push(product);
        return groups;
      }, {});
  }, [products]);

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

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Loading collections...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-red-500 dark:text-red-400 text-lg bg-red-50 dark:bg-red-900/50 rounded-2xl p-6 text-center max-w-md shadow-lg">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="font-semibold mb-2">Oops! Something went wrong</div>
          <div className="text-sm opacity-80">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex flex-col font-sans">
      {/* Sticky Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-md py-2 px-4 sm:px-6'
            : 'bg-transparent py-4 px-6 sm:px-8'
        }`}
      >
        <Navbar />
      </div>

      {/* Spacer to prevent content overlap with fixed navbar */}
      <div className="h-16 sm:h-20"></div>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 dark:from-purple-900 dark:via-purple-800 dark:to-purple-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-300/20 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative z-10 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
              Our Beautiful
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200 mt-2">
                Collections
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed opacity-90">
              Discover handcrafted crochet pieces made with love, care, and attention to every detail
            </p>
            
            <div className="mt-8 flex items-center justify-center space-x-2">
              <div className="h-px bg-white/30 w-8 sm:w-12"></div>
              <div className="text-white/60 text-2xl">🧶</div>
              <div className="h-px bg-white/30 w-8 sm:w-12"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <main className="flex-1 max-w-7xl mx-auto py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-8">
        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl sm:text-8xl mb-6 opacity-20">🧶</div>
            <div className="text-xl sm:text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">
              No collections available
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Check back soon for new handcrafted pieces!
            </div>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {Object.entries(groupedProducts).map(([collection, products], index) => (
              <div key={collection} className="group">
                <div className="text-center mb-8 sm:mb-12">
                  <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl mb-4 shadow-sm">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {collection}
                    <span className="block text-lg sm:text-xl font-normal text-purple-600 dark:text-purple-400 mt-1">
                      Collection
                    </span>
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {products.map((product, productIndex) => {
                    const images = [
                      product.ImageUrl1,
                      product.ImageUrl2,
                      product.ImageUrl3,
                      product.ImageUrl4,
                      product.ImageUrl5,
                    ].filter((img): img is string => !!img);
                    const currentIndex = carouselIndexes[product.id] || 0;
                    return (
                      <div
                        key={product.id}
                        className="group/card bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl p-4 sm:p-6 flex flex-col transform transition-all duration-300 hover:scale-[1.02] border border-gray-100 dark:border-gray-700"
                        style={{
                          animationDelay: `${productIndex * 100}ms`
                        }}
                      >
                        <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-4 overflow-hidden group-hover/card:shadow-lg transition-shadow duration-300 flex items-center justify-center">
                          {images.length === 0 ? (
                            <div className="flex items-center justify-center h-full w-full">
                              <span className="text-4xl sm:text-5xl lg:text-6xl opacity-40 group-hover/card:opacity-60 transition-opacity" role="img" aria-label={product.Product}>
                                🧶
                              </span>
                            </div>
                          ) : images.length === 1 ? (
                            <img
                              src={images[0]}
                              alt={product.Product}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <>
                              <img
                                src={images[currentIndex]}
                                alt={product.Product}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                                loading="lazy"
                              />
                              {/* Carousel Controls */}
                              <button
                                type="button"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-700/70 rounded-full p-1 shadow hover:bg-white dark:hover:bg-gray-800 transition"
                                onClick={() => handleCarouselChange(product.id, images.length, -1)}
                                aria-label="Previous image"
                              >
                                <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-700/70 rounded-full p-1 shadow hover:bg-white dark:hover:bg-gray-800 transition"
                                onClick={() => handleCarouselChange(product.id, images.length, 1)}
                                aria-label="Next image"
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
                          {product.Quantity !== undefined && product.Quantity <= 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                                Sold Out
                              </span>
                            </div>
                          )}
                          {product.Quantity !== undefined && product.Quantity > 0 && product.Quantity <= 3 && (
                            <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                              Only {product.Quantity} left
                            </span>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover/card:text-purple-600 dark:group-hover/card:text-purple-400 transition-colors">
                            {product.Product}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-4 mt-auto">
                            <div className="flex items-baseline space-x-1">
                              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{product.Price?.toFixed(2)}
                              </span>
                            </div>
                            
                            {product.Quantity !== undefined && product.Quantity > 0 && (
                              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                In stock
                              </div>
                            )}
                          </div>

                          <button
                            className={`w-full py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 ${
                              product.Quantity !== undefined && product.Quantity <= 0
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                            }`}
                            onClick={() => product.Quantity !== undefined && product.Quantity > 0 && addToCart(product.id)}
                            disabled={product.Quantity !== undefined && product.Quantity <= 0}
                          >
                            {product.Quantity !== undefined && product.Quantity <= 0 ? (
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
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}