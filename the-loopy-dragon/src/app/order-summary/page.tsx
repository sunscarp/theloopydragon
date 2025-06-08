"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

function OrderSummaryContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams ? searchParams.get("order_id") : null;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      const { data: ordersData } = await supabase
        .from("Orders")
        .select("*")
        .eq("order_id", orderId);

      setOrders(ordersData || []);
      setLoading(false);

      if (ordersData && ordersData.length > 0) {
        const order = ordersData[0];
        const total = ordersData.reduce(
          (sum, item) => sum + (Number(item["Total Price"]) || 0),
          0
        );
        fetch("/api/order-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: order.order_id,
            Name: order.Name,
            Address: order.Address,
            Pincode: order.Pincode,
            Contact: order.Contact,
            Email: order.Email,
            orders: ordersData,
            total,
          }),
        });
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-gray-600 dark:text-gray-300 text-lg font-medium animate-pulse">
          Loading order summary...
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-gray-600 dark:text-gray-300 text-lg font-medium bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          Order not found.
        </div>
      </div>
    );
  }

  const order = orders[0];
  const total = orders.reduce(
    (sum, item) => sum + (Number(item["Total Price"]) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white text-center">
            Order Placed Successfully!
          </h2>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Order Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-200 text-sm sm:text-base">
            <div>
              <span className="font-semibold">Order ID:</span> {order.order_id}
            </div>
            <div>
              <span className="font-semibold">Name:</span> {order.Name}
            </div>
            <div>
              <span className="font-semibold">Address:</span> {order.Address}, {order.Pincode}
            </div>
            <div>
              <span className="font-semibold">Contact (WhatsApp):</span> {order.Contact}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">Email:</span> {order.Email}
            </div>
          </div>
        </div>
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Order Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg shadow-sm text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-600">
                  <th className="px-4 sm:px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Product</th>
                  <th className="px-4 sm:px-6 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">Quantity</th>
                  <th className="px-4 sm:px-6 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">Unit Price</th>
                  <th className="px-4 sm:px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                    <td className="px-4 sm:px-6 py-3 text-gray-900 dark:text-gray-100">{item.Product}</td>
                    <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100">{item.Quantity}</td>
                    <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100">
                      ₹{item.Price || (Number(item["Total Price"]) / Number(item.Quantity)).toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                      ₹{Number(item["Total Price"]).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 dark:border-gray-600">
                  <td colSpan={3} className="px-4 sm:px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    Subtotal
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                    ₹{total.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 sm:px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    Shipping
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                    ₹{Number(orders[0]["Shipping Cost"] || 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 sm:px-6 py-4 text-right font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    Total Paid
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right font-bold text-base sm:text-lg text-green-600 dark:text-green-400">
                    ₹{(total + Number(orders[0]["Shipping Cost"] || 0)).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-green-600 dark:text-green-400 text-center font-semibold text-sm sm:text-base mb-6 sm:mb-8">
          Thank you for shopping with The Loopy Dragon!
        </div>
        <div className="flex justify-center">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base sm:text-lg transition duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            onClick={(e) => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("cart");
                window.dispatchEvent(new Event("cart:clear"));
                e.preventDefault();
                window.location.href = "/";
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSummary() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-gray-600 dark:text-gray-300 text-lg font-medium animate-pulse">
          Loading order summary...
        </div>
      </div>
    }>
      <OrderSummaryContent />
    </Suspense>
  );
}