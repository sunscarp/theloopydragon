"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/utils/supabase";
import { useCart } from "@/contexts/CartContext";
import OrderSummary from "@/components/OrderSummary";
import { SPECIAL_OFFER_PRODUCTS } from "@/utils/dragonOffers";

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { 
    cart, 
    products, 
    cartAddons, 
    shippingInfo, 
    clearCart, 
    getProductIdFromCartKey,
    activeDragonOffer,
    calculateOrderTotals
  } = useCart();

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setEmail(session?.user?.email ?? "");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setEmail(session?.user?.email ?? "");
    });
    return () => subscription.unsubscribe();
  }, []);

  // Pre-fill pincode from shipping info
  useEffect(() => {
    if (shippingInfo.pincode) {
      setPincode(shippingInfo.pincode);
    }
  }, [shippingInfo.pincode]);

  // Calculate totals using the new function
  const { subtotal, dragonDiscount, finalTotal } = calculateOrderTotals();
  const total = finalTotal + (finalTotal >= 1000 ? 0 : shippingInfo.shippingCost);

  const validate = () => {
    if (!name.trim() || !address.trim() || !pincode.trim() || !phone.trim() || !email.trim()) {
      setError("Please fill in all fields.");
      return false;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }

    // Check if user changed pincode in checkout form
    if (pincode !== shippingInfo.pincode) {
      setError("Pincode doesn't match the one used for shipping calculation. Please go back to cart and recalculate shipping.");
      return false;
    }

    setError(null);
    return true;
  };

  const handlePayment = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!validate()) return;

    // Additional validation: Check if there are any paid items
    const hasPaidItems = cartItems.some(item => item && !item.isSpecialOffer);
    if (!hasPaidItems) {
      setError("You cannot checkout with only free items. Please add at least one paid item to your cart.");
      return;
    }

    // Additional validation: Ensure pincode is valid
    if (!shippingInfo.pincode || shippingInfo.pincode.length !== 6) {
      setError("Please go back to cart and enter a valid pincode for shipping calculation.");
      return;
    }

    try {
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const order = await response.json();
      if (!order || !order.id) throw new Error("Error creating payment order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "The Loopy Dragon",
        description: "Purchase from The Loopy Dragon",
        order_id: order.id,
        handler: async function (response: any) {
          let allSuccess = true;
          let generatedOrderId = `ODR-${Math.floor(100000 + Math.random() * 900000)}`;
          let supabaseErrorMsg = "";
          const orderDate = new Date().toISOString();
          const finalShippingCost = finalTotal >= 1000 ? 0 : shippingInfo.shippingCost;

          const productDetails = Object.entries(cart).map(([cartKey, qty]) => {
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
              Product: product.Product,
              Quantity: qty,
              Price: product.Price,
              keyChain: !!addons.keyChain,
              giftWrap: !!addons.giftWrap,
              carMirror: !!addons.carMirror,
              customMessage: addons.customMessage || "",
              "Total Price": ((product.Price + addonUnitPrice) * qty).toFixed(2),
              "Shipping Cost": finalShippingCost.toFixed(2),
              "Dragon Offer": activeDragonOffer ? activeDragonOffer.title : "",
              "Dragon Discount": dragonDiscount.toFixed(2),
              isSpecialOffer: !!specialOffer
            };
          }).filter(Boolean);

          // Retry logic for Supabase operations
          const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
            for (let i = 0; i < maxRetries; i++) {
              try {
                return await operation();
              } catch (error: any) {
                console.log(`Attempt ${i + 1} failed:`, error);
                if (i === maxRetries - 1) throw error;
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
              }
            }
          };

          try {
            // Save to Your Profile with retry
            await retryOperation(async () => {
              const { error: profileError } = await supabase
                .from("Your Profile")
                .insert([{
                  order_id: generatedOrderId,
                  "Order Date": orderDate,
                  Products: productDetails,
                  uid: user.id,
                  "Dragon Offer": activeDragonOffer ? activeDragonOffer.title : "",
                  "Total Discount": dragonDiscount.toFixed(2)
                }]);
              if (profileError) throw profileError;
            });
          } catch (profileError: any) {
            allSuccess = false;
            supabaseErrorMsg = profileError.message || JSON.stringify(profileError);
            console.error("Supabase Your Profile Insert Error:", profileError);
          }

          // Save individual orders with retry
          for (const [cartKey, qty] of Object.entries(cart)) {
            const productId = getProductIdFromCartKey(cartKey);
            
            // Check if it's a special offer product
            const specialOffer = SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS];
            let product;
            
            if (specialOffer) {
              product = specialOffer;
            } else {
              product = products.find((p) => p.id === productId);
            }
            
            if (!product) continue;
            
            const addons = cartAddons[cartKey] || {};
            const addonUnitPrice =
              (addons.keyChain ? 10 : 0) +
              (addons.giftWrap ? 10 : 0) +
              (addons.carMirror ? 50 : 0);
            const totalPrice = ((product.Price + addonUnitPrice) * qty).toFixed(2);
            
            try {
              await retryOperation(async () => {
                const { error: orderError } = await supabase
                  .from("Orders")
                  .insert([{
                    order_id: generatedOrderId,
                    Name: name,
                    Address: address,
                    Pincode: pincode,
                    Contact: phone,
                    Email: email,
                    Product: product.Product,
                    "Product ID": product.id,
                    Quantity: qty,
                    keyChain: !!addons.keyChain,
                    giftWrap: !!addons.giftWrap,
                    carMirror: !!addons.carMirror,
                    customMessage: addons.customMessage || "",
                    "Total Price": totalPrice,
                    "Shipping Cost": shippingInfo.shippingCost.toFixed(2),
                    uid: user.id,
                    payment_id: response.razorpay_payment_id,
                    "Order Date": orderDate,
                    "Dragon Offer": activeDragonOffer ? activeDragonOffer.title : "",
                    "Dragon Discount": "0.00", // Individual items don't get discount
                    isSpecialOffer: !!specialOffer
                  }]);
                if (orderError) throw orderError;
              });
            } catch (orderError: any) {
              allSuccess = false;
              supabaseErrorMsg = orderError.message || JSON.stringify(orderError);
              console.error("Supabase Order Insert Error:", orderError);
              continue;
            }
            
            // Only update inventory for real products, not special offer products
            if (!specialOffer) {
              try {
                await retryOperation(async () => {
                  const { error: updateError } = await supabase
                    .from("Inventory")
                    .update({ Quantity: (product.Quantity || 1) - qty })
                    .eq("id", product.id);
                  if (updateError) throw updateError;
                });
              } catch (updateError) {
                console.error("Inventory update error:", updateError);
                // Don't fail the entire order for inventory update issues
              }
            }
          }
          
          clearCart(); // This will clear cart, addons, shipping info, and dragon offers
          
          if (allSuccess) {
            router.push(`/order-summary?order_id=${generatedOrderId}`);
          } else {
            console.error("Order partially failed. Supabase error:", supabaseErrorMsg);
            // Still redirect to success page since payment went through
            router.push(`/order-summary?order_id=${generatedOrderId}&warning=partial_save`);
          }
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        notes: {
          address: `${address}, Pincode: ${pincode}`,
        },
        modal: {
          ondismiss: function () {
            router.push("/order-failed");
          }
        }
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error("Payment setup error:", error);
      let errorMessage = "Order failed! ";
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += "Network error: Please check your internet connection and try again.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }
      
      alert(errorMessage);
      // Don't redirect to order-failed for network issues, let user retry
      if (!error.message.includes('fetch')) {
        router.push("/order-failed");
      }
    }
  };

  // Calculate cart items for checkout display
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
        isSpecialOffer: !!specialOffer,
      };
    })
    .filter(Boolean);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-8 sm:mb-10">
              Checkout
            </h2>

            {/* Fire Offer Display */}
            {activeDragonOffer && (dragonDiscount > 0 || cartItems.some(item => item && item.isSpecialOffer)) && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Fire Offer Applied: {activeDragonOffer.title}
                    </span>
                    {dragonDiscount > 0 && (
                      <span className="text-sm">
                        Discount: -₹{dragonDiscount.toFixed(2)}
                      </span>
                    )}
                    {activeDragonOffer.type === 'free_product' && (
                      <span className="text-sm">
                        Free item added to your cart!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Info Display */}
            {shippingInfo.pincode && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">
                    Delivery to: {shippingInfo.pincode} | Shipping: {subtotal >= 1000 ? 'FREE' : `₹${shippingInfo.shippingCost.toFixed(2)}`}
                  </span>
                </div>
              </div>
            )}

            <form
              className="space-y-6"
              onSubmit={e => { e.preventDefault(); handlePayment(); }}
            >
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    id="address"
                    placeholder="House No, Street, Area, City"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
                    rows={4}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      placeholder="6-digit Pincode"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      required
                      maxLength={6}
                      pattern="\d{6}"
                    />
                    {pincode !== shippingInfo.pincode && pincode.length === 6 && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                        This pincode differs from shipping calculation. Please recalculate in cart.
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Phone (WhatsApp)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="10-digit WhatsApp Number"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      maxLength={10}
                      pattern="\d{10}"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Order Summary */}
              <OrderSummary
                cart={cart}
                products={products}
                cartAddons={cartAddons}
                subtotal={subtotal}
                shippingCost={finalTotal >= 1000 ? 0 : shippingInfo.shippingCost}
                total={total}
                activeDragonOffer={activeDragonOffer}
                dragonDiscount={dragonDiscount}
              />

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/50 rounded-lg p-3">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pay with Razorpay
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}