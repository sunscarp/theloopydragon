"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/utils/supabase";
import { useCart } from "@/contexts/CartContext";
import OrderSummary from "@/components/OrderSummary";

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { cart, products, cartAddons, shippingInfo, clearCart, getProductIdFromCartKey } = useCart();
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

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

  // Calculate subtotal and total
  useEffect(() => {
    const cartItems = Object.entries(cart)
      .map(([cartKey, qty]) => {
        const productId = getProductIdFromCartKey(cartKey);
        const product = products.find((p) => p.id === productId);
        const addons = cartAddons[cartKey] || {};
        const addonUnitPrice =
          (addons.keyChain ? 10 : 0) +
          (addons.giftWrap ? 10 : 0) +
          (addons.carMirror ? 50 : 0);
        return product ? { ...product, quantity: qty, addonUnitPrice, totalPrice: (product.Price + addonUnitPrice) * qty } : null;
      })
      .filter(Boolean);

    const calculatedSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(calculatedSubtotal);

    const finalShippingCost = calculatedSubtotal >= 1000 ? 0 : shippingInfo.shippingCost;
    setTotal(calculatedSubtotal + finalShippingCost);
  }, [cart, products, cartAddons, shippingInfo.shippingCost, getProductIdFromCartKey]);

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

    try {
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
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
          const finalShippingCost = subtotal >= 1000 ? 0 : shippingInfo.shippingCost;

          const productDetails = Object.entries(cart).map(([cartKey, qty]) => {
            const productId = getProductIdFromCartKey(cartKey);
            const product = products.find((p) => p.id === productId);
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
            };
          }).filter(Boolean);

          const { error: profileError } = await supabase
            .from("Your Profile")
            .insert([{
              order_id: generatedOrderId,
              "Order Date": orderDate,
              Products: productDetails, // Now includes add-ons
              uid: user.id
            }]);
          if (profileError) {
            allSuccess = false;
            supabaseErrorMsg = profileError.message || JSON.stringify(profileError);
            console.error("Supabase Your Profile Insert Error:", profileError);
          }

          for (const [cartKey, qty] of Object.entries(cart)) {
            const productId = getProductIdFromCartKey(cartKey);
            const product = products.find((p) => p.id === productId);
            if (!product) continue;
            const addons = cartAddons[cartKey] || {};
            const addonUnitPrice =
              (addons.keyChain ? 10 : 0) +
              (addons.giftWrap ? 10 : 0) +
              (addons.carMirror ? 50 : 0);
            const totalPrice = ((product.Price + addonUnitPrice) * qty).toFixed(2);
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
                "Order Date": orderDate
              }]);
            if (orderError) {
              allSuccess = false;
              supabaseErrorMsg = orderError.message || JSON.stringify(orderError);
              console.error("Supabase Order Insert Error:", orderError);
              continue;
            }
            await supabase
              .from("Inventory")
              .update({ Quantity: (product.Quantity || 1) - qty })
              .eq("id", product.id);
          }
          clearCart(); // This will clear cart, addons, and shipping info
          if (allSuccess) {
            router.push(`/order-summary?order_id=${generatedOrderId}`);
          } else {
            alert("Order failed! Supabase error: " + supabaseErrorMsg);
            router.push("/order-failed");
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
    } catch (error) {
      alert("Order failed! JS error: " + (error as any)?.message);
      router.push("/order-failed");
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-8 sm:mb-10">
              Checkout
            </h2>

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
                        ⚠️ This pincode differs from shipping calculation. Please recalculate in cart.
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
                shippingCost={subtotal >= 1000 ? 0 : shippingInfo.shippingCost}
                total={total}
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