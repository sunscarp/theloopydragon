"use client";
import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext"; // Adjust path if needed

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { cart, products, updateQuantity, removeFromCart, isLoaded, clearCart, cartAddons } = useCart();

  // Check auth status and handle post-login redirect
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);

      // Check if user just logged in and should go to checkout
      const urlParams = new URLSearchParams(window.location.search);
      const shouldGoToCheckout = urlParams.get("checkout");
      
      if (session?.user && shouldGoToCheckout === "true") {
        // Clear the checkout parameter and redirect to checkout
        window.history.replaceState({}, document.title, window.location.pathname);
        router.push("/checkout");
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);

      // If user just signed in and we're on cart page, check if they intended to checkout
      if (session?.user) {
        const urlParams = new URLSearchParams(window.location.search);
        const shouldGoToCheckout = urlParams.get("checkout");
        
        if (shouldGoToCheckout === "true") {
          window.history.replaceState({}, document.title, window.location.pathname);
          router.push("/checkout");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const product = products.find((p) => p.id === Number(id));
          const addons = cartAddons[id] || {};
          // Calculate addon price per unit
          const addonUnitPrice =
            (addons.keyChain ? 10 : 0) +
            (addons.giftWrap ? 10 : 0) +
            (addons.carMirror ? 50 : 0);
          return product
            ? {
                ...product,
                quantity: qty,
                addons,
                addonUnitPrice,
                totalPrice: (product.Price + addonUnitPrice) * qty,
              }
            : null;
        })
        .filter(Boolean) as Array<{
          id: number;
          Product: string;
          Price: number;
          Quantity: number;
          quantity: number;
          ImageUrl1?: string | null;
          ImageUrl2?: string | null;
          ImageUrl3?: string | null;
          ImageUrl4?: string | null;
          ImageUrl5?: string | null;
          addons?: { keyChain?: boolean; giftWrap?: boolean; carMirror?: boolean; customMessage?: string };
          addonUnitPrice: number;
          totalPrice: number;
        }>,
    [cart, products, cartAddons]
  );

  // Calculate total including add-ons
  const total = cartItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  // Calculate shipping cost (example: free above 1000, else 80)
  const shippingCost = total >= 1000 ? 0 : 80;
  const grandTotal = total + shippingCost;

  const handleProceedToCheckout = () => {
    if (!user) {
      // Add checkout=true parameter to indicate user wants to checkout after login
      router.push("/login?redirect=/cart&checkout=true");
      return;
    }
    router.push("/checkout");
  };

  // Listen for order completion and clear cart if redirected from order-summary
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.pathname === "/order-summary" || url.searchParams.get("order_id")) {
        clearCart();
      }
    }
  }, [clearCart]);

  // Show loading state until cart data and auth are loaded
  if (!isLoaded || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
          <div className="text-gray-600 dark:text-gray-300 font-medium">Loading your cart...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
        {/* Fixed Navbar with gradient background */}
        <div className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50`}>
          <Navbar />
        </div>
        
        {/* Spacer for fixed navbar */}
        <div className="h-16 sm:h-20"></div>

        {/* Main Content */}
        <main className="w-full max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 flex-1">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-12 max-w-md mx-auto">
                <div className="text-6xl sm:text-8xl mb-4">🛒</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Looks like you haven't added any items yet
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Cart Items */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="relative">
                          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                            {(() => {
                              const images = [
                                item.ImageUrl1,
                                item.ImageUrl2,
                                item.ImageUrl3,
                                item.ImageUrl4,
                                item.ImageUrl5,
                              ].filter((img): img is string => !!img);
                              if (images.length > 0) {
                                return (
                                  <img
                                    src={images[0]}
                                    alt={item.Product}
                                    className="w-full h-full object-cover"
                                  />
                                );
                              }
                              return (
                                <span className="text-2xl sm:text-3xl opacity-70">🧶</span>
                              );
                            })()}
                          </div>
                          {/* Item number badge */}
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                            {index + 1}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-lg mb-1 truncate">
                            {item.Product}
                          </h3>
                          {/* Add-ons and message display */}
                          {(item.addons?.keyChain || item.addons?.giftWrap || item.addons?.carMirror || item.addons?.customMessage) && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {item.addons?.keyChain && <span className="mr-2">+ Keychain <span className="text-[10px]">(+₹10)</span></span>}
                              {item.addons?.giftWrap && <span className="mr-2">+ Gift Wrap <span className="text-[10px]">(+₹10)</span></span>}
                              {item.addons?.carMirror && <span className="mr-2">+ Car mirror accessory <span className="text-[10px]">(+₹50)</span></span>}
                              {item.addons?.customMessage && (
                                <div>
                                  <span className="italic">Message:</span> {item.addons.customMessage}
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            ₹{item.Price.toFixed(2)} each
                            {item.addonUnitPrice > 0 && (
                              <span className="ml-2 text-xs text-purple-500">
                                + Addons ₹{item.addonUnitPrice} each
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mb-3">
                            Item total: ₹{item.totalPrice.toFixed(2)}
                          </p>

                          {/* Mobile Layout */}
                          <div className="sm:hidden space-y-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 rounded-lg font-bold text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 active:scale-95"
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900 dark:text-gray-100">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 rounded-lg font-bold text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 active:scale-95"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                              <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                ₹{item.totalPrice.toFixed(2)}
                              </div>
                            </div>
                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-full bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 py-2 px-4 rounded-xl font-medium transition-all duration-200 text-sm"
                            >
                              Remove from Cart
                            </button>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex items-center space-x-6">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 rounded-lg font-bold text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 hover:scale-105"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-16 text-center font-bold text-gray-900 dark:text-gray-100 text-lg">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 rounded-lg font-bold text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 hover:scale-105"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right min-w-[100px]">
                            <div className="font-bold text-xl text-gray-900 dark:text-gray-100">
                              ₹{item.totalPrice.toFixed(2)}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 rounded-xl transition-all duration-200 hover:scale-105"
                            aria-label="Remove item"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {total >= 1000 ? 'FREE' : 'Standard Rates applied'}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Total
                      </span>
                      <span className="flex flex-col items-end">
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                          ₹{total.toFixed(2)}
                        </span>
                        {total < 1000 && (
                          <span className="text-xs text-green-600 dark:text-green-400 mt-1">+ delivery</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-6 sm:mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-95"
                  onClick={handleProceedToCheckout}
                >
                  {user ? 'Proceed to Checkout →' : 'Sign In to Checkout →'}
                </button>
                
                <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Secure checkout powered by Razorpay
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-6 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4">
            <p>© {new Date().getFullYear()} The Loopy Dragon. Made with 💜 for yarn lovers.</p>
          </div>
        </footer>
      </div>
    </>
  );
}