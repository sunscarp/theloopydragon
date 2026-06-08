"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import Footer from "@/components/mobilefooter";
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
  status?: string | null;
};

export default function MobileShop() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [search, setSearch] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products");
  const [isHairAccessoriesOpen, setIsHairAccessoriesOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const { cart, addToCart, isLoaded } = useCart();
  const router = useRouter();

  /* DRAGON FLYING ANIMATION - Commented out for later use
  // Dragon game state - Updated for better management
  const [showDragon, setShowDragon] = useState<boolean>(false);
  const [showDragonPopup, setShowDragonPopup] = useState<boolean>(false);
  const [dragonCaught, setDragonCaught] = useState<boolean>(false);
  const [dragonOffer, setDragonOffer] = useState<any>(null);
  const [dragonPause, setDragonPause] = useState<boolean>(false);
  const [dragonFlightCount, setDragonFlightCount] = useState<number>(0);
  const [dragon2FlightCount, setDragon2FlightCount] = useState<number>(0);

  // Track if free offer has been claimed
  const [freeOfferClaimed, setFreeOfferClaimed] = useState<boolean>(false);

  // Initialize freeOfferClaimed from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFreeOfferClaimed(sessionStorage.getItem("freeOfferClaimed") === "true");
    }
  }, []);
  
  // Regular dragon 1 state
  const [dragonStart, setDragonStart] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [dragonEnd, setDragonEnd] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [dragonAngle, setDragonAngle] = useState<number>(0);
  const [dragonKey, setDragonKey] = useState<number>(0);
  
  // Regular dragon 2 state
  const [dragon2Start, setDragon2Start] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [dragon2End, setDragon2End] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [dragon2Angle, setDragon2Angle] = useState<number>(0);
  const [dragon2Key, setDragon2Key] = useState<number>(100);

  const DRAGON_SPEED_SECONDS = 1;

  // Rare dragon state
  const [showRareDragon, setShowRareDragon] = useState<boolean>(false);
  const [rareDragonStart, setRareDragonStart] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [rareDragonEnd, setRareDragonEnd] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [rareDragonAngle, setRareDragonAngle] = useState<number>(0);
  const [rareDragonKey, setRareDragonKey] = useState<number>(200);

  // Flying dragons disabled state
  const [dragonsDisabled, setDragonsDisabled] = useState<boolean>(false);
  const [showDisableDragonsPopup, setShowDisableDragonsPopup] = useState<boolean>(false);

  // Lightning effect state for rare dragon
  const [showLightningEffect, setShowLightningEffect] = useState<boolean>(false);

  const RARE_DRAGON_SPEED_SECONDS = 0.9;
  */

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* DRAGON FLYING ANIMATION - Commented out for later use
  // Dragon cycle state to force re-mount
  const [dragonCycle, setDragonCycle] = useState(0);

  // Show dragons after 10s, then every 30s (even after they disappear)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("dragonDismissed");
      const freeClaimed = sessionStorage.getItem("freeOfferClaimed") === "true";
      if (!dismissed && !freeClaimed) {
        // Initial delay of 10 seconds
        const initialTimeout = setTimeout(() => {
          setShowDragon(true);
          setDragonCaught(false);
          setDragonFlightCount(0);
          setDragon2FlightCount(0);
          setDragonCycle(c => c + 1);
        }, 10000); // 10 seconds

        return () => {
          clearTimeout(initialTimeout);
        };
      }
    }
  }, []);

  // Normal dragons timer - every 30 seconds, but not if free offer claimed or dragons disabled
  useEffect(() => {
    if (freeOfferClaimed || dragonsDisabled) return;
    const interval = setInterval(() => {
      if (!showDragonPopup && !dragonCaught && !freeOfferClaimed && !dragonsDisabled) {
        setShowDragon(true);
        setDragonCaught(false);
        setDragonFlightCount(0);
        setDragon2FlightCount(0);
        setDragonPause(false);
        setDragonCycle(c => c + 1);
      }
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [showDragonPopup, dragonCaught, freeOfferClaimed, dragonsDisabled]);

  // Pause after 4 flights each, resume after 1 minute
  useEffect(() => {
    if (dragonFlightCount >= 4 && dragon2FlightCount >= 4 && !dragonPause) {
      setDragonPause(true);
      setShowDragon(false);
      const timeout = setTimeout(() => {
        setDragonFlightCount(0);
        setDragon2FlightCount(0);
        setDragonPause(false);
        setShowDragon(true);
      }, 1 * 60 * 1000); // 1 minute
      return () => clearTimeout(timeout);
    }
  }, [dragonFlightCount, dragon2FlightCount, dragonPause]);

  // Randomize dragon flight paths when dragons appear
  useEffect(() => {
    if (showDragon) {
      // Dragon 1 path
      const dragon1Flight = getRandomDragonFlight();
      setDragonStart(dragon1Flight.start);
      setDragonEnd(dragon1Flight.end);
      setDragonAngle(dragon1Flight.angle);
      setDragonKey(prev => prev + 1);

      // Dragon 2 path (ensure different from dragon 1)
      let dragon2Flight;
      do {
        dragon2Flight = getRandomDragonFlight();
      } while (
        Math.abs(dragon2Flight.start.x - dragon1Flight.start.x) < 200 &&
        Math.abs(dragon2Flight.start.y - dragon1Flight.start.y) < 200
      );
      
      setDragon2Start(dragon2Flight.start);
      setDragon2End(dragon2Flight.end);
      setDragon2Angle(dragon2Flight.angle);
      setDragon2Key(prev => prev + 1);
    }
  }, [showDragon, dragonCaught]);

  // Listen for animation end to restart dragons
  useEffect(() => {
    if (!showDragon) return;
    
    const handleDragon1End = () => {
      if (!showDragonPopup && !dragonCaught && !freeOfferClaimed) {
        setDragonFlightCount(count => {
          const newCount = count + 1;
          if (newCount < 4) {
            const {start, end, angle} = getRandomDragonFlight();
            setDragonStart(start);
            setDragonEnd(end);
            setDragonAngle(angle);
            setDragonKey(prev => prev + 1);
          }
          return newCount;
        });
      }
    };

    const handleDragon2End = () => {
      if (!showDragonPopup && !dragonCaught && !freeOfferClaimed) {
        setDragon2FlightCount(count => {
          const newCount = count + 1;
          if (newCount < 4) {
            const {start, end, angle} = getRandomDragonFlight();
            setDragon2Start(start);
            setDragon2End(end);
            setDragon2Angle(angle);
            setDragon2Key(prev => prev + 1);
          }
          return newCount;
        });
      }
    };

    const el1 = document.getElementById("flying-dragon");
    const el2 = document.getElementById("flying-dragon-2");
    
    if (el1) el1.addEventListener("animationend", handleDragon1End);
    if (el2) el2.addEventListener("animationend", handleDragon2End);
    
    return () => {
      if (el1) el1.removeEventListener("animationend", handleDragon1End);
      if (el2) el2.removeEventListener("animationend", handleDragon2End);
    };
    // Always include all dependencies, even if not used in the effect body
    // This ensures the dependency array length never changes
  }, [showDragon, showDragonPopup, dragonCaught, dragonKey, dragon2Key, freeOfferClaimed]);

  // Rare dragon timer - appears every 2 minutes with lightning effect, but not if dragons disabled
  useEffect(() => {
    if (freeOfferClaimed || dragonsDisabled) return;
    const interval = setInterval(() => {
      if (!showDragonPopup && !dragonCaught && !freeOfferClaimed && !dragonsDisabled) {
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
          
          // Hide rare dragon after animation completes
          setTimeout(() => {
            if (!dragonCaught) {
              setShowRareDragon(false);
            }
          }, RARE_DRAGON_SPEED_SECONDS * 1000 + 500);
        }, 3000);
      }
    }, 120000); // Every 2 minutes

    return () => clearInterval(interval);
  }, [showDragonPopup, dragonCaught, freeOfferClaimed, dragonsDisabled]);

  // Prevent dragons if disabled
  useEffect(() => {
    if (dragonsDisabled) {
      setShowDragon(false);
      setShowRareDragon(false);
      setShowLightningEffect(false);
    }
  }, [dragonsDisabled]);

  // Get random dragon flight path
  function getRandomDragonFlight() {
    const padding = 40;
    const w = typeof window !== "undefined" ? window.innerWidth : 400;
    const h = typeof window !== "undefined" ? window.innerHeight : 800;
    const edges = ["top", "bottom", "left", "right"];
    const startEdge = edges[Math.floor(Math.random() * 4)];
    let start = {x: 0, y: 0};
    let end = {x: 0, y: 0};

    if (startEdge === "top") {
      start = {x: Math.random() * (w - padding * 2) + padding, y: -60};
      const endEdge = ["bottom", "left", "right"][Math.floor(Math.random() * 3)];
      if (endEdge === "bottom") end = {x: Math.random() * (w - padding * 2) + padding, y: h + 60};
      if (endEdge === "left") end = {x: -100, y: Math.random() * (h - padding * 2) + padding};
      if (endEdge === "right") end = {x: w + 100, y: Math.random() * (h - padding * 2) + padding};
    } else if (startEdge === "bottom") {
      start = {x: Math.random() * (w - padding * 2) + padding, y: h + 60};
      const endEdge = ["top", "left", "right"][Math.floor(Math.random() * 3)];
      if (endEdge === "top") end = {x: Math.random() * (w - padding * 2) + padding, y: -60};
      if (endEdge === "left") end = {x: -100, y: Math.random() * (h - padding * 2) + padding};
      if (endEdge === "right") end = {x: w + 100, y: Math.random() * (h - padding * 2) + padding};
    } else if (startEdge === "left") {
      start = {x: -100, y: Math.random() * (h - padding * 2) + padding};
      const endEdge = ["top", "bottom", "right"][Math.floor(Math.random() * 3)];
      if (endEdge === "top") end = {x: Math.random() * (w - padding * 2) + padding, y: -60};
      if (endEdge === "bottom") end = {x: Math.random() * (w - padding * 2) + padding, y: h + 60};
      if (endEdge === "right") end = {x: w + 100, y: Math.random() * (h - padding * 2) + padding};
    } else {
      start = {x: w + 100, y: Math.random() * (h - padding * 2) + padding};
      const endEdge = ["top", "bottom", "left"][Math.floor(Math.random() * 3)];
      if (endEdge === "top") end = {x: Math.random() * (w - padding * 2) + padding, y: -60};
      if (endEdge === "bottom") end = {x: Math.random() * (w - padding * 2) + padding, y: h + 60};
      if (endEdge === "left") end = {x: -100, y: Math.random() * (h - padding * 2) + padding};
    }
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
    return {start, end, angle};
  }

  const handleDragonClick = () => {
    if (freeOfferClaimed) return;
    const offer = getRandomDragonOffer();
    setDragonOffer(offer);
    setShowDragonPopup(true);
    setDragonCaught(true);
    setShowDragon(false);
  };

  const handleDragonPopupClose = () => {
    setShowDragon(false);
    setShowDragonPopup(false);
    setDragonOffer(null);
    // Reset dragon state for next appearance, but not if free offer claimed
    setTimeout(() => {
      setDragonCaught(false);
      setDragonFlightCount(0);
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
      setDragonFlightCount(0);
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
        // Do NOT redirect to cart, just stay on shop page
      } 
      // If it's a discount offer, allow dragons as usual
      else if (dragonOffer.type === 'discount') {
        // Do NOT redirect to cart, just stay on shop page
      }
    }
    handleDragonPopupClose();
  };

  // --- RARE DRAGON LOGIC ---
  useEffect(() => {
    if (showRareDragon) {
      const {start, end, angle} = getRandomDragonFlight();
      setRareDragonStart(start);
      setRareDragonEnd(end);
      setRareDragonAngle(angle);
      setRareDragonKey(prev => prev + 1);
    }
  }, [showRareDragon]);

  useEffect(() => {
    if (!showRareDragon) return;
    const handler = () => {
      if (!dragonCaught) {
        setTimeout(() => {
          setShowRareDragon(false);
        }, 5000); // Hide rare dragon after 5 seconds
      }
    };
    const el = document.getElementById("rare-dragon");
    if (el) el.addEventListener("animationend", handler);
    return () => {
      if (el) el.removeEventListener("animationend", handler);
    };
  }, [showRareDragon, dragonCaught]);

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
  */

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("Inventory")
        .select("id, Product, Quantity, Price, Tag, ImageUrl1, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5, status");

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
        const filtered = data.filter(p => p.status !== "deactivated");
        setProducts(filtered);
        if (typeof window !== "undefined") {
          localStorage.setItem("products", JSON.stringify(filtered));
          window.dispatchEvent(new CustomEvent("productsUpdated", { detail: filtered }));
        }
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  /* DRAGON FLYING ANIMATION - Commented out for later use
  // On mount, check localStorage for dragonsDisabled and dragonsPreferenceAsked
  useEffect(() => {
    if (typeof window !== "undefined") {
      const disabled = localStorage.getItem("dragonsDisabled") === "true";
      setDragonsDisabled(disabled);
      const asked = localStorage.getItem("dragonsPreferenceAsked") === "true";
      if (!asked) {
        setTimeout(() => setShowDisableDragonsPopup(true), 1200);
      }
    }
  }, []);

  // Handler to disable dragons
  const handleDisableDragons = () => {
    setDragonsDisabled(true);
    setShowDisableDragonsPopup(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("dragonsDisabled", "true");
      localStorage.setItem("dragonsPreferenceAsked", "true");
    }
    setShowDragon(false);
    setShowDragonPopup(false);
    setShowRareDragon(false);
    setShowLightningEffect(false);
  };

  // Handler to keep dragons enabled
  const handleKeepDragons = () => {
    setDragonsDisabled(false);
    setShowDisableDragonsPopup(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("dragonsDisabled", "false");
      localStorage.setItem("dragonsPreferenceAsked", "true");
    }
  };

  // Handler for toggle button
  const handleToggleDragons = () => {
    if (dragonsDisabled) {
      handleKeepDragons();
    } else {
      handleDisableDragons();
    }
  };

  // Auto-hide dragons popup after 7 seconds
  useEffect(() => {
    if (showDisableDragonsPopup) {
      const timer = setTimeout(() => setShowDisableDragonsPopup(false), 7000);
      return () => clearTimeout(timer);
    }
  }, [showDisableDragonsPopup]);
  */

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

  // Helper to normalize category/tag for plural/case-insensitive and synonym matching
  function normalizeCategory(str: string) {
    let s = str.trim().toLowerCase();

    // Synonym and variant normalization
    if (
      s === "hairties" || s === "hair ties" || s === "hairtie" || s === "hair tie"
    ) return "hairtie";
    if (
      s === "scrunchies" || s === "scrunchie"
    ) return "scrunchie";
    if (
      s === "claw clips" || s === "claw clip" || s === "clutchers" || s === "clutcher" || s === "claw clips / clutchers"
    ) return "clawclip";
    if (
      s === "upins" || s === "upin"
    ) return "upin";
    if (
      s === "tictac clips" || s === "tictac clip" || s === "tictacclips" || s === "tictacclip"
    ) return "tictacclip";
    if (
      s === "tic tac clips" || s === "tic tac clip"
    ) return "tictacclip";
    if (
      s === "hair accessories" || s === "hair accessory"
    ) return "hairaccessory";
    if (
      s === "plushies" || s === "plushie"
    ) return "plushie";
    if (
      s === "keychains" || s === "keychain"
    ) return "keychain";
    if (
      s === "flowers" || s === "flower"
    ) return "flower";
    if (
      s === "jewellery" || s === "jewelry"
    ) return "jewellery";
    if (
      s === "characters" || s === "character"
    ) return "character";
    if (
      s === "miscellaneous" || s === "misc"
    ) return "miscellaneous";
    if (
      s === "barrette clips" || s === "barrette clip"
    ) return "barretteclip";
    if (
      s === "bobby pins" || s === "bobby pin"
    ) return "bobbypin";
    if (
      s === "hairbands" || s === "hairband"
    ) return "hairband";
    if (
      s === "alligator clips" || s === "alligator clip"
    ) return "alligatorclip";

    // Fallback: plural/singular normalization
    if (s.endsWith('ies')) {
      s = s.slice(0, -3) + 'y';
    } else if (s.endsWith('es')) {
      s = s.slice(0, -2);
    } else if (s.endsWith('s')) {
      s = s.slice(0, -1);
    }
    return s.replace(/\s+/g, ''); // Remove spaces for matching
  }

  const filteredProducts = products
    // Hide special offer products (IDs 999001–999004)
    .filter(product => ![999001, 999002, 999003, 999004].includes(product.id))
    .filter(product => {
      // Search should match product name or any tag (case-insensitive)
      const matchesSearch =
        product.Product.toLowerCase().includes(search.toLowerCase()) ||
        (product.Tag &&
          product.Tag.split(',')
            .some(tag => tag.trim().toLowerCase().includes(search.toLowerCase()))
        );

      if (selectedCategory === "All Products") {
        return matchesSearch;
      }

      // Normalize selectedCategory for comparison
      const normalizedSelected = normalizeCategory(selectedCategory);

      // Check if product has the selected category in its tags (case/plural/synonym insensitive)
      const productTags = product.Tag
        ? product.Tag.split(',').map(tag => normalizeCategory(tag))
        : [];
      const matchesCategory = productTags.some(tag => tag === normalizedSelected);

      return matchesSearch && matchesCategory;
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
        className="rounded-3xl p-3 transition-all duration-300"
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
                className="text-4xl opacity-60 transition-opacity select-none"
                role="img"
                aria-label={product.Product}
              >
                📦
              </span>
              <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-400 font-medium pointer-events-none">
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
              fontSize: '14px',
              fontWeight: 400,
              color: '#1F2937'
            }}>
              View Product
            </span>
          </div>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: '#1F2937',
            marginBottom: '4px',
            lineHeight: '1.4'
          }}>
            {product.Product}
          </h3>
          <span style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '16px',
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
    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
      <div className="text-4xl mb-4 opacity-20">🔍</div>
      <div className="text-lg font-semibold text-gray-600 mb-2">
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

  const categories = ['All Products', 'Best Sellers', 'Plushies', 'Keychains', 'Hair accessories', 'Flowers', 'Jewellery', 'Characters', 'Miscellaneous'];
  const hairAccessoriesSubCategories = ['Barrette Clips', 'Bobby Pins', 'Scrunchies', 'Hairties', 'Hairbands', 'Claw Clips / Clutchers', 'Upins', 'Alligator Clips', 'Tictac Clips'];

  return (
    <div className="min-h-screen bg-[#F5F9FF]" style={{ fontFamily: 'sans-serif', position: 'relative', zIndex: 0 }}>
      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Disable Dragons Popup - same style/position as desktop shop --}
      {showDisableDragonsPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "92px", // 54px button + 32px margin + 6px gap
            right: "16px",
            zIndex: 3100,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            pointerEvents: "auto"
          }}
        >
          <div
            style={{
              background: "#D7B3FB",
              borderRadius: 0,
              boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
              padding: "1.25rem 1rem 1rem",
              maxWidth: "260px",
              minWidth: "220px",
              textAlign: "center",
              position: "relative",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.98rem",
              border: "1px solid #ECD8FF",
              color: "#000"
            }}
          >
            <div style={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "#000",
              marginBottom: "0.25rem"
            }}>
              Flying dragons bring discounts!
            </div>
            <div style={{
              fontWeight: 400,
              fontSize: "0.92rem",
              color: "#000",
              marginBottom: "0.75rem"
            }}>
              Want to switch them off?<br />
              You can always toggle them here.
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
              <button
                onClick={handleDisableDragons}
                style={{
                  background: "#ECD8FF",
                  color: "#000",
                  border: "none",
                  borderRadius: 0,
                  padding: "0.5rem 0.9rem",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  transition: "background 0.2s"
                }}
              >
                Switch Off
              </button>
              <button
                onClick={handleKeepDragons}
                style={{
                  background: "#FFFFFF",
                  color: "#000",
                  border: "1px solid #ECD8FF",
                  borderRadius: 0,
                  padding: "0.5rem 0.9rem",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Keep On
              </button>
            </div>
            {/* Arrow pointing down to the button, aligned to right edge --}
            <div style={{
              position: "absolute",
              right: "24px",
              bottom: "-14px",
              width: "0",
              height: "0",
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "14px solid #D7B3FB",
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.08))"
            }} />
          </div>
        </div>
      )}
      */}

      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Toggle Dragons Button (bottom right corner, always visible) --}
      <button
        onClick={handleToggleDragons}
        style={{
          position: "fixed",
          bottom: "56px", // was 32px, now higher up
          right: "16px",
          zIndex: 100,
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          background: "#fff",
          border: "2px solid #A4A4A4",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          cursor: "pointer",
          transition: "box-shadow 0.2s",
        }}
        aria-label={dragonsDisabled ? "Enable Flying Dragons" : "Disable Flying Dragons"}
      >
        <div style={{ position: "relative", width: "38px", height: "38px" }}>
          <img
            src="/loopydragon4.png"
            alt="Flying Dragon Toggle"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              display: "block",
              pointerEvents: "none",
              userSelect: "none",
              filter: dragonsDisabled ? "grayscale(0.5)" : "none",
              opacity: dragonsDisabled ? 0.7 : 1,
              transform: "scaleX(-1)", // <-- Flip horizontally
            }}
            draggable={false}
          />
          {dragonsDisabled && (
            <svg
              viewBox="0 0 38 38"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "38px",
                height: "38px",
                pointerEvents: "none",
              }}
            >
              <line
                x1="6"
                y1="32"
                x2="32"
                y2="6"
                stroke="#ef4444"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      </button>
      */}

      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Page Flicker Effect - only background flashes, content stays visible --}
      {showLightningEffect && !dragonsDisabled && (
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
      */}

      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Flying Dragons - Both regular dragons --}
      {showDragon && !dragonPause && !freeOfferClaimed && !dragonsDisabled && (
        <>
          {/* Dragon 1 --}
          <div
            id="flying-dragon"
            key={`dragon-${dragonKey}-${dragonCycle}`}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "70px",
              height: "45px",
              zIndex: 1000, // Increased z-index
              pointerEvents: "auto",
              transform: `translate(${dragonStart.x}px, ${dragonStart.y}px)`,
              transition: "none",
              animation: `dragon-fly-xy-${dragonKey} ${DRAGON_SPEED_SECONDS}s linear forwards`,
              userSelect: "none",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragonClick();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragonClick();
            }}
            aria-label="Flying Dragon - Click to catch!"
          >
            <img
              src="/loopydragon.png"
              alt="Flying Dragon"
              width={70}
              height={45}
              style={{
                width: "70px",
                height: "45px",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
                transform:
                  dragonEnd.x > dragonStart.x
                    ? `scaleX(-1) rotate(${-dragonAngle}deg)`
                    : `scaleX(-1) scaleY(-1) rotate(${dragonAngle}deg)`,
              }}
              draggable={false}
            />
            <style>{`
              @keyframes dragon-fly-xy-${dragonKey} {
                from {
                  transform: translate(${dragonStart.x}px, ${dragonStart.y}px);
                }
                to {
                  transform: translate(${dragonEnd.x}px, ${dragonEnd.y}px);
                }
              }
            `}</style>
          </div>

          {/* Dragon 2 --}
          <div
            id="flying-dragon-2"
            key={`dragon2-${dragon2Key}-${dragonCycle}`}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "70px",
              height: "45px",
              zIndex: 1000, // Increased z-index
              pointerEvents: "auto",
              transform: `translate(${dragon2Start.x}px, ${dragon2Start.y}px)`,
              transition: "none",
              animation: `dragon2-fly-xy-${dragon2Key} ${DRAGON_SPEED_SECONDS}s linear forwards`,
              userSelect: "none",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragonClick();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragonClick();
            }}
            aria-label="Flying Dragon 2 - Click to catch!"
          >
            <img
              src="/loopydragon2.png"
              alt="Flying Dragon 2"
              width={70}
              height={45}
              style={{
                width: "70px",
                height: "45px",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
                transform:
                  dragon2End.x > dragon2Start.x
                    ? `scaleX(-1) rotate(${-dragon2Angle}deg)`
                    : `scaleX(-1) scaleY(-1) rotate(${dragon2Angle}deg)`,
              }}
              draggable={false}
            />
            <style>{`
              @keyframes dragon2-fly-xy-${dragon2Key} {
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
      */}

      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Rare Dragon --}
      {showRareDragon && !freeOfferClaimed && !dragonsDisabled && (
        <div
          id="rare-dragon"
          key={`rare-dragon-${rareDragonKey}`}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "90px",
            height: "60px",
            zIndex: 1000, // Increased z-index
            pointerEvents: "auto",
            transform: `translate(${rareDragonStart.x}px, ${rareDragonStart.y}px)`,
            transition: "none",
            animation: `rare-dragon-fly-${rareDragonKey} ${RARE_DRAGON_SPEED_SECONDS}s linear forwards`,
            userSelect: "none",
            cursor: "pointer",
            filter: "drop-shadow(0 0 10px #fbbf24) drop-shadow(0 0 20px #f59e0b)",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRareDragonClick();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRareDragonClick();
          }}
          aria-label="Rare Flying Dragon - Click to catch!"
        >
          <img
            src="/loopydragon3.png"
            alt="Rare Flying Dragon"
            width={90}
            height={60}
            style={{
              width: "90px",
              height: "60px",
              display: "block",
              pointerEvents: "none",
              userSelect: "none",
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
          `}</style>
        </div>
      )}
      */}

      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Dragon Popup --}
      {showDragonPopup && dragonOffer && !dragonsDisabled && (
        <>
          {/* Blurred background overlay --}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 4199,
              background: "rgba(245, 249, 255, 0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              pointerEvents: "auto",
              transition: "backdrop-filter 0.2s",
            }}
          />
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 4200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
              background: "none",
              padding: 0,
            }}
          >
            <div
              style={{
                background: "#D7B3FB",
                borderRadius: 0,
                boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
                border: "1px solid #ECD8FF",
                padding: "1.25rem 1rem 1rem",
                maxWidth: "340px",
                minWidth: "220px",
                textAlign: "center",
                fontFamily: "Montserrat, sans-serif",
                color: "#000",
                position: "relative",
              }}
            >
              {/* LEGENDARY RARE label for rare dragon --}
              {dragonOffer.id === 'rare_dragon_50' && (
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#ECD8FF",
                  color: "#000",
                  padding: "4px 12px",
                  borderRadius: 0,
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "Montserrat, sans-serif",
                  border: "1px solid #D7B3FB"
                }}>
                  LEGENDARY RARE
                </div>
              )}
              <div style={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "#000",
                marginBottom: "0.5rem"
              }}>
                {dragonCaught ? "You caught the offer!" : "Hi there, traveler!"}
              </div>
              {dragonOffer.value === 0 && dragonOffer.title.includes('Try Again') ? (
                <>
                  <div style={{
                    fontWeight: 400,
                    fontSize: "0.95rem",
                    color: "#22223B",
                    marginBottom: "1.2rem"
                  }}>
                    {dragonOffer.description}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                    <button
                      onClick={handleDragonTryAgain}
                      style={{
                        background: "#ECD8FF",
                        color: "#000",
                        border: "none",
                        borderRadius: 0,
                        padding: "0.6rem 1.5rem",
                        fontWeight: 600,
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "1rem",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "background 0.2s",
                        width: "140px",
                        minWidth: "140px",
                        maxWidth: "140px",
                      }}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleDragonPopupClose}
                      style={{
                        background: "#FFFFFF",
                        color: "#000",
                        border: "1px solid #ECD8FF",
                        borderRadius: 0,
                        padding: "0.6rem 1.5rem",
                        fontWeight: 600,
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        width: "140px",
                        minWidth: "140px",
                        maxWidth: "140px",
                      }}
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#000",
                    marginBottom: "0.5rem"
                  }}>
                    {dragonOffer.title}
                  </div>
                  <div style={{
                    fontWeight: 400,
                    fontSize: "0.9rem",
                    color: "#22223B",
                    marginBottom: "1.2rem"
                  }}>
                    {dragonOffer.type === 'free_product' 
                      ? `Congratulations! You've won a ${dragonOffer.title.replace('Free ', '').replace('!', '')}. It will be added to your cart for free!`
                      : dragonOffer.description
                    }
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                    <button
                      onClick={handleClaimOffer}
                      style={{
                        background: "#ECD8FF",
                        color: "#000",
                        border: "none",
                        borderRadius: 0,
                        padding: "0.6rem 1.5rem",
                        fontWeight: 600,
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "1rem",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "background 0.2s",
                        width: "140px",
                        minWidth: "140px",
                        maxWidth: "140px",
                      }}
                    >
                      {dragonOffer.type === 'free_product' ? 'Add Free Item!' : 'Claim Offer!'}
                    </button>
                    <button
                      onClick={handleDragonPopupClose}
                      style={{
                        background: "#FFFFFF",
                        color: "#000",
                        border: "1px solid #ECD8FF",
                        borderRadius: 0,
                        padding: "0.6rem 1.5rem",
                        fontWeight: 600,
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        width: "140px",
                        minWidth: "140px",
                        maxWidth: "140px",
                      }}
                    >
                      No Thanks
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
      */}

      <div className={`fixed top-0 left-0 right-0 z-[9999]`}>
        <Navbar />
      </div>

      {/* Spacer for fixed navbar + marquee (marquee is 2.5rem, navbar is ~4.5rem) */}
      <div style={{ height: 'calc(2.5rem + 4.5rem)' }}></div>
      
      {/* Header Section */}
      <section style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem 1rem 1rem', position: 'relative', zIndex: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {/* Responsive font for OUR SHOP header */}
          <style jsx>{`
            .shop-header {
              font-family: Montserrat, sans-serif;
              font-size: 40px;
              font-weight: 700;
              color: #22223B;
              margin-bottom: 1rem;
              letter-spacing: 0.05em;
              text-transform: none;
              line-height: 1.1;
            }
            @media (max-width: 767px) {
              .shop-header {
                font-size: 32px !important;
                letter-spacing: 0.12em !important;
                line-height: 0.95 !important;
                font-weight: 700 !important;
                text-transform: none !important;
              }
            }
            @media (max-width: 480px) {
              .shop-header {
                font-size: 28px !important;
                letter-spacing: 0.15em !important;
              }
            }
          `}</style>
          <h2 className="shop-header">
            OUR SHOP
          </h2>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '20px',
            fontWeight: 400,
            color: '#22223B',
            maxWidth: '100%',
            margin: '0 auto',
            lineHeight: '1.2',
            letterSpacing: '0.03em',
            padding: '0'
          }}>
            Your one-stop cozy shop, serving handmade charm all day
          </p>
        </div>

        {/* Search Section */}
        <div style={{ marginBottom: '1rem', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                padding: '0.75rem 1rem 0.75rem 3rem',
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

      {/* Mobile Filters */}
      <section style={{ maxWidth: '100%', margin: '0 auto', padding: '0 1rem', position: 'relative', zIndex: 4000 }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {/* Categories Filter */}
          <div style={{ position: 'relative', flex: 1 }}>
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              style={{
                width: '100%',
                minWidth: '120px',
                padding: '0.75rem 1rem',
                borderRadius: '0',
                border: '1px solid #A4A4A4',
                backgroundColor: '#F5F9FF',
                color: '#1F2937',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '16px', // <-- Increased from 12px to 16px
                fontWeight: 500,   // <-- Slightly bolder
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{selectedCategory}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCategoriesOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 4100, // much higher than products grid
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '0',
                marginTop: '2px',
                maxHeight: '300px',
                overflowY: 'auto',
                boxShadow: '0 4px 16px 2px rgba(0, 0, 0, 0.18)',
                minWidth: '120px'
              }}>
                {categories.map((category) => (
                  <div key={category}>
                    <button
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '16px', // <-- Increased from 12px to 16px
                        color: selectedCategory === category ? '#000000' : '#1F2937',
                        fontWeight: selectedCategory === category ? 700 : 500,
                        backgroundColor: selectedCategory === category ? '#F3F4F6' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={() => {
                        if (category === 'Hair accessories') {
                          setIsHairAccessoriesOpen(!isHairAccessoriesOpen);
                        }
                        setSelectedCategory(category);
                        if (category !== 'Hair accessories') {
                          setIsCategoriesOpen(false);
                        }
                      }}
                      className={selectedCategory === category ? '' : 'hover:bg-gray-50'}
                    >
                      {category}
                      {category === 'Hair accessories' && (
                        <svg
                          className={`w-4 h-4 transition-transform ${isHairAccessoriesOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                    {category === 'Hair accessories' && isHairAccessoriesOpen && (
                      <div style={{ backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
                        {hairAccessoriesSubCategories.map((subCategory) => (
                          <button
                            key={subCategory}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.75rem 1rem 0.75rem 2rem',
                              fontFamily: 'Montserrat, sans-serif',
                              fontSize: '15px', // <-- Slightly bigger for subcategories
                              color: selectedCategory === subCategory ? '#000000' : '#1F2937',
                              fontWeight: selectedCategory === subCategory ? 700 : 500,
                              backgroundColor: selectedCategory === subCategory ? '#E5E7EB' : 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}
                            onClick={() => {
                              setSelectedCategory(subCategory);
                              setIsCategoriesOpen(false);
                            }}
                            className={selectedCategory === subCategory ? '' : 'hover:bg-gray-100'}
                          >
                            {subCategory}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort Filter */}
          <div style={{ position: 'relative', flex: 1 }}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              style={{
                width: '100%',
                minWidth: '120px',
                padding: '0.75rem 1rem',
                borderRadius: '0',
                border: '1px solid #A4A4A4',
                backgroundColor: '#F5F9FF',
                color: '#1F2937',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '16px', // <-- Increased from 12px to 16px
                fontWeight: 500,   // <-- Slightly bolder
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              <span>
                {sortBy === 'name' ? 'Relevance' : 
                 sortBy === 'price-asc' ? 'Price: Low to High' : 
                 'Price: High to Low'}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isSortOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 4100, // much higher than products grid
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '0',
                marginTop: '2px',
                boxShadow: '0 4px 16px 2px rgba(0, 0, 0, 0.18)',
                minWidth: '120px'
              }}>
                {[
                  { value: 'name', label: 'Relevance' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' }
                ].map((option) => (
                  <button
                    key={option.value}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '16px', // <-- Increased from 12px to 16px
                      color: sortBy === option.value ? '#000000' : '#1F2937',
                      fontWeight: sortBy === option.value ? 700 : 500,
                      backgroundColor: sortBy === option.value ? '#F3F4F6' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => {
                      setSortBy(option.value as any);
                      setIsSortOpen(false);
                    }}
                    className={sortBy === option.value ? '' : 'hover:bg-gray-50'}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Count */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#4B4B64', fontWeight: 500 }}>
            {loading ? "Loading..." : `${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        padding: '0 1rem 3rem', 
        position: 'relative', 
        zIndex: 50 // Lower than dropdowns
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
          minHeight: '400px'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
              <div className="text-base text-gray-600 animate-pulse">
                Loading beautiful creations...
              </div>
            </div>
          ) : errorMsg ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
              <div className="text-4xl mb-4 opacity-20">⚠️</div>
              <div className="text-lg font-semibold text-red-600 mb-4">
                Oops! Something went wrong
              </div>
              <div className="text-red-500 whitespace-pre-line bg-red-50 rounded-2xl p-4 text-sm leading-relaxed">
                {errorMsg}
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            renderNoProductsMessage()
          ) : (
            sortedProducts
              .filter(product => ![999001, 999002, 999003, 999004].includes(product.id))
              .map(renderProductCard)
          )}
        </div>
      </section>
      
      <Footer />
      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      <style>{`
        @keyframes pageFlickerBg {
          0% { background: transparent; opacity: 0; }
          15% { background: #000; opacity: 0.7; }
          35% { background: #000; opacity: 0.2; }
          60% { background: #000; opacity: 0.8; }
          80% { background: #000; opacity: 0.1; }
          100% { background: transparent; opacity: 0; }
        }
      `}</style>
      */}
    </div>
  );
}