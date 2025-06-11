"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

type ProductDetails = {
  id: number;
  Product: string;
  Price: number;
  Tag?: string | null;
  Weight?: string | null;
  Length?: string | null;
  Width?: string | null;
  Height?: string | null;
  ImageUrl1?: string | null;
  ImageUrl2?: string | null;
  ImageUrl3?: string | null;
  ImageUrl4?: string | null;
  ImageUrl5?: string | null;
  Quantity?: number;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from("Inventory")
        .select("id, Product, Price, Tag, Weight, Length, Width, Height, ImageUrl1, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5, Quantity")
        .eq("Product", decodeURIComponent(params?.productName?.toString() || ""))
        .single();
      if (error) {
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }
    if (params && params.productName) fetchProduct();
  }, [params]);

  const handleAddToCart = async () => {
    if (!product || (product.Quantity !== undefined && product.Quantity <= 0)) return;
    
    setAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart(product.id);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Sorry, we couldn't find the product you're looking for.</p>
          <button
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            onClick={() => router.push("/")}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const images = [
    product.ImageUrl1,
    product.ImageUrl2,
    product.ImageUrl3,
    product.ImageUrl4,
    product.ImageUrl5,
  ].filter((img): img is string => !!img);

  const specs = [
    { label: "Weight", value: product.Weight ? `${product.Weight} g` : undefined, icon: "⚖️" },
    { label: "Length", value: product.Length ? `${product.Length} cm` : undefined, icon: "📏" },
    { label: "Width", value: product.Width ? `${product.Width} cm` : undefined, icon: "↔️" },
    { label: "Height", value: product.Height ? `${product.Height} cm` : undefined, icon: "↕️" },
  ].filter(spec => spec.value);

  const isOutOfStock = product.Quantity !== undefined && product.Quantity <= 0;
  const isLowStock = product.Quantity !== undefined && product.Quantity <= 5 && product.Quantity > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <Navbar />
      </div>
      
      {/* Breadcrumb */}
      <div className="pt-20 pb-4 px-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <button onClick={() => router.push("/")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 dark:text-white font-medium truncate">{product.Product}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg group">
              {images.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                  <div className="text-center">
                    <div className="text-6xl mb-4 opacity-40">🧶</div>
                    <p className="text-gray-500 dark:text-gray-400">No image available</p>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={images[carouselIndex]}
                    alt={product.Product}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isZoomed ? 'scale-110' : 'scale-100'} cursor-zoom-in`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                        onClick={() => setCarouselIndex(i => (i - 1 + images.length) % images.length)}
                      >
                        <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                        onClick={() => setCarouselIndex(i => (i + 1) % images.length)}
                      >
                        <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === carouselIndex 
                        ? 'border-blue-500 shadow-lg scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setCarouselIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.Product} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title & Tag */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  {product.Product}
                </h1>
                {/* Render multiple tags if present */}
                {product.Tag && (
                  <div className="ml-4 flex flex-wrap gap-2">
                    {product.Tag.split(",").map((tag, idx) => (
                      <span
                        key={idx}
                        className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Stock Status */}
              <div className="flex items-center space-x-3 mb-4">
                {isOutOfStock ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Only {product.Quantity} left
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                ₹{product.Price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inclusive of all taxes</p>
            </div>

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setShowSpecs(!showSpecs)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Specifications</h3>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showSpecs ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showSpecs && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {specs.map((spec, index) => (
                        <div key={spec.label} className="flex items-center space-x-3">
                          <span className="text-2xl">{spec.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{spec.label}</div>
                            <div className="text-base font-semibold text-gray-900 dark:text-white">{spec.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              {!isOutOfStock && (
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.Quantity || 99}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, product.Quantity || 99)))}
                      className="w-16 px-2 py-2 text-center border-0 bg-transparent focus:outline-none text-gray-900 dark:text-white"
                    />
                    <button
                      className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      onClick={() => setQuantity(Math.min((product.Quantity || 99), quantity + 1))}
                      disabled={quantity >= (product.Quantity || 99)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart}
                  className={`flex-1 flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                    isOutOfStock
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : addingToCart
                      ? 'bg-blue-400 text-white cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  style={
                    !isOutOfStock && !addingToCart
                      ? { backgroundColor: "#2563eb", color: "#fff", opacity: 1 }
                      : undefined
                  }
                >
                  {addingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Adding...
                    </>
                  ) : isOutOfStock ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Sold Out
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0H17M9 19a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  disabled={isOutOfStock}
                  className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all duration-200 ${
                    isOutOfStock
                      ? 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-300">Free shipping on orders above ₹1000</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-300">Secure payment processing through Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}