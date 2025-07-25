"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import Footer from "@/components/Footer";
import { redirectToMobile } from "@/utils/deviceDetection";
import { getRandomDragonOffer, applyOfferToCart } from "@/utils/dragonOffers";

// Import DragonOffer type from utils to ensure consistency
import type { DragonOffer } from "@/utils/dragonOffers";

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

  // Dragon popup state
  const [showDragon, setShowDragon] = useState<boolean>(false);
  const [showDragonPopup, setShowDragonPopup] = useState<boolean>(false);
  const [dragonCaught, setDragonCaught] = useState<boolean>(false);
  const [dragonOffer, setDragonOffer] = useState<DragonOffer | null>(null);

  // Track if free offer has been claimed
  const [freeOfferClaimed, setFreeOfferClaimed] = useState<boolean>(false);

  // Initialize freeOfferClaimed from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFreeOfferClaimed(sessionStorage.getItem("freeOfferClaimed") === "true");
    }
  }, []);

  // Dragon flight pause and count state (track each dragon separately)
  const [dragonPause, setDragonPause] = useState<boolean>(false);
  const [dragon1FlightCount, setDragon1FlightCount] = useState<number>(0);
  const [dragon2FlightCount, setDragon2FlightCount] = useState<number>(0);

  // Dragon animation state for two dragons
  const [dragon1Start, setDragon1Start] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [dragon1End, setDragon1End] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [dragon1Angle, setDragon1Angle] = useState<number>(0);
  const [dragon1Key, setDragon1Key] = useState<number>(1); // Start from 1

  const [dragon2Start, setDragon2Start] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [dragon2End, setDragon2End] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [dragon2Angle, setDragon2Angle] = useState<number>(0);
  const [dragon2Key, setDragon2Key] = useState<number>(2); // Start from 2

  // Rare dragon state
  const [rareDragonStart, setRareDragonStart] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [rareDragonEnd, setRareDragonEnd] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [rareDragonAngle, setRareDragonAngle] = useState<number>(0);
  const [rareDragonKey, setRareDragonKey] = useState<number>(1);
  const [showRareDragon, setShowRareDragon] = useState<boolean>(false);
  const [showRareDragonWarning, setShowRareDragonWarning] = useState<boolean>(false);

  // Lightning effect state for rare dragon
  const [showLightningEffect, setShowLightningEffect] = useState<boolean>(false);

  // Always use a high speed (short duration)
  const DRAGON_SPEED_SECONDS = 1.4; // fast, but visible
  const RARE_DRAGON_SPEED_SECONDS = 1.1; // a little slower than before

  // Helper to get random position and angle (reuse)
  function getRandomDragonFlight() {
    const padding = 60;
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    const h = typeof window !== "undefined" ? window.innerHeight : 800;
    const edges = ["top", "bottom", "left", "right"];
    const startEdge = edges[Math.floor(Math.random() * 4)];
    let start = {x: 0, y: 0};
    let end = {x: 0, y: 0};

    if (startEdge === "top") {
      start = {x: Math.random() * (w - padding * 2) + padding, y: -80};
      const endEdge = ["bottom", "left", "right"][Math.floor(Math.random() * 3)];
      if (endEdge === "bottom") end = {x: Math.random() * (w - padding * 2) + padding, y: h + 80};
      if (endEdge === "left") end = {x: -140, y: Math.random() * (h - padding * 2) + padding};
      if (endEdge === "right") end = {x: w + 140, y: Math.random() * (h - padding * 2) + padding};
    } else if (startEdge === "bottom") {
      start = {x: Math.random() * (w - padding * 2) + padding, y: h + 80};
      const endEdge = ["top", "left", "right"][Math.floor(Math.random() * 3)];
      if (endEdge === "top") end = {x: Math.random() * (w - padding * 2) + padding, y: -80};
      if (endEdge === "left") end = {x: -140, y: Math.random() * (h - padding * 2) + padding};
      if (endEdge === "right") end = {x: w + 140, y: Math.random() * (h - padding * 2) + padding};
    } else if (startEdge === "left") {
      start = {x: -140, y: Math.random() * (h - padding * 2) + padding};
      const endEdge = ["top", "bottom", "right"][Math.floor(Math.random() * 3)];
      if (endEdge === "top") end = {x: Math.random() * (w - padding * 2) + padding, y: -80};
      if (endEdge === "bottom") end = {x: Math.random() * (w - padding * 2) + padding, y: h + 80};
      if (endEdge === "right") end = {x: w + 140, y: Math.random() * (h - padding * 2) + padding};
    } else {
      start = {x: w + 140, y: Math.random() * (h - padding * 2) + padding};
      const endEdge = ["top", "bottom", "left"][Math.floor(Math.random() * 3)];
      if (endEdge === "top") end = {x: Math.random() * (w - padding * 2) + padding, y: -80};
      if (endEdge === "bottom") end = {x: Math.random() * (w - padding * 2) + padding, y: h + 80};
      if (endEdge === "left") end = {x: -140, y: Math.random() * (h - padding * 2) + padding};
    }
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
    return {start, end, angle};
  }

  // Show dragon unless dismissed in this session or free offer claimed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("dragonDismissed");
      const freeClaimed = sessionStorage.getItem("freeOfferClaimed") === "true";
      if (!dismissed && !freeClaimed) {
        const timeout = setTimeout(() => {
          setShowDragon(true);
          setDragonCaught(false);
          setDragon1FlightCount(0);
          setDragon2FlightCount(0);
        }, 10000); // 10 seconds
        return () => clearTimeout(timeout);
      }
    }
  }, []);

  // Normal dragons timer - every 30 seconds, but not if free offer claimed
  useEffect(() => {
    if (freeOfferClaimed) return;
    const interval = setInterval(() => {
      if (!showDragonPopup && !dragonCaught && !freeOfferClaimed) {
        setShowDragon(true);
        setDragonCaught(false);
        setDragon1FlightCount(0);
        setDragon2FlightCount(0);
        setDragonPause(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [showDragonPopup, dragonCaught, freeOfferClaimed]);

  // Rare dragon timer - every 2 minutes, but not if free offer claimed
  useEffect(() => {
    if (freeOfferClaimed) return;
    const interval = setInterval(() => {
      if (!showDragonPopup && !dragonCaught && !freeOfferClaimed) {
        // Start lightning effect
        setShowLightningEffect(true);
        
        // End lightning effect and show rare dragon after 3 seconds
        setTimeout(() => {
          setShowLightningEffect(false);
          const {start, end, angle} = getRandomDragonFlight();
          setRareDragonStart(start);
          setRareDragonEnd(end);
          setRareDragonAngle(angle);
          setRareDragonKey(prev => prev + 1);
          setShowRareDragon(true);
          setTimeout(() => {
            setShowRareDragon(false);
          }, RARE_DRAGON_SPEED_SECONDS * 1000 + 100);
        }, 3000);
      }
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [showDragonPopup, dragonCaught, freeOfferClaimed]);

  // Pause after 4 flights per dragon, resume after 2 minutes
  useEffect(() => {
    if ((dragon1FlightCount >= 4 && dragon2FlightCount >= 4) && !dragonPause) {
      setDragonPause(true);
      setShowDragon(false);
      const timeout = setTimeout(() => {
        setDragon1FlightCount(0);
        setDragon2FlightCount(0);
        setDragonPause(false);
        setShowDragon(true);
      }, 1 * 60 * 1000); // 1 minute
      return () => clearTimeout(timeout);
    }
  }, [dragon1FlightCount, dragon2FlightCount, dragonPause]);

  // Always randomize direction and position for both dragons
  useEffect(() => {
    if (showDragon) {
      const {start, end, angle} = getRandomDragonFlight();
      setDragon1Start(start);
      setDragon1End(end);
      setDragon1Angle(angle);
      setDragon1Key(prev => prev + 2); // Always even

      // Make sure the second dragon has a different path
      let s2, e2, a2;
      do {
        const {start: s, end: e, angle: a} = getRandomDragonFlight();
        s2 = s; e2 = e; a2 = a;
      } while (
        Math.abs(s2.x - start.x) < 100 && Math.abs(s2.y - start.y) < 100
      );
      setDragon2Start(s2);
      setDragon2End(e2);
      setDragon2Angle(a2);
      setDragon2Key(prev => prev + 2); // Always odd
    }
  }, [showDragon, dragonCaught]);

  // Listen for animation end to restart both dragons and count flights
  useEffect(() => {
    if (!showDragon) return;
    const handler1 = () => {
      if (!showDragonPopup && !dragonCaught) {
        setDragon1FlightCount(count => count + 1);
        if (dragon1FlightCount < 3) { // 0,1,2,3 = 4 flights
          const {start, end, angle} = getRandomDragonFlight();
          setDragon1Start(start);
          setDragon1End(end);
          setDragon1Angle(angle);
          setDragon1Key(prev => prev + 1);
        }
      }
    };
    const handler2 = () => {
      if (!showDragonPopup && !dragonCaught) {
        setDragon2FlightCount(count => count + 1);
        if (dragon2FlightCount < 3) {
          const {start, end, angle} = getRandomDragonFlight();
          setDragon2Start(start);
          setDragon2End(end);
          setDragon2Angle(angle);
          setDragon2Key(prev => prev + 1);
        }
      }
    };
    const el1 = document.getElementById("flying-dragon-1");
    const el2 = document.getElementById("flying-dragon-2");
    if (el1) el1.addEventListener("animationend", handler1);
    if (el2) el2.addEventListener("animationend", handler2);
    return () => {
      if (el1) el1.removeEventListener("animationend", handler1);
      if (el2) el2.removeEventListener("animationend", handler2);
    };
  }, [showDragon, showDragonPopup, dragonCaught, dragon1Key, dragon2Key, dragon1FlightCount, dragon2FlightCount]);

  const handleDragonClick = () => {
    if (freeOfferClaimed) return;
    const offer = getRandomDragonOffer();
    setDragonOffer(offer);
    setShowDragonPopup(true);
    setDragonCaught(true);
  };

  const handleRareDragonClick = () => {
    if (freeOfferClaimed) return;
    const rareDragonOffer: DragonOffer = {
      id: 'rare_dragon_50',
      type: 'discount',
      title: '🌟 RARE DRAGON SPECIAL! 50% OFF! 🌟',
      description: 'The legendary rare dragon grants you 50% off your entire order!',
      value: 50,
      code: 'RAREDRAGON50',
      weight: 0
    };
    setDragonOffer(rareDragonOffer);
    setShowDragonPopup(true);
    setDragonCaught(true);
    setShowRareDragon(false);
  };

  const handleDragonPopupClose = () => {
    setShowDragon(false);
    setShowDragonPopup(false);
    setDragonOffer(null);
    // Reset dragon state for next appearance, but not if free offer claimed
    setTimeout(() => {
      setDragonCaught(false);
      setDragon1FlightCount(0);
      setDragon2FlightCount(0);
      setDragonPause(false);
    }, 1000);
  };

  const handleDragonTryAgain = () => {
    // Allow dragons again
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("freeOfferClaimed");
    }
    setFreeOfferClaimed(false);
    setShowDragon(false);
    setShowDragonPopup(false);
    setDragonOffer(null);
    setTimeout(() => {
      setDragonCaught(false);
      setDragon1FlightCount(0);
      setDragon2FlightCount(0);
      setShowDragon(true);
    }, 50);
  };

  const handleClaimOffer = () => {
    if (dragonOffer) {
      applyOfferToCart(dragonOffer);

      // If it's a free product, add to cart and block all future dragons
      if (dragonOffer.type === 'free_product' && dragonOffer.productId) {
        addToCart(dragonOffer.productId);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("freeOfferClaimed", "true");
        }
        setFreeOfferClaimed(true);
        setTimeout(() => {
          router.push('/cart');
        }, 500);
      } 
      // If it's a discount offer, allow dragons as usual
      else if (dragonOffer.type === 'discount') {
        router.push('/cart');
      }
    }
    handleDragonPopupClose();
  };

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

  const filteredProducts = products
    // Hide special offer products (IDs 999001–999004)
    .filter(product => ![999001, 999002, 999003, 999004].includes(product.id))
    .filter(product => {
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
    <div className="min-h-screen bg-[#F5F9FF]" style={{ fontFamily: 'sans-serif', position: 'relative', zIndex: 0 }}>
      {/* Page Flicker Effect - only background flashes, content stays visible */}
      {showLightningEffect && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            pointerEvents: "none",
            mixBlendMode: "darken",
            background: "transparent", // Start as transparent
            animation: "pageFlickerBg 1s ease-in-out"
          }}
        />
      )}

      {/* Rare Dragon */}
      {showRareDragon && !freeOfferClaimed && (
        <div
          id="rare-dragon"
          key={`rare-dragon-${rareDragonKey}`}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "150px",
            height: "100px",
            zIndex: 10,
            pointerEvents: showDragonPopup ? "none" : "auto",
            transform: `translate(${rareDragonStart.x}px, ${rareDragonStart.y}px)`,
            transition: "none",
            animation: `rare-dragon-fly-${rareDragonKey} ${RARE_DRAGON_SPEED_SECONDS}s linear forwards`,
            cursor: "pointer",
            userSelect: "none",
            filter: "drop-shadow(0 0 20px #fbbf24) drop-shadow(0 0 40px #f59e0b)",
          }}
          onClick={handleRareDragonClick}
          aria-label="Rare Flying Dragon"
        >
          <img
            src="/loopydragon3.png"
            alt="Rare Flying Dragon"
            width={150}
            height={100}
            style={{
              width: "150px",
              height: "100px",
              display: "block",
              pointerEvents: "none",
              userSelect: "none",
              // Left to right: flip horizontally and invert angle; right to left: keep as is
              transform:
                rareDragonEnd.x > rareDragonStart.x
                  ? `scaleX(-1) rotate(${-rareDragonAngle}deg)`
                  : `scaleX(-1) scaleY(-1) rotate(${rareDragonAngle}deg)`,
            }}
            draggable={false}
          />
          <style>{`
            @keyframes rare-dragon-fly-${rareDragonKey} {
              from {
                transform: translate(${rareDragonStart.x}px, ${rareDragonStart.y}px);
              }
              to {
                transform: translate(${rareDragonEnd.x}px, ${rareDragonEnd.y}px);
              }
            }
            @keyframes pulse-warning {
              from {
                transform: translateX(-50%) scale(1);
              }
              to {
                transform: translateX(-50%) scale(1.05);
              }
            }
          `}</style>
        </div>
      )}

      {/* Two Flying Dragons - random angle and random places, infinite */}
      {showDragon && !dragonPause && !freeOfferClaimed && (
        <>
          <div
            id="flying-dragon-1"
            key={`dragon1-${dragon1Key}`}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "120px",
              height: "80px",
              zIndex: 10,
              pointerEvents: showDragonPopup ? "none" : "auto",
              transform: `translate(${dragon1Start.x}px, ${dragon1Start.y}px)`,
              transition: "none",
              animation: `dragon-fly-xy-1-${dragon1Key} ${DRAGON_SPEED_SECONDS}s linear forwards`,
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={handleDragonClick}
            aria-label="Flying Dragon"
          >
            <img
              src="/loopydragon.png"
              alt="Flying Dragon"
              width={120}
              height={80}
              style={{
                width: "120px",
                height: "80px",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
                // Left to right: flip horizontally and invert angle; right to left: keep as is
                transform:
                  dragon1End.x > dragon1Start.x
                    ? `scaleX(-1) rotate(${-dragon1Angle}deg)`
                    : `scaleX(-1) scaleY(-1) rotate(${dragon1Angle}deg)`,
              }}
              draggable={false}
            />
            <style>{`
              @keyframes dragon-fly-xy-1-${dragon1Key} {
                from {
                  transform: translate(${dragon1Start.x}px, ${dragon1Start.y}px);
                }
                to {
                  transform: translate(${dragon1End.x}px, ${dragon1End.y}px);
                }
              }
            `}</style>
          </div>
          <div
            id="flying-dragon-2"
            key={`dragon2-${dragon2Key}`}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "120px",
              height: "80px",
              zIndex: 10,
              pointerEvents: showDragonPopup ? "none" : "auto",
              transform: `translate(${dragon2Start.x}px, ${dragon2Start.y}px)`,
              transition: "none",
              animation: `dragon-fly-xy-2-${dragon2Key} ${DRAGON_SPEED_SECONDS}s linear forwards`,
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={handleDragonClick}
            aria-label="Flying Dragon"
          >
            <img
              src="/loopydragon2.png"
              alt="Flying Dragon 2"
              width={120}
              height={80}
              style={{
                width: "120px",
                height: "80px",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
                // Left to right: flip horizontally and invert angle; right to left: keep as is
                transform:
                  dragon2End.x > dragon2Start.x
                    ? `scaleX(-1) rotate(${-dragon2Angle}deg)`
                    : `scaleX(-1) scaleY(-1) rotate(${dragon2Angle}deg)`,
              }}
              draggable={false}
            />
            <style>{`
              @keyframes dragon-fly-xy-2-${dragon2Key} {
                from {
                  transform: translate(${dragon2Start.x}px, ${dragon2Start.y}px);
                }
                to {
                  transform: translate(${dragon2End.x}px, ${dragon2End.y}px);
                }
              }
            `}</style>
          </div>
        </>
      )}

      {/* Dragon Popup */}
      {showDragonPopup && dragonOffer && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              background: dragonOffer.id === 'rare_dragon_50' 
                ? "linear-gradient(135deg, #fef3c7, #fbbf24)" 
                : "#fff",
              borderRadius: "1.5rem",
              boxShadow: dragonOffer.id === 'rare_dragon_50'
                ? "0 8px 32px rgba(251, 191, 36, 0.5)"
                : "0 8px 32px rgba(0,0,0,0.18)",
              padding: "2.5rem 2rem 2rem",
              maxWidth: "400px",
              textAlign: "center",
              position: "relative",
              border: dragonOffer.id === 'rare_dragon_50' ? "3px solid #f59e0b" : "none"
            }}
          >
            {/* Special styling for rare dragon offer */}
            {dragonOffer.id === 'rare_dragon_50' && (
              <div style={{
                position: "absolute",
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "Montserrat, sans-serif"
              }}>
                LEGENDARY RARE
              </div>
            )}
            
            <div style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: dragonOffer.id === 'rare_dragon_50' ? "1.4rem" : "1.25rem",
              color: dragonOffer.id === 'rare_dragon_50' ? "#92400e" : "#6b21a8",
              marginBottom: "0.5rem"
            }}>
              {dragonCaught ? "You caught the offer!" : "Hi there, traveler!"}
            </div>
            
            {dragonOffer.value === 0 && dragonOffer.title.includes('Try Again') ? (
              // Try again offer
              <>
                <div style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 400,
                  fontSize: "1rem",
                  color: "#22223B",
                  marginBottom: "1.5rem"
                }}>
                  {dragonOffer.description}
                </div>
                <button
                  onClick={handleDragonTryAgain}
                  style={{
                    background: "linear-gradient(90deg, #a21caf 0%, #f472b6 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 2rem",
                    fontWeight: 600,
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "background 0.2s",
                    marginRight: "0.5rem"
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={handleDragonPopupClose}
                  style={{
                    background: "transparent",
                    color: "#6b7280",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 2rem",
                    fontWeight: 600,
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginTop: "0.5rem"
                  }}
                >
                  Maybe Later
                </button>
              </>
            ) : (
              // Actual offer
              <>
                <div style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  fontSize: dragonOffer.id === 'rare_dragon_50' ? "1.3rem" : "1.1rem",
                  color: dragonOffer.id === 'rare_dragon_50' ? "#92400e" : "#059669",
                  marginBottom: "0.5rem"
                }}>
                  {dragonOffer.title}
                </div>
                <div style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 400,
                  fontSize: "0.9rem",
                  color: dragonOffer.id === 'rare_dragon_50' ? "#92400e" : "#22223B",
                  marginBottom: "1.5rem"
                }}>
                  {dragonOffer.type === 'free_product' 
                    ? `Congratulations! You've won a ${dragonOffer.title.replace('Free ', '').replace('!', '')}. It will be added to your cart for free!`
                    : dragonOffer.description
                  }
                </div>
                <button
                  onClick={handleClaimOffer}
                  style={{
                    background: dragonOffer.id === 'rare_dragon_50' 
                      ? "linear-gradient(90deg, #d97706 0%, #f59e0b 100%)"
                      : "linear-gradient(90deg, #059669 0%, #10b981 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 2rem",
                    fontWeight: 600,
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "background 0.2s",
                    marginRight: "0.5rem"
                  }}
                >
                  {dragonOffer.type === 'free_product' ? 'Add Free Item!' : 'Claim Offer!'}
                </button>
                <button
                  onClick={handleDragonPopupClose}
                  style={{
                    background: "transparent",
                    color: "#6b7280",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 2rem",
                    fontWeight: 600,
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginTop: "0.5rem"
                  }}
                >
                  No Thanks
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dragon flying animation keyframes */}
      <style>{`
        @keyframes dragon-fly-right {
          0% { left: -140px; }
          100% { left: 100vw; }
        }
        @keyframes dragon-fly-left {
          0% { right: -140px; }
          100% { right: 100vw; }
        }
        @keyframes pageFlicker {
          0% { opacity: 0; }
          20% { opacity: 0.7; }
          40% { opacity: 0.2; }
          60% { opacity: 0.8; }
          80% { opacity: 0.1; }
          100% { opacity: 0; }
        }
        @keyframes pageFlickerBg {
          0% { background: transparent; opacity: 0; }
          10% { background: #000; opacity: 0.7; }
          30% { background: #000; opacity: 0.2; }
          50% { background: #000; opacity: 0.8; }
          70% { background: #000; opacity: 0.1; }
          100% { background: transparent; opacity: 0; }
        }
      `}</style>
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-transparent'
      }`}>
        <Navbar />
      </div>
      
      <div style={{ height: '80px' }}></div>
      
      {/* Header Section */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 1.5rem', position: 'relative', zIndex: 20 }}>
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
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 5rem', position: 'relative', zIndex: 20 }}>
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
