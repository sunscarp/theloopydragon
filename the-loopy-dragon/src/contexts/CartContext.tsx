"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Product = {
  id: number;
  Product: string;
  Price: number;
  Quantity: number;
  ImageUrl?: string;
};

type CartContextType = {
  cart: { [id: string]: number };
  products: Product[];
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isLoaded: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const saveCartToStorage = (cart: { [id: string]: number }) => {
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCart(loadCartFromStorage());
      setProducts(loadProductsFromStorage());
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

      window.addEventListener("storage", handleStorage);
      window.addEventListener("productsUpdated", handleProductUpdate as EventListener);
      
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("productsUpdated", handleProductUpdate as EventListener);
      };
    }
  }, []);

  const addToCart = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (!product || product.Quantity <= 0) return;
    setCart((prev) => {
      const currentQty = prev[id] || 0;
      if (currentQty >= product.Quantity) return prev;
      const updated = { ...prev, [id]: currentQty + 1 };
      saveCartToStorage(updated);
      return updated;
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      saveCartToStorage(updated);
      return updated;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    if (quantity > product.Quantity) return;
    setCart((prev) => {
      const updated = { ...prev, [id]: quantity };
      saveCartToStorage(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
    saveCartToStorage({});
  };

  const value: CartContextType = {
    cart,
    products,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoaded,
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