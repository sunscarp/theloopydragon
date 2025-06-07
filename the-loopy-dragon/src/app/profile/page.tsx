"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ProfileOrder = {
  order_id: string;
  status?: string;
  order_date?: string;
  products?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <Navbar cart={{}} />
      
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
                {orders.map(order => (
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
                      <b>Status:</b> {order.Status || "Processing"}
                    </div>
                    {/* Order Summary Table */}
                    {Array.isArray(order.Products) && order.Products.length > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold mb-1 text-gray-800 dark:text-gray-100 text-xs sm:text-base">Order Summary</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm">
                            <thead>
                              <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-200">Product</th>
                                <th className="px-2 py-1 text-center font-medium text-gray-700 dark:text-gray-200">Qty</th>
                                <th className="px-2 py-1 text-center font-medium text-gray-700 dark:text-gray-200">Unit Price</th>
                                <th className="px-2 py-1 text-right font-medium text-gray-700 dark:text-gray-200">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.Products.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                                  <td className="px-2 py-1">{item.Product}</td>
                                  <td className="px-2 py-1 text-center">{item.Quantity}</td>
                                  <td className="px-2 py-1 text-center">
                                    ₹{item.Price ? Number(item.Price).toFixed(2) : ((Number(item["Total Price"]) / Number(item.Quantity)) || 0).toFixed(2)}
                                  </td>
                                  <td className="px-2 py-1 text-right font-semibold">
                                    ₹{Number(item["Total Price"]).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={3} className="px-2 py-1 text-right font-bold">Total Paid</td>
                                <td className="px-2 py-1 text-right font-bold text-green-700 dark:text-green-300">
                                  ₹{order.Products.reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0).toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    <Link
                      href={`/track-order?order_id=${order.order_id}`}
                      className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs sm:text-sm transition"
                    >
                      Track your order
                    </Link>
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
