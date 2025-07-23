"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getActiveDragonOffer, clearActiveDragonOffer, calculateDiscountAmount, SPECIAL_OFFER_PRODUCTS, type DragonOffer } from "@/utils/dragonOffers";

type Product = {
  id: number;
  Product: string;
  Price: number;
  Quantity: number;
  ImageUrl?: string;
  Length?: number;
  Width?: number;
  Height?: number;
  Weight?: number;
};

type CartAddons = {
  [cartKey: string]: {
    keyChain?: boolean;
    giftWrap?: boolean;
    carMirror?: boolean;
    customMessage?: string;
  };
};

type ShippingInfo = {
  pincode: string;
  shippingCost: number;
  isCalculating: boolean;
};

// Create a type for add-ons to be passed to addToCart
type ProductAddons = {
  keyChain?: boolean;
  giftWrap?: boolean;
  carMirror?: boolean;
  customMessage?: string;
};

type CartContextType = {
  cart: { [cartKey: string]: number };
  products: Product[];
  addToCart: (id: number, addons?: ProductAddons, quantity?: number) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  isLoaded: boolean;
  cartAddons: CartAddons;
  shippingInfo: ShippingInfo;
  updateShippingInfo: (info: Partial<ShippingInfo>) => void;
  calculateShipping: (pincode: string, cartItems: any[]) => Promise<void>;
  getProductIdFromCartKey: (cartKey: string) => number;
  activeDragonOffer: DragonOffer | null;
  calculateOrderTotals: () => {
    subtotal: number;
    dragonDiscount: number;
    finalTotal: number;
    freeItems: string[]; // <-- Add this line
  };
  hasPaidItems: () => boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Function to generate a unique cart item key based on product ID and add-ons
const generateCartKey = (id: number, addons?: ProductAddons): string => {
  if (!addons) return `${id}`;
  
  // Create a consistent string representation of add-ons
  const parts = [
    id.toString(),
    addons.keyChain ? '1' : '0',
    addons.giftWrap ? '1' : '0',
    addons.carMirror ? '1' : '0',
  ];
  
  if (addons.customMessage) {
    parts.push(addons.customMessage.slice(0, 10));
  }
  
  return parts.join('_');
};

// Function to extract product ID from cart key
const getProductIdFromCartKey = (cartKey: string): number => {
  return parseInt(cartKey.split('_')[0], 10);
};

const saveCartToStorage = (cart: { [cartKey: string]: number }) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }));
    } catch (e) {
      console.error("Failed to save cart to localStorage:", e);
    }
  }
};

const loadCartFromStorage = (): { [id: string]: number } => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Failed to load cart from localStorage:", e);
      return {};
    }
  }
  return {};
};

const loadProductsFromStorage = (): Product[] => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("products");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load products from localStorage:", e);
      return [];
    }
  }
  return [];
};

const loadCartAddonsFromStorage = (): CartAddons => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("cartAddons");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Failed to load cartAddons from localStorage:", e);
      return {};
    }
  }
  return {};
};

const loadShippingInfoFromStorage = (): ShippingInfo => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("shippingInfo");
      const parsed = stored ? JSON.parse(stored) : {};
      return {
        pincode: parsed.pincode || "",
        shippingCost: parsed.shippingCost || 0,
        isCalculating: false,
      };
    } catch (e) {
      console.error("Failed to load shipping info from localStorage:", e);
      return { pincode: "", shippingCost: 0, isCalculating: false };
    }
  }
  return { pincode: "", shippingCost: 0, isCalculating: false };
};

const saveShippingInfoToStorage = (shippingInfo: ShippingInfo) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));
    } catch (e) {
      console.error("Failed to save shipping info to localStorage:", e);
    }
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<{ [cartKey: string]: number }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [cartAddons, setCartAddons] = useState<CartAddons>({});
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    pincode: "",
    shippingCost: 0,
    isCalculating: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeDragonOffer, setActiveDragonOffer] = useState<DragonOffer | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCart(loadCartFromStorage());
      setProducts(loadProductsFromStorage());
      setCartAddons(loadCartAddonsFromStorage());
      setShippingInfo(loadShippingInfoFromStorage());
      setIsLoaded(true);

      // Load active dragon offer
      setActiveDragonOffer(getActiveDragonOffer());

      // Listen for both storage events AND custom product updates
      const handleStorage = (e: StorageEvent) => {
        if (e.key === "products" && e.newValue) {
          try {
            setProducts(JSON.parse(e.newValue));
          } catch (error) {
            console.error("Failed to parse products from storage event:", error);
          }
        }
      };

      // Listen for custom product update events (for same-tab updates)
      const handleProductUpdate = (e: CustomEvent) => {
        setProducts(e.detail);
      };

      // Listen for cartAddons updates
      const handleCartAddonsUpdate = (e: CustomEvent) => {
        setCartAddons(e.detail);
      };

      // Listen for dragon offer events
      const handleDragonOfferApplied = (e: CustomEvent) => {
        setActiveDragonOffer(e.detail);
      };

      const handleDragonOfferCleared = () => {
        setActiveDragonOffer(null);
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener("productsUpdated", handleProductUpdate as EventListener);
      window.addEventListener("cartAddonsUpdated", handleCartAddonsUpdate as EventListener);
      window.addEventListener("dragonOfferApplied", handleDragonOfferApplied as EventListener);
      window.addEventListener("dragonOfferCleared", handleDragonOfferCleared as EventListener);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("productsUpdated", handleProductUpdate as EventListener);
        window.removeEventListener("cartAddonsUpdated", handleCartAddonsUpdate as EventListener);
        window.removeEventListener("dragonOfferApplied", handleDragonOfferApplied as EventListener);
        window.removeEventListener("dragonOfferCleared", handleDragonOfferCleared as EventListener);
      };
    }
  }, []);

  // Calculate total volumetric weight and physical weight
  const calculateWeights = (cartItems: any[]) => {
    const details = cartItems.map((item) => {
      const length = Number(item.Length || 10); // cm
      const width = Number(item.Width || 10);   // cm
      const height = Number(item.Height || 10);  // cm
      const weight = Number(item.Weight || 500); // grams
      
      // Calculate per item
      const volumetricWeight = (length * width * height) / 4000; // volumetric weight in kg
      const physicalWeight = weight / 1000; // physical weight in kg
      
      // Multiply by quantity
      const totalVolumetricWeight = volumetricWeight * item.quantity;
      const totalPhysicalWeight = physicalWeight * item.quantity;

      return {
        id: item.id,
        name: item.Product,
        dimensions: `${length}x${width}x${height}cm`,
        volumetricWeight: totalVolumetricWeight,
        physicalWeight: totalPhysicalWeight,
      };
    });

    // Use higher of volumetric or physical weight
    const totalVolumetricWeight = details.reduce((sum, item) => sum + item.volumetricWeight, 0);
    const totalPhysicalWeight = details.reduce((sum, item) => sum + item.physicalWeight, 0);
    const chargeableWeight = Math.max(totalVolumetricWeight, totalPhysicalWeight);

    return {
      weightInGrams: Math.ceil(chargeableWeight * 1000), // Convert to grams
      dimensions: details.map((d) => d.dimensions),
    };
  };

  const calculateShipping = async (pincode: string, cartItems: any[]) => {
    if (!pincode || pincode.length !== 6) {
      updateShippingInfo({ shippingCost: 0, isCalculating: false });
      return;
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Check if shipping should be free
    if (subtotal >= 1000) {
      updateShippingInfo({ shippingCost: 0, isCalculating: false });
      return;
    }
    
    updateShippingInfo({ isCalculating: true });
    
    try {
      const { weightInGrams, dimensions } = calculateWeights(cartItems);
      
      const response = await fetch(`/api/shipping?d_pin=${pincode}&cgm=${weightInGrams}&dimensions=${dimensions.join(',')}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('Shipping API Error:', data.error);
        updateShippingInfo({ shippingCost: 80, isCalculating: false }); // Fallback shipping cost
        return;
      }

      updateShippingInfo({ 
        shippingCost: data.total || 80, 
        isCalculating: false 
      });
    } catch (error) {
      console.error('Shipping calculation error:', error);
      updateShippingInfo({ shippingCost: 80, isCalculating: false }); // Fallback shipping cost
    }
  };

  const updateShippingInfo = (info: Partial<ShippingInfo>) => {
    setShippingInfo((prev) => {
      const updated = { ...prev, ...info };
      saveShippingInfoToStorage(updated);
      return updated;
    });
  };

  // Helper to remove all Fire Offer items from cart
  const removeAllFireOfferItems = () => {
    setCart((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach(cartKey => {
        const productId = getProductIdFromCartKey(cartKey);
        if (SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS]) {
          delete updated[cartKey];
        }
      });
      saveCartToStorage(updated);
      return updated;
    });
    setCartAddons((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach(cartKey => {
        const productId = getProductIdFromCartKey(cartKey);
        if (SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS]) {
          delete updated[cartKey];
        }
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("cartAddons", JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("cartAddonsUpdated", { detail: updated }));
      }
      return updated;
    });
  };

  // Listen for dragon offer applied event to enforce only one Fire Offer
  useEffect(() => {
    const handleDragonOfferApplied = (e: CustomEvent) => {
      const offer = e.detail;
      // Remove all Fire Offer items from cart if new offer is not a free_product
      if (offer.type === 'discount') {
        removeAllFireOfferItems();
      }
      setActiveDragonOffer(offer);
    };
    window.addEventListener("dragonOfferApplied", handleDragonOfferApplied as EventListener);
    return () => {
      window.removeEventListener("dragonOfferApplied", handleDragonOfferApplied as EventListener);
    };
    // eslint-disable-next-line
  }, []);

  const addToCart = (id: number, addons?: ProductAddons, quantity: number = 1) => {
    // Check if it's a special offer product
    const isSpecialOffer = SPECIAL_OFFER_PRODUCTS[id as keyof typeof SPECIAL_OFFER_PRODUCTS];

    // If adding a Fire Offer product, remove all previous Fire Offer items and clear any discount offer
    if (isSpecialOffer) {
      removeAllFireOfferItems();
      // Remove any active discount offer
      if (typeof window !== "undefined") {
        localStorage.removeItem("activeDragonOffer");
        window.dispatchEvent(new CustomEvent("dragonOfferCleared"));
      }
    }

    let product;
    if (isSpecialOffer) {
      product = isSpecialOffer;
    } else {
      product = products.find((p) => p.id === id);
      if (!product || (product.Quantity !== undefined && product.Quantity <= 0)) return;
    }
    
    // Generate cart key
    const cartKey = generateCartKey(id, addons);
    
    setCart((prev) => {
      const newCart = { ...prev };
      // Add the specified quantity instead of always adding 1
      newCart[cartKey] = (newCart[cartKey] || 0) + quantity;
      saveCartToStorage(newCart);
      return newCart;
    });

    // Save add-ons if they exist
    if (addons) {
      setCartAddons((prev) => {
        const newAddons = {
          ...prev,
          [cartKey]: {
            keyChain: addons.keyChain || false,
            giftWrap: addons.giftWrap || false,
            carMirror: addons.carMirror || false,
            customMessage: addons.customMessage || ''
          }
        };
        
        if (typeof window !== "undefined") {
          localStorage.setItem("cartAddons", JSON.stringify(newAddons));
          window.dispatchEvent(new CustomEvent("cartAddonsUpdated", { detail: newAddons }));
        }
        
        return newAddons;
      });
    }
  };

  const removeFromCart = (cartKey: string) => {
    // Make sure we're working with a string cart key
    if (typeof cartKey === 'number') {
      cartKey = String(cartKey);
    }
    
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[cartKey];
      saveCartToStorage(updated);
      return updated;
    });
    
    // Also remove add-ons for this cart key
    setCartAddons((prev) => {
      const updated = { ...prev };
      delete updated[cartKey];
      
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("cartAddons", JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent("cartAddonsUpdated", { detail: updated }));
        } catch (e) {
          console.error("Failed to save cart add-ons to localStorage:", e);
        }
      }
      
      return updated;
    });
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    const productId = getProductIdFromCartKey(cartKey);
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    
    if (quantity > product.Quantity) return;
    
    setCart((prev) => {
      const updated = { ...prev, [cartKey]: quantity };
      saveCartToStorage(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
    saveCartToStorage({});
    setCartAddons({});
    setShippingInfo({ pincode: "", shippingCost: 0, isCalculating: false });
    clearActiveDragonOffer();
    setActiveDragonOffer(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cartAddons");
      localStorage.removeItem("shippingInfo");
    }
  };

  const calculateOrderTotals = () => {
    const cartItems = Object.entries(cart)
      .map(([cartKey, qty]) => {
        const productId = getProductIdFromCartKey(cartKey);
        
        // Check if it's a special offer product
        const specialOffer = SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS];
        let product;
        
        if (specialOffer) {
          product = specialOffer;
        } else {
          product = products.find((p) => p.id === productId);
        }
        
        if (!product) return null;
        
        const addons = cartAddons[cartKey] || {};
        const addonUnitPrice =
          (addons.keyChain ? 10 : 0) +
          (addons.giftWrap ? 10 : 0) +
          (addons.carMirror ? 50 : 0);
        
        return {
          ...product,
          cartKey,
          quantity: qty,
          addons,
          addonUnitPrice,
          totalPrice: (product.Price + addonUnitPrice) * qty,
        };
      })
      .filter(Boolean);

    // Only allow one Fire Offer: if activeDragonOffer is a free_product, ignore any discount, and vice versa
    let dragonDiscount = 0;
    let filteredCartItems = cartItems;
    let freeItems: string[] = [];

    if (activeDragonOffer) {
      if (activeDragonOffer.type === 'discount') {
        // Remove all Fire Offer products from cart if a discount offer is active
        filteredCartItems = cartItems.filter(item => item && !SPECIAL_OFFER_PRODUCTS[item.id as keyof typeof SPECIAL_OFFER_PRODUCTS]);
        dragonDiscount = calculateDiscountAmount(activeDragonOffer, filteredCartItems.reduce((sum, item) => sum + (item?.totalPrice || 0), 0));
      } else if (activeDragonOffer.type === 'free_product') {
        // Only allow the Fire Offer product, ignore any discount
        dragonDiscount = 0;
        // Mark the Fire Offer product as free
        freeItems = filteredCartItems
          .filter(item => item && SPECIAL_OFFER_PRODUCTS[item.id as keyof typeof SPECIAL_OFFER_PRODUCTS])
          .map(item => item!.cartKey);
      }
    }

    const subtotal = filteredCartItems.reduce((sum, item) => sum + (item?.totalPrice || 0), 0);
    const finalTotal = Math.max(0, subtotal - dragonDiscount);

    return {
      subtotal,
      dragonDiscount,
      finalTotal,
      freeItems
    };
  };

  const hasPaidItems = () => {
    return Object.keys(cart).some(cartKey => {
      const productId = getProductIdFromCartKey(cartKey);
      const isSpecialOffer = SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS];
      return !isSpecialOffer;
    });
  };

  const value: CartContextType = {
    cart,
    products,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoaded,
    cartAddons,
    shippingInfo,
    updateShippingInfo,
    calculateShipping,
    getProductIdFromCartKey,
    activeDragonOffer,
    calculateOrderTotals,
    hasPaidItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// No UI changes needed here, but if you reference Tag: 'Dragon Offer' anywhere in your UI, update to 'Fire Offer'