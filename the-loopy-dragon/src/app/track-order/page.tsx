"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");
  const [order, setOrder] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order_id) return;
    async function fetchOrder() {
      setLoading(true);
      const { data: orderRows } = await supabase
        .from("Orders")
        .select("Product")
        .eq("order_id", order_id);

      const { data: profileRow } = await supabase
        .from("Your Profile")
        .select("Status, \"Order Date\"")
        .eq("order_id", order_id)
        .maybeSingle();

      setOrder(orderRows || []);
      setProfile(profileRow || null);
      setLoading(false);
    }
    fetchOrder();
  }, [order_id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 max-w-lg w-full">
        <div className="flex items-center justify-center mb-6">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white text-center">
            Track Your Order
          </h2>
        </div>
        {loading ? (
          <div className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base animate-pulse">
            Loading order details...
          </div>
        ) : (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 mb-6 text-gray-700 dark:text-gray-200 text-sm sm:text-base">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="font-semibold">Order ID:</span> {order_id || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Products:</span>{" "}
                  {order && order.length > 0 ? order.map((o: any) => o.Product).join(", ") : "No products found"}
                </div>
                <div>
                  <span className="font-semibold">Order Date:</span>{" "}
                  {profile?.["Order Date"] ? new Date(profile["Order Date"]).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${profile?.Status === "Delivered" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400" : profile?.Status === "Shipped" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400"}`}>
                    {profile?.Status || "Processing"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Link
                href="/profile"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-base sm:text-lg transition duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Profile
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}