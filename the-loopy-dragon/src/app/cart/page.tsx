"use client";
import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { SPECIAL_OFFER_PRODUCTS } from "@/utils/dragonOffers";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { 
    cart, 
    products, 
    updateQuantity, 
    removeFromCart, 
    isLoaded, 
    clearCart, 
    cartAddons,
    shippingInfo,
    updateShippingInfo,
    calculateShipping,
    getProductIdFromCartKey,
    activeDragonOffer,
    calculateOrderTotals
  } = useCart();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        .filter(Boolean) as Array<{
          id: number;
          cartKey: string;
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
          Length?: number;
          Width?: number;
          Height?: number;
          Weight?: number;
          isSpecialOffer?: boolean;
        }>,

    [cart, products, cartAddons, getProductIdFromCartKey]
  );

  // Calculate totals using the new function
  const orderTotals = calculateOrderTotals();
  const { subtotal, dragonDiscount, finalTotal } = orderTotals;
  const freeItems: any = orderTotals.freeItems ?? [];

  // Calculate total including add-ons
  const total = cartItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  // Handle pincode change and calculate shipping using context
  const handlePincodeChange = async (value: string) => {
    updateShippingInfo({ pincode: value });
    
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      await calculateShipping(value, cartItems);
    } else {
      updateShippingInfo({ shippingCost: 0 });
    }
  };

  const grandTotal = finalTotal + shippingInfo.shippingCost;

  const handleProceedToCheckout = () => {
    if (!user) {
      // Add checkout=true parameter to indicate user wants to checkout after login
      router.push("/login?redirect=/cart&checkout=true");
      return;
    }
    
    // Check if pincode is provided and valid
    if (!shippingInfo.pincode || shippingInfo.pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode to calculate shipping before checkout.");
      return;
    }
    
    // Check if there are any paid items in cart
    const hasPaidItems = cartItems.some(item => 
      !item.isSpecialOffer && !freeItems.includes(item.cartKey)
    );
    
    if (!hasPaidItems) {
      alert("You cannot checkout with only free items. Please add at least one paid item to your cart.");
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
      <div className="min-h-screen bg-[#F5F9FF]">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <div style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              color: '#1F2937'
            }}>
              Loading your cart...
            </div>
          </div>
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
      <div className="min-h-screen bg-[#F5F9FF]" style={{ fontFamily: 'sans-serif' }}>
        {/* Fixed Navbar */}
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
            : 'bg-transparent'
        }`}>
          <Navbar />
        </div>
        
        {/* Spacer for fixed navbar */}
        <div style={{ height: '80px' }}></div>

        {/* Header Section */}
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '40px',
              fontWeight: 700,
              color: '#22223B',
              marginBottom: '1rem',
              position: 'relative',
              display: 'inline-block',
              zIndex: 2
            }}>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                {/* Pink circle behind B */}
                <span
                  style={{
                    position: 'absolute',
                    left: '-14px',
                    top: '10px',
                    width: '48px',
                    height: '48px',
                    background: '#EFDFFF',
                    borderRadius: '50%',
                    zIndex: 0,
                    pointerEvents: 'none'
                  }}
                />
                <span style={{ position: 'relative', zIndex: 2 }}>B</span>
              </span>
              <span style={{ position: 'relative', zIndex: 2 }}>asket</span>
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
              Almost yours... Just a few clicks away
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '0',
                padding: '3rem 2rem',
                maxWidth: '500px',
                margin: '0 auto',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🛒</div>
                <h3 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#22223B',
                  marginBottom: '1rem'
                }}>
                  Your cart is empty
                </h3>
                <p style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#6B7280',
                  marginBottom: '2rem'
                }}>
                  Looks like you haven't added any items yet
                </p>
                <button
                  onClick={() => router.push('/shop')}
                  style={{
                    backgroundColor: '#8B5CF6',
                    color: '#FFFFFF',
                    padding: '12px 32px',
                    borderRadius: '0',
                    border: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="hover:bg-purple-700"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
              <div>
                {/* Table Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(160px,2fr) 160px 120px 60px',
                    gap: '1.5rem',
                    alignItems: 'center',
                    padding: '0.75rem 0.5rem',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#22223B',
                    borderBottom: '2px solid #E5E7EB',
                    background: 'transparent',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div>Product</div>
                  <div style={{ textAlign: 'center' }}>Quantity</div>
                  <div style={{ textAlign: 'right' }}>Total</div>
                  <div></div>
                </div>
                {/* Cart Items */}
                <div>
                  {cartItems.map((item, index) => (
                    <div
                      key={item.cartKey} // Changed from key={item.id} to use the unique cartKey
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(160px,2fr) 160px 120px 60px',
                        gap: '1.5rem',
                        alignItems: 'center',
                        padding: '1.25rem 0.5rem',
                        borderBottom: index < cartItems.length - 1 ? '1px solid #E5E7EB' : 'none',
                        background: 'transparent'
                      }}
                    >
                      {/* Product */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '130px',
                          height: '130px',
                          backgroundColor: '#F3F4F6',
                          borderRadius: '0',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {/* Special offer badge */}
                          {item.isSpecialOffer && (
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              backgroundColor: '#059669',
                              color: 'white',
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              zIndex: 1
                            }}>
                              FREE
                            </div>
                          )}
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
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              );
                            }
                            return (
                              <span style={{ fontSize: '2rem', opacity: 0.7 }}>
                                {item.isSpecialOffer ? '🎁' : '🧶'}
                              </span>
                            );
                          })()}
                        </div>
                        <div>
                          <div style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#22223B',
                            marginBottom: '0.25rem'
                          }}>
                            {item.Product}
                            {item.isSpecialOffer && (
                              <span style={{
                                marginLeft: '0.5rem',
                                fontSize: '12px',
                                backgroundColor: '#059669',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                              }}>
                                Fire Offer
                              </span>
                            )}
                          </div>
                          {(item.addons?.keyChain || item.addons?.giftWrap || item.addons?.carMirror || item.addons?.customMessage) && (
                            <div style={{
                              fontSize: '13px',
                              color: '#6B7280'
                            }}>
                              {item.addons?.keyChain && <span style={{ marginRight: '0.5rem' }}>+ Keychain (+₹10)</span>}
                              {item.addons?.giftWrap && <span style={{ marginRight: '0.5rem' }}>+ Gift Wrap (+₹10)</span>}
                              {item.addons?.carMirror && <span style={{ marginRight: '0.5rem' }}>+ Car mirror (+₹50)</span>}
                              {item.addons?.customMessage && (
                                <div>
                                  <span style={{ fontStyle: 'italic' }}>Message:</span> {item.addons.customMessage}
                                </div>
                              )}
                            </div>
                          )}
                          <div style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '14px',
                            color: '#6B7280',
                            marginTop: '0.25rem'
                          }}>
                            {item.isSpecialOffer ? 'FREE' : `₹${item.Price.toFixed(2)} each`}
                            {item.addonUnitPrice > 0 && (
                              <span style={{ marginLeft: '0.5rem', color: '#8B5CF6' }}>
                                + Addons ₹{item.addonUnitPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Quantity */}
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {item.isSpecialOffer ? (
                          // Special offer items can't have quantity changed
                          <span style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#22223B'
                          }}>
                            {item.quantity}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#F9FAFB',
                                border: 'none',
                                borderRadius: '0',
                                cursor: 'pointer',
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#374151'
                              }}
                              className="hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span style={{
                              width: '40px',
                              textAlign: 'center',
                              fontFamily: 'Montserrat, sans-serif',
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#22223B'
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#F9FAFB',
                                border: 'none',
                                borderRadius: '0',
                                cursor: 'pointer',
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#374151'
                              }}
                              className="hover:bg-gray-100"
                            >
                              +
                            </button>
                          </>
                        )}
                      </div>
                      {/* Total */}
                      <div style={{
                        textAlign: 'right',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#22223B'
                      }}>
                        {(item.isSpecialOffer || freeItems.includes(item.cartKey)) ? 'FREE' : `₹${item.totalPrice.toFixed(2)}`}
                      </div>
                      {/* Remove Button */}
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={() => removeFromCart(item.cartKey)}
                          style={{
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#E5E7EB',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer'
                          }}
                          title="Remove"
                        >
                          <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 20 20">
                            <path d="M6.5 6.5L13.5 13.5" stroke="#22223B" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M13.5 6.5L6.5 13.5" stroke="#22223B" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Order Summary */}
              <div>
                <div style={{
                  backgroundColor: '#F5F9FF',
                  borderRadius: '0',
                  border: '1px solid #E5E7EB',
                  padding: '2rem',
                  maxWidth: '400px',
                  marginLeft: 'auto'
                }}>
                  <h2 style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#22223B',
                    marginBottom: '1.5rem'
                  }}>
                    Order Summary
                  </h2>
                  {/* Pincode Input */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#22223B',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      Delivery Pincode
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit pincode"
                      value={shippingInfo.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      maxLength={6}
                      pattern="\d{6}"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '4px',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '14px',
                        outline: 'none',
                        color: '#111111' // Make input text black
                      }}
                    />
                    {shippingInfo.isCalculating && (
                      <p style={{
                        fontSize: '12px',
                        color: '#8B5CF6',
                        marginTop: '0.25rem',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Calculating shipping...
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '16px',
                        color: '#6B7280'
                      }}>
                        Subtotal ({cartItems.length} items)
                      </span>
                      <span style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#22223B'
                      }}>
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Fire Offer Discount */}
                    {activeDragonOffer && dragonDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '16px',
                          color: '#059669'
                        }}>
                          {activeDragonOffer.title}
                        </span>
                        <span style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#059669'
                        }}>
                          -₹{dragonDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {/* Free Product Items Notice */}
                    {cartItems.some(item => item.isSpecialOffer) && (
                      <div style={{
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #10B981',
                        borderRadius: '4px',
                        padding: '0.75rem',
                        fontSize: '14px',
                        color: '#059669',
                        fontFamily: 'Montserrat, sans-serif',
                        textAlign: 'center'
                      }}>
                        You have {cartItems.filter(item => item.isSpecialOffer).length} free item(s) in your cart!
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '16px',
                        color: '#6B7280'
                      }}>
                        Shipping
                      </span>
                      <span style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: finalTotal >= 1000 ? '#10B981' : '#22223B'
                      }}>
                        {finalTotal >= 1000 ? 'FREE' : (shippingInfo.pincode && shippingInfo.pincode.length === 6 ? `₹${shippingInfo.shippingCost.toFixed(2)}` : 'Enter pincode')}
                      </span>
                    </div>
                    {finalTotal >= 1000 && (
                      <div style={{
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #10B981',
                        borderRadius: '4px',
                        padding: '0.75rem',
                        fontSize: '14px',
                        color: '#059669',
                        fontFamily: 'Montserrat, sans-serif',
                        textAlign: 'center'
                      }}>
                        You've qualified for FREE shipping!
                      </div>
                    )}
                    <div style={{
                      borderTop: '1px solid #E5E7EB',
                      paddingTop: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#22223B'
                      }}>
                        Total
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '24px',
                          fontWeight: 700,
                          color: '#22223B'
                        }}>
                          ₹{grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Checkout Button and Razorpay Text - Now placed below the box */}
                <div style={{
                  backgroundColor: '#F5F9FF',
                  borderRadius: '0',
                  border: '1px solid #E5E7EB',
                  borderTop: 'none',
                  padding: '2rem',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginTop: '-1px'
                }}>
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={shippingInfo.isCalculating}
                    style={{
                      width: '100%',
                      backgroundColor: shippingInfo.isCalculating ? '#9CA3AF' : '#D8B6FA',
                      color: '#000000',
                      padding: '16px',
                      borderRadius: '0',
                      border: 'none',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: shippingInfo.isCalculating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                    className="hover:bg-purple-300"
                  >
                    {shippingInfo.isCalculating ? 'Calculating...' : (user ? 'Proceed to Checkout →' : 'Sign In to Checkout →')}
                  </button>
                  <p style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#6B7280',
                    marginTop: '1rem',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Secure checkout powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}