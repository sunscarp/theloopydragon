"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ProfileOrder = {
  order_id: string;
  Status?: string;
  "Order Date"?: string;
  Products?: Array<{
    Product: string;
    Quantity: number;
    Price: number;
    "Total Price": string;
    "Shipping Cost"?: string;
  }>;
  uid?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Trigger at 50px for smooth transition
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.replace("/login");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.replace("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    async function fetchOrders() {
      setLoading(true);
      console.log("Fetching orders for user:", user.id); // Debug log

      // Fetch from Your Profile table for this user's orders
      const { data: profileRows, error: profileError } = await supabase
        .from("Your Profile")
        .select("*") // Select all columns to see what we get
        .eq('uid', user.id)
        .order("Order Date", { ascending: false });

      if (profileError) {
        console.error("Error fetching Your Profile data:", profileError);
        setOrders([]);
        setLoading(false);
        return;
      }

      console.log("Fetched orders:", profileRows); // Debug log
      setOrders(profileRows || []);
      setLoading(false);
    }
    fetchOrders();
  }, [user]);

  if (!user) return null; // Will redirect to login

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Sticky Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-md py-2 px-4 sm:px-6'
            : 'bg-transparent py-4 px-6 sm:px-8'
        }`}
      >
        <Navbar />
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-16 sm:h-20"></div>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-teal-100 to-teal-300 dark:from-teal-900 dark:to-teal-700 py-8 sm:py-20 px-2 sm:px-6 flex flex-col items-center">
        <h1 className="text-2xl sm:text-5xl font-extrabold text-teal-900 dark:text-teal-100 mb-4 sm:mb-8 text-center">
          Your Profile
        </h1>
        <p className="text-base sm:text-xl text-teal-800 dark:text-teal-200 mb-4 sm:mb-8 text-center max-w-2xl">
          Manage your account and view your order history
        </p>
      </section>

      <main className="w-full max-w-4xl mx-auto py-4 sm:py-12 px-2 sm:px-6 flex-1">
        <div className="grid gap-6 sm:gap-8">
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
            <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6 text-gray-800 dark:text-gray-100">Account Information</h2>
            {user && (
              <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                <p><span className="font-semibold">Email:</span> {user.email}</p>
                {/* Add more user information as needed */}
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8">
            <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6 text-gray-800 dark:text-gray-100">Order History</h2>
            {loading ? (
              <div className="text-gray-500 dark:text-gray-400">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">No orders found.</div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: ProfileOrder) => (
                  <div
                    key={order.order_id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-3 sm:p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                      <div className="font-semibold text-green-700 dark:text-green-300 text-sm sm:text-base">
                        Order ID: <span className="break-all">{order.order_id}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {order["Order Date"] ? new Date(order["Order Date"]).toLocaleString() : "N/A"}
                      </div>
                    </div>
                    <div className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm mb-2">
                      <b>Status:</b> {order.Status || "Order Placed: Will be dispatched within 2 days of order date"}
                    </div>
                    {/* Order Summary Table */}
                    {Array.isArray(order.Products) && order.Products.length > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold mb-1 text-gray-800 dark:text-gray-100 text-xs sm:text-base">Order Summary</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Product
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Qty
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Unit Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Subtotal
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                              {order.Products.map((item: any, idx: number) => {
                                const addonUnitPrice =
                                  (item.keyChain ? 10 : 0) +
                                  (item.giftWrap ? 10 : 0) +
                                  (item.carMirror ? 50 : 0);
                                const unitPrice = (Number(item.Price) || 0) + addonUnitPrice;
                                const subtotal = unitPrice * Number(item.Quantity);
                                return (
                                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                      <div>
                                        {item.Product}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        ₹{Number(item.Price).toFixed(2)}
                                        {addonUnitPrice > 0 && (
                                          <span className="ml-2 text-purple-500">
                                            + Addons ₹{addonUnitPrice}
                                          </span>
                                        )}
                                      </div>
                                      {(item.keyChain || item.giftWrap || item.carMirror || item.customMessage) && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {item.keyChain && <span className="mr-2">+ Keychain <span className="text-[10px]">(+₹10)</span></span>}
                                          {item.giftWrap && <span className="mr-2">+ Gift Wrap <span className="text-[10px]">(+₹10)</span></span>}
                                          {item.carMirror && <span className="mr-2">+ Car mirror accessory <span className="text-[10px]">(+₹50)</span></span>}
                                          {item.customMessage && (
                                            <div>
                                              <span className="italic">Message:</span> {item.customMessage}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                                      {item.Quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                                      ₹{unitPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-gray-900 dark:text-white">
                                      ₹{subtotal.toFixed(2)}
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr>
                                <td colSpan={3} className="px-6 py-4 text-right font-medium">Subtotal</td>
                                <td className="px-6 py-4 text-right font-medium">
                                  ₹{order.Products.reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0).toFixed(2)}
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="px-6 py-4 text-right font-medium">Shipping</td>
                                <td className="px-6 py-4 text-right font-medium">
                                  ₹{Number(order.Products[0]?.["Shipping Cost"] || 0).toFixed(2)}
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="px-6 py-4 text-right font-bold">Total Paid</td>
                                <td className="px-6 py-4 text-right font-bold text-green-700 dark:text-green-300">
                                  ₹{(order.Products.reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0) + Number(order.Products[0]?.["Shipping Cost"] || 0)).toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {/* Removed Track your order button */}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
