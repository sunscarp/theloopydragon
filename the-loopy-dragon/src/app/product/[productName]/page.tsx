"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { trackViewContent, trackAddToCart } from "@/utils/metaPixel";
import { Store } from "lucide-react";
import Link from "next/link";
import { isMobile as isMobileSSR } from "react-device-detect";
import MobileFooter from "@/components/mobilefooter";
import DesktopFooter from "@/components/Footer";
import Footer from "@/components/Footer";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

// Conditionally import footer based on device


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
  Description?: string | null;
  Material?: string | null;
  seller_id?: string | null;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetails[]>([]);
  const [sellerInfo, setSellerInfo] = useState<{ shop_name: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showCartConfirmation, setShowCartConfirmation] = useState(false);
  const [addOns, setAddOns] = useState({
    keyChain: false,
    giftWrap: false,
    carMirror: false
  });
  const { addToCart, removeFromCart } = useCart();

  // Add a state to track mobile detection on client
  const [isMobile, setIsMobile] = useState(isMobileSSR);

  useEffect(() => {
    // Detect on client
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from("Inventory")
        .select("id, Product, Price, Tag, Weight, Length, Width, Height, ImageUrl1, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5, Quantity, Description, Material, seller_id, status")
        .eq("Product", decodeURIComponent(params?.productName?.toString() || ""))
        .single();
      if (error || data?.status === "deactivated") {
        setProduct(null);
      } else {
        setProduct(data);
        trackViewContent(data.Product, String(data.id), data.Price);
        if (data.seller_id) {
          const { data: seller } = await supabase
            .from("sellers")
            .select("shop_name, slug")
            .eq("id", data.seller_id)
            .single();
          if (seller) setSellerInfo(seller);
        }
      }
      setLoading(false);
    }
    if (params && params.productName) fetchProduct();
  }, [params]);

  useEffect(() => {
    async function fetchRelatedProducts() {
      if (!product || !product.Tag) return;
      // Split tags by comma, trim whitespace, and filter out empty tags
      const tags = product.Tag.split(",").map(t => t.trim()).filter(Boolean);
      if (tags.length === 0) return;

      // Fetch products that match any of the tags
      const { data, error } = await supabase
        .from("Inventory")
        .select("id, Product, Price, Tag, ImageUrl1, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5, Quantity, status")
        .neq("Product", product.Product);

      if (!error && data) {
        const activeData = data.filter(p => p.status !== "deactivated");
        // For each product, count how many tags match
        const scored = activeData
          .map((p: any) => {
            const pTags = (p.Tag || "").split(",").map((t: string) => t.trim()).filter(Boolean);
            const matchCount = pTags.filter((t: string) => tags.includes(t)).length;
            return { ...p, matchCount };
          })
          .filter((p: any) => p.matchCount > 0)
          .sort((a: any, b: any) => b.matchCount - a.matchCount)
          .slice(0, 4);

        setRelatedProducts(scored);
      }
    }
    if (product) fetchRelatedProducts();
  }, [product]);

  const handleAddToCart = async () => {
    if (!product || (product.Quantity !== undefined && product.Quantity <= 0)) return;
    
    setAddingToCart(true);
    try {
      // Directly add to cart with selected add-ons and quantity
      addToCart(product.id, {
        keyChain: addOns.keyChain,
        giftWrap: addOns.giftWrap,
        carMirror: addOns.carMirror,
        customMessage: "" // No message at product level
      }, quantity);
      
      trackAddToCart(product.Product, String(product.id), product.Price * quantity, quantity);
      
      // Optionally show a quick success message
      setShowCartConfirmation(true);
      setTimeout(() => setShowCartConfirmation(false), 1500);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const renderProductCard = (product: ProductDetails) => {
    const images = [
      product.ImageUrl1,
      product.ImageUrl2,
      product.ImageUrl3,
      product.ImageUrl4,
      product.ImageUrl5,
    ].filter((img): img is string => !!img);
    const isOutOfStock = product.Quantity !== undefined && product.Quantity <= 0;

    return (
      <div
        key={product.id}
        className="p-2 sm:p-4 transition-all duration-300"
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
              <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 400,
            color: '#1F2937',
            marginBottom: '4px',
            lineHeight: '1.4'
          }}>
            {product.Product}
          </h3>
          <span style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 700,
            color: '#1F2937'
          }}>
            ₹{product.Price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F9FF]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F9FF] px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-grey-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" stroke="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">Sorry—we couldn't find the product you're looking for.</p>
          <button
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            onClick={() => router.push("/")}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

  const isOutOfStock = product.Quantity !== undefined && product.Quantity <= 0;

  return (
    <>
      <div
        className="min-h-screen bg-[#F5F9FF] flex flex-col"
        style={{ padding: '0.5rem' }} // Force a little padding on the whole page
      >
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
          <Navbar />
        </div>
        
        <main className="max-w-7xl mx-auto px-4 pb-12 pt-20 flex-grow">
          <div className="mt-4 mb-6 sm:mt-6 sm:mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap py-1">
              <button onClick={() => router.push("/")} className="hover:text-blue-600 transition-colors">
                Home
              </button>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button onClick={() => router.push("/shop")} className="hover:text-blue-600 transition-colors">
                Shop
              </button>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-none">{product.Product}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[50%_50%] gap-6 lg:gap-12">
            <div className="space-y-3">
              <div className="relative w-full aspect-square bg-white overflow-hidden shadow-lg group">
                {images.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <div className="text-6xl mb-4 opacity-40">🧶</div>
                      <p className="text-gray-500">No image available</p>
                    </div>
                  </div>
                ) : (
                  isMobile && images.length > 1 ? (
                    // Swiper for mobile
                    <Swiper
                      slidesPerView={1}
                      spaceBetween={8}
                      pagination={{ clickable: true }}
                      modules={[Pagination]}
                      onSlideChange={(swiper) => setCarouselIndex(swiper.activeIndex)}
                      className="h-full"
                    >
                      {images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                          <img
                            src={img}
                            alt={product.Product}
                            className="w-full h-full object-cover transition-transform duration-700 cursor-zoom-in"
                            style={{ transform: isZoomed ? 'scale(1.1)' : 'scale(1)' }}
                            onClick={() => setIsZoomed(!isZoomed)}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    // Desktop: show single image with prev/next buttons
                    <>
                      <img
                        src={images[carouselIndex]}
                        alt={product.Product}
                        className="w-full h-full object-cover transition-transform duration-700 cursor-zoom-in"
                        style={{ transform: isZoomed ? 'scale(1.1)' : 'scale(1)' }}
                        onClick={() => setIsZoomed(!isZoomed)}
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-16 bg-white/80 shadow-lg flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
                            style={{
                              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                            }}
                            onClick={() => setCarouselIndex(i => (i - 1 + images.length) % images.length)}
                          >
                            <svg className="w-9 h-9 text-gray-600 hover:text-[#D8B6FA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-16 bg-white/80 shadow-lg flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
                            style={{
                              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                            }}
                            onClick={() => setCarouselIndex(i => (i + 1) % images.length)}
                          >
                            <svg className="w-9 h-9 text-gray-600 hover:text-[#D8B6FA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                    </>
                  )
                )}
              </div>
              {images.length > 1 && (
                isMobile ? (
                  // Swiper pagination dots are already shown on mobile
                  <></>
                ) : (
                  <div className="flex justify-center space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`transition-colors hover:bg-[#D8B6FA] ${
                          index === carouselIndex ? 'bg-[#D8B6FA]' : 'bg-[#A4A4A4]'
                        }`}
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%',
                          minWidth: '12px',
                          minHeight: '12px'
                        }}
                        onClick={() => setCarouselIndex(index)}
                      />
                    ))}
                  </div>
                )
              )}
            </div>

            <div className="space-y-4 px-0 sm:pr-4 lg:pr-12">
              <div>
                <div className="flex items-start justify-between">
                  <h1 
                    className="text-gray-900 leading-tight"
                    style={{ 
                      fontFamily: 'Montserrat',
                      fontWeight: '600',
                      fontSize: isMobile ? '2.2rem' : '40px', // Force bigger on mobile
                      lineHeight: isMobile ? '2.6rem' : undefined // Optional: improve line height on mobile
                    }}
                  >
                    {product.Product}
                  </h1>
                  <div className="relative">
                    <button 
                      onClick={handleShare}
                      className="ml-4 w-10 h-10 bg-[#E6EBF3] rounded-full hover:bg-[#D8B6FA] transition-colors flex items-center justify-center"
                      style={{ borderRadius: '50%' }}
                      title="Share product"
                    >
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    {showCopied && (
                      <div className="absolute top-full mt-2 right-0 bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded shadow-lg">
                        Link copied
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[28px] sm:text-[36px] font-medium text-gray-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    ₹{product.Price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-sm text-slate-500 font-medium mt-1"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Store className="w-4 h-4" />
                    {sellerInfo ? (
                      <Link href={`/sellers/${sellerInfo.slug}`} className="text-purple-600 hover:underline">
                        Sold by {sellerInfo.shop_name}
                      </Link>
                    ) : "Sold by The Loopy Dragon"}
                  </div>
                </div>
              </div>

              <div>
                {product.Description && (
                  <p 
                    className="text-gray-900 mb-2"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '500',
                      fontSize: '15px'
                    }}
                  >
                    {product.Description}
                  </p>
                )}
                <div className="mt-4"></div>
                <h3 
                  className="text-gray-900 mb-2"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: '500',
                    fontSize: '15px'
                  }}
                >
                  Product Specifications
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li 
                    className="text-gray-900"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '500',
                      fontSize: '15px'
                    }}
                  >
                    Size: {product.Length || '6'}cm x {product.Width || '6'}cm x {product.Height || '15'}cm
                  </li>
                  <li 
                    className="text-gray-900"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '500',
                      fontSize: '15px'
                    }}
                  >
                    Material: {product.Material || 'Cotton yarn, Natural wood ring'}
                  </li>
                </ul>
                <div className="mt-4"></div>
              </div>

              <div className="space-y-3">
                {!isOutOfStock && (
                  <div className="flex flex-col space-y-1">
                    <label 
                      className="text-gray-900"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: '500',
                        fontSize: '15px'
                      }}
                    >
                      Quantity:
                    </label>
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center border border-gray-300">
                        <button
                          className="px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.Quantity || 99}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, product.Quantity || 99)))}
                          className="w-16 sm:w-24 h-14 px-3 py-3 text-center border-0 bg-transparent focus:outline-none text-gray-900"
                          style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: '500',
                            fontSize: '16px'
                          }}
                        />
                        <button
                          className="px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          onClick={() => setQuantity(Math.min((product.Quantity || 99), quantity + 1))}
                          disabled={quantity >= (product.Quantity || 99)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || addingToCart}
                        className={`flex items-center justify-center px-3 py-3 font-bold transition-all duration-200 w-full max-w-[calc(100%-120px)] ${
                          isOutOfStock
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : addingToCart
                            ? 'bg-[#D8B6FA] text-black cursor-wait'
                            : 'bg-[#D8B6FA] hover:bg-[#C4A2E6] text-black'
                        }`}
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: '700',
                          fontSize: '16px',
                          borderRadius: '0',
                          height: '56px'
                        }}
                      >
                        {addingToCart ? (
                          <>
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
                            Adding...
                          </>
                        ) : isOutOfStock ? (
                          <>
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Sold Out
                          </>
                        ) : (
                          'Add to Basket'
                        )}
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-4"></div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span 
                      className="text-gray-900"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: '500',
                        fontSize: '15px'
                      }}
                    >
                      Free shipping on orders above ₹1000
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-4 h-4 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-7V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span 
                      className="text-gray-900"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: '500',
                        fontSize: '15px'
                      }}
                    >
                      Secure payment processing through Razorpay
                    </span>
                  </div>
                  <div className="mt-4"></div>
                  <div className="flex items-start space-x-3">
                    <span 
                      className="text-gray-900"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: '500',
                        fontSize: '15px'
                      }}
                    >
                      Want to further customize this order? Tell us what you want and we'll get back to you!{' '}
                      <a 
                        href="/custom-order" 
                        className="hover:underline"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: '500',
                          fontSize: '15px',
                          color: '#D8B6FA',
                          textDecoration: 'underline'
                        }}
                      >
                        Click here to customise
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
  <section className="mt-12 max-w-7xl mx-auto px-0 sm:px-4">
    <hr className="border-t border-gray-300 mb-8" />
    <h2
      className="text-gray-900 mb-8"
      style={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '600',
        fontSize: isMobile ? '24px' : '32px',
        textAlign: 'center'
      }}
    >
      Matching Vibes
    </h2>
    
    {isMobile ? (
      // Mobile carousel version
      <div className="px-4">
        <Swiper
          slidesPerView={1.2}
          spaceBetween={16}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination]}
          breakpoints={{
            480: {
              slidesPerView: 1.5
            },
            640: {
              slidesPerView: 2.2
            }
          }}
        >
          {relatedProducts.map((relatedProduct) => (
            <SwiperSlide key={relatedProduct.id}>
              {renderProductCard(relatedProduct)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    ) : (
      // Desktop grid version
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map((relatedProduct) => renderProductCard(relatedProduct))}
      </div>
    )}
  </section>
)}
        </main>
      </div>


      {showCartConfirmation && (
        <div className="fixed left-1/2 bottom-8 z-50 transform -translate-x-1/2 animate-slide-up"
             style={{ minWidth: '260px', maxWidth: '90vw' }}>
          <div className="bg-white shadow-xl border border-gray-200 rounded-full px-6 py-3 flex items-center justify-center">
            <div className="w-8 h-8 bg-green-100 flex items-center justify-center rounded-full mr-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-black font-medium" style={{ fontFamily: 'Montserrat', fontSize: '15px' }}>Added to basket!</p>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
      <style jsx global>{`
        /* Force footer to be visible */
        main {
          min-height: calc(100vh - 200px);
          padding-bottom: 100px;
        }
      `}</style>
    </>
  );
}

// Add helper function to generate cart key (same as in CartContext)
const generateCartKey = (id: number, addons?: any): string => {
  if (!addons) return `${id}`;
  
  // Create a consistent string representation of the add-ons
  const keyChain = addons.keyChain ? '1' : '0';
  const giftWrap = addons.giftWrap ? '1' : '0';
  const carMirror = addons.carMirror ? '1' : '0';
  const message = addons.customMessage?.substring(0, 10) || '';
  
  return `${id}_${keyChain}${giftWrap}${carMirror}_${message}`;
};