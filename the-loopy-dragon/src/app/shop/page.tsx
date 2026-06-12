"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from 'next/image';
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
  seller_id?: string | null;
  status?: string | null;
};

export default function Shop() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [search, setSearch] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products");
  const [sellers, setSellers] = useState<{id: number; shop_name: string; slug: string}[]>([]);
  const [sellerSlugMap, setSellerSlugMap] = useState<Record<string, string>>({});
  const [selectedStore, setSelectedStore] = useState<string>("All Stores");
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
        .select("id, Product, Quantity, Price, Tag, ImageUrl1, ImageUrl2, ImageUrl3, ImageUrl4, ImageUrl5, seller_id, status");

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
        const filtered = data.filter(
          p => p.status !== "deactivated"
        );
        setProducts(filtered);
        if (typeof window !== "undefined") {
          localStorage.setItem("products", JSON.stringify(filtered));
          window.dispatchEvent(new CustomEvent("productsUpdated", { detail: filtered }));
        }
      }
      const { data: sellersData } = await supabase
        .from("sellers")
        .select("id, shop_name, slug")
        .neq("status", "removed");
      setSellers(sellersData || []);
      if (sellersData) {
        const map: Record<string, string> = {};
        sellersData.forEach(s => { map[String(s.id)] = s.slug; });
        setSellerSlugMap(map);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  /* DRAGON FLYING ANIMATION - Commented out for later use
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

  // Flying dragons disabled state
  const [dragonsDisabled, setDragonsDisabled] = useState<boolean>(false);
  const [showDisableDragonsPopup, setShowDisableDragonsPopup] = useState<boolean>(false);

  // Lightning effect state for rare dragon
  const [showLightningEffect, setShowLightningEffect] = useState<boolean>(false);

  // Always use a high speed (short duration)
  const DRAGON_SPEED_SECONDS = 1.4; // fast, but visible
  const RARE_DRAGON_SPEED_SECONDS = 1.1; // a little slower than before
  */

  /* DRAGON FLYING ANIMATION - Commented out for later use
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
  */

  /* DRAGON FLYING ANIMATION - Commented out for later use
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

  // (Duplicate declaration removed. The state variables are already declared above.)

  // Normal dragons timer - every 30 seconds, but not if free offer claimed or dragons disabled
  useEffect(() => {
    if (freeOfferClaimed || dragonsDisabled) return;
    const interval = setInterval(() => {
      if (!showDragonPopup && !dragonCaught && !freeOfferClaimed && !dragonsDisabled) {
        setShowDragon(true);
        setDragonCaught(false);
        setDragon1FlightCount(0);
        setDragon2FlightCount(0);
        setDragonPause(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [showDragonPopup, dragonCaught, freeOfferClaimed, dragonsDisabled]);

  // Rare dragon timer - every 2 minutes, but not if free offer claimed or dragons disabled
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
          setTimeout(() => {
            setShowRareDragon(false);
          }, RARE_DRAGON_SPEED_SECONDS * 1000 + 100);
        }, 3000);
      }
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [showDragonPopup, dragonCaught, freeOfferClaimed, dragonsDisabled]);

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
  */

  /* DRAGON FLYING ANIMATION - Commented out for later use
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
        setShowDragon(false);
        setShowDragonPopup(false);
        setDragonOffer(null);
        setDragonCaught(false);
        setDragon1FlightCount(0);
        setDragon2FlightCount(0);
        setDragonPause(false);
        return;
      }
      setShowDragon(false);
      setShowDragonPopup(false);
      setDragonOffer(null);
      setDragonCaught(false);
      setDragon1FlightCount(0);
      setDragon2FlightCount(0);
      setDragonPause(false);
    }
  };

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

      // Category filtering logic (case/plural insensitive)
      if (selectedCategory === "All Products") {
        return matchesSearch;
      }

      // Normalize selectedCategory for comparison
      const normalizedSelected = normalizeCategory(selectedCategory);

      // Check if product has the selected category in its tags (case/plural insensitive)
      const productTags = product.Tag
        ? product.Tag.split(',').map(tag => normalizeCategory(tag))
        : [];
      const matchesCategory = productTags.some(tag => tag === normalizedSelected);

      return matchesSearch && matchesCategory;
    })
    .filter(product => {
      if (selectedStore === "All Stores") return true;
      if (selectedStore === "The Loopy Dragon") return !product.seller_id;
      return String(product.seller_id) === selectedStore;
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
              decoding="async"
              fetchPriority="low"
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
          {product.seller_id && sellerSlugMap[String(product.seller_id)] ? (
            <Link href={`/${sellerSlugMap[String(product.seller_id)]}`} style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              color: '#7C3AED',
              marginTop: '2px',
              textDecoration: 'none'
            }}
              className="hover:underline">
              {sellers.find(s => String(s.id) === product.seller_id)?.shop_name || "Seller"}
            </Link>
          ) : (
            <span style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              color: '#6B7280',
              marginTop: '2px'
            }}>
              The Loopy Dragon
            </span>
          )}
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
      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Disable Dragons Popup - sharp corners and custom colors --}
      {showDisableDragonsPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "92px",
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
          bottom: "66px", // was 32px, now higher up
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
          <Image
            src="/loopydragon4.png"
            alt="Flying Dragon Toggle"
            width={38}
            height={38}
            quality={50}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              display: "block",
              pointerEvents: "none",
              userSelect: "none",
              filter: dragonsDisabled ? "grayscale(0.5)" : "none",
              opacity: dragonsDisabled ? 0.7 : 1,
              transform: "scaleX(-1)",
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
            background: "transparent",
            animation: "pageFlickerBg 1s ease-in-out"
          }}
        />
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
          <Image
            src="/loopydragon3.png"
            alt="Rare Flying Dragon"
            width={150}
            height={100}
            quality={50}
            style={{
              width: "150px",
              height: "100px",
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
      */}

      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Two Flying Dragons - random angle and random places, infinite --}
      {showDragon && !dragonPause && !freeOfferClaimed && !dragonsDisabled && (
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
            <Image
              src="/loopydragon.png"
              alt="Flying Dragon"
              width={120}
              height={80}
              quality={50}
              style={{
                width: "120px",
                height: "80px",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
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
            <Image
              src="/loopydragon2.png"
              alt="Flying Dragon 2"
              width={120}
              height={80}
              quality={50}
              style={{
                width: "120px",
                height: "80px",
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
      */}

      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Dragon Popup --}
      {showDragonPopup && dragonOffer && !dragonsDisabled && (
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
              background: "#D7B3FB",
              borderRadius: 0,
              boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
              padding: "2.5rem 2rem 2rem",
              maxWidth: "400px",
              textAlign: "center",
              position: "relative",
              border: "1px solid #ECD8FF",
              color: "#000"
            }}
          >
            {/* Special styling for rare dragon offer --}
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
              color: "#000",
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
                  color: "#000",
                  marginBottom: "1.5rem"
                }}>
                  {dragonOffer.description}
                </div>
                <button
                  onClick={handleDragonTryAgain}
                  style={{
                    background: "#ECD8FF",
                    color: "#000",
                    border: "none",
                    borderRadius: 0,
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
                    background: "#FFFFFF",
                    color: "#000",
                    border: "1px solid #ECD8FF",
                    borderRadius: 0,
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
                  color: "#000",
                  marginBottom: "0.5rem"
                }}>
                  {dragonOffer.title}
                </div>
                <div style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 400,
                  fontSize: "0.9rem",
                  color: "#000",
                  marginBottom: "1.5rem"
                }}>
                  {dragonOffer.type === 'free_product' 
                    ? `Congratulations! You've won a ${dragonOffer.title.replace('Free ', '').replace('!', '')}. It will be added to your cart for free!`
                    : dragonOffer.description
                  }
                </div>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "0.5rem" }}>
                  <button
                    onClick={handleClaimOffer}
                    style={{
                      background: "#ECD8FF",
                      color: "#000",
                      border: "none",
                      borderRadius: 0,
                      padding: "0.75rem 2rem",
                      fontWeight: 600,
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "1rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "background 0.2s"
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
                      padding: "0.75rem 2rem",
                      fontWeight: 600,
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "1rem",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    No Thanks
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      */}

      {/* DRAGON FLYING ANIMATION - Commented out for later use */}
      {/*
      {/* Dragon flying animation keyframes --}
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
      */}
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
          <div
            style={{
              height: 'calc(100vh - 8rem)',
              overflowY: 'auto',
              position: 'sticky',
              top: '6rem',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
            }}
          >
            {/* Hide scrollbar for Webkit browsers */}
            <style>{`
              div[style*="overflow-y: auto"]::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div>
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
            {/* Store Filter */}
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700, fontSize: '16px', lineHeight: '1.2',
                letterSpacing: '0.01em', color: '#22223B', marginBottom: '1rem'
              }}>
                Stores
              </h3>
              <div style={{ borderBottom: '1px solid #000000', marginBottom: '1rem' }}></div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {["All Stores", "The Loopy Dragon", ...sellers.map(s => s.shop_name)].map(store => (
                  <li key={store}>
                    <button
                      style={{
                        width: '100%', textAlign: 'left', padding: '0.5rem 1rem',
                        borderRadius: '0.75rem', fontFamily: 'Montserrat, sans-serif',
                        fontSize: '14px',
                        color: selectedStore === store ? '#000000' : '#1F2937',
                        fontWeight: selectedStore === store ? 700 : 400,
                        backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      className={selectedStore === store ? '' : 'hover:text-purple-600'}
                      onClick={() => setSelectedStore(store === "The Loopy Dragon" ? "The Loopy Dragon" : store === "All Stores" ? "All Stores" : String(sellers.find(s => s.shop_name === store)?.id || store))}>
                      {store}
                    </button>
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