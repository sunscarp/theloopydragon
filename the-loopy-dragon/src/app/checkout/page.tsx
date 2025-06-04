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
    // Calculate total
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
          // For each product in cart, insert order and update inventory
          let allSuccess = true;
          let lastOrderId = null;
          for (const [productId, qty] of Object.entries(cart)) {
            const product = products.find((p) => p.id === Number(productId));
            if (!product) continue;
            // Insert order
            const { error: orderError, data: orderData } = await supabase
              .from("Orders")
              .insert([{
                Name: name,
                Address: address,
                Pincode: pincode,
                Contact: phone,
                Email: email,
                Product: product.Product || product.ProductName || product.name,
                "Product ID": product.id,
              }])
              .select()
              .single();
            if (orderError) {
              allSuccess = false;
              continue;
            }
            lastOrderId = orderData?.id;
            // Update inventory (reduce Quantity by qty)
            await supabase
              .from("Inventory")
              .update({ Quantity: (product.Quantity || product.quantity || 1) - qty })
              .eq("id", product.id);
          }
          setCart({});
          localStorage.removeItem("cart");
          if (allSuccess && lastOrderId) {
            router.push(`/order-summary?order_id=${lastOrderId}`);
          } else {
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
      router.push("/order-failed");
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <main className="max-w-xl mx-auto py-12 px-4 flex-1">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100 text-center">
            Checkout
          </h2>
          <form
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col gap-6"
            onSubmit={e => { e.preventDefault(); handlePayment(); }}
          >
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">
                Address
              </label>
              <textarea
                placeholder="House No, Street, Area, City"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                rows={3}
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="6-digit Pincode"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  required
                  maxLength={6}
                  pattern="\d{6}"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">
                  Phone (WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="10-digit WhatsApp Number"
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  maxLength={10}
                  pattern="\d{10}"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition text-lg font-semibold"
            >
              Pay with Razorpay
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
