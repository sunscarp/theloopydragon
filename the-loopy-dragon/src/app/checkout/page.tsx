"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/utils/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [products, setProducts] = useState<any[]>([]);
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) setCart(JSON.parse(storedCart));
      const storedProducts = localStorage.getItem("products");
      if (storedProducts) setProducts(JSON.parse(storedProducts));
    }
  }, []);

  useEffect(() => {
    const cartItems = Object.entries(cart)
      .map(([id, qty]) => {
        const product = products.find((p) => p.id === Number(id));
        return product ? { ...product, quantity: qty } : null;
      })
      .filter(Boolean) as Array<{ Price: number; quantity: number }>;
    setTotal(cartItems.reduce((sum, item) => sum + item.Price * item.quantity, 0));
  }, [cart, products]);

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

          const productDetails = Object.entries(cart).map(([productId, qty]) => {
            const product = products.find((p) => p.id === Number(productId));
            if (!product) return null;
            return {
              Product: product.Product || product.ProductName || product.name,
              Quantity: qty,
              Price: product.Price,
              "Total Price": (product.Price * qty).toFixed(2),
            };
          }).filter(Boolean);

          const { error: profileError } = await supabase
            .from("Your Profile")
            .insert([{
              order_id: generatedOrderId,
              "Order Date": orderDate,
              Products: productDetails,
              uid: user.id
            }]);
          if (profileError) {
            allSuccess = false;
            supabaseErrorMsg = profileError.message || JSON.stringify(profileError);
            console.error("Supabase Your Profile Insert Error:", profileError);
          }

          for (const [productId, qty] of Object.entries(cart)) {
            const product = products.find((p) => p.id === Number(productId));
            if (!product) continue;
            const { error: orderError } = await supabase
              .from("Orders")
              .insert([{
                order_id: generatedOrderId,
                Name: name,
                Address: address,
                Pincode: pincode,
                Contact: phone,
                Email: email,
                Product: product.Product || product.ProductName || product.name,
                "Product ID": product.id,
                Quantity: qty,
                "Total Price": (product.Price * qty).toFixed(2),
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
              .update({ Quantity: (product.Quantity || product.quantity || 1) - qty })
              .eq("id", product.id);
          }
          setCart({});
          localStorage.removeItem("cart");
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
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{total.toFixed(2)}</span>
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/50 rounded-lg p-3">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 flex items-center justify-center gap-2"
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