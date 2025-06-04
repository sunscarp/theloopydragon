"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase"; // Updated import path

type Product = {
  id: number;
  Product: string;
  Price: number;
  Quantity: number;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [products, setProducts] = useState<Product[]>([]);

  // Check auth status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load cart and products from localStorage immediately on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load cart
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch (e) {
          console.error("Failed to parse cart:", e);
        }
      }

      // Load products
      const storedProducts = localStorage.getItem("products");
      if (storedProducts) {
        try {
          setProducts(JSON.parse(storedProducts));
        } catch (e) {
          console.error("Failed to parse products:", e);
        }
      }

      // Listen for storage changes
      const handleStorage = (e: StorageEvent) => {
        if (e.key === "cart" && e.newValue) {
          try {
            setCart(JSON.parse(e.newValue));
          } catch (e) {
            console.error("Failed to parse cart from storage event:", e);
          }
        }
        if (e.key === "products" && e.newValue) {
          try {
            setProducts(JSON.parse(e.newValue));
          } catch (e) {
            console.error("Failed to parse products from storage event:", e);
          }
        }
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prev) => {
      const updated = { ...prev, [id]: quantity };
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const product = products.find((p) => p.id === Number(id));
          return product
            ? {
                ...product,
                quantity: qty,
              }
            : null;
        })
        .filter(Boolean) as Array<{
          id: number;
          Product: string;
          Price: number;
          Quantity: number;
          quantity: number;
        }>,
    [cart, products]
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.Price * item.quantity,
    0
  );

  const handleProceedToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <nav className="w-full bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <span className="text-xl font-bold text-green-700 dark:text-green-400 mb-3 sm:mb-0">
              The Loopy Dragon
            </span>
            <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-gray-700 dark:text-gray-200 text-sm font-medium">
              <li key="home">
                <Link href="/">Home</Link>
              </li>
              <li key="collections">
                <Link href="/collections">Collections</Link>
              </li>
              <li key="about">
                <Link href="/about">About Us</Link>
              </li>
              <li key="contact">
                <Link href="/contact">Contact Us</Link>
              </li>
              {user ? (
                <>
                  <li key="email" className="text-sm text-gray-600">{user.email}</li>
                  <li key="logout">
                    <button onClick={() => supabase.auth.signOut()}>Logout</button>
                  </li>
                </>
              ) : (
                <li key="login">
                  <Link href="/login">Login</Link>
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* Cart Items */}
        <main className="max-w-3xl mx-auto py-8 sm:py-16 px-4 flex-1">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Your Cart
          </h2>
          {cartItems.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">
              Your cart is empty.
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <ul>
                {cartItems.map((item) => (
                  <li
                    key={item.id} // Added unique key prop
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b last:border-b-0 dark:border-gray-700 gap-4"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.Product}</span>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg">
                        ₹{Number(item.Price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </main>
        <footer className="bg-white dark:bg-gray-800 py-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} The Loopy Dragon
        </footer>
      </div>
    </>
  );
}
