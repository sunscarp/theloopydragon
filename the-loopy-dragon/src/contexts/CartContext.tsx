"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

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
  addToCart: (id: number, addons?: ProductAddons) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  isLoaded: boolean;
  cartAddons: CartAddons;
  shippingInfo: ShippingInfo;
  updateShippingInfo: (info: Partial<ShippingInfo>) => void;
  calculateShipping: (pincode: string, cartItems: any[]) => Promise<void>;
  getProductIdFromCartKey: (cartKey: string) => number;
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCart(loadCartFromStorage());
      setProducts(loadProductsFromStorage());
      setCartAddons(loadCartAddonsFromStorage());
      setShippingInfo(loadShippingInfoFromStorage());
      setIsLoaded(true);

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

      window.addEventListener("storage", handleStorage);
      window.addEventListener("productsUpdated", handleProductUpdate as EventListener);
      window.addEventListener("cartAddonsUpdated", handleCartAddonsUpdate as EventListener);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("productsUpdated", handleProductUpdate as EventListener);
        window.removeEventListener("cartAddonsUpdated", handleCartAddonsUpdate as EventListener);
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

  const addToCart = (id: number, addons?: ProductAddons) => {
    const product = products.find((p) => p.id === id);
    if (!product || (product.Quantity !== undefined && product.Quantity <= 0)) return;
    
    // Generate cart key
    const cartKey = generateCartKey(id, addons);
    
    setCart((prev) => {
      const newCart = { ...prev };
      // If item exists, increment quantity, otherwise set to 1
      newCart[cartKey] = (newCart[cartKey] || 0) + 1;
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("cartAddons");
      localStorage.removeItem("shippingInfo");
    }
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