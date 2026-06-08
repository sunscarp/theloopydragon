"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

function OrderSummaryContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      // Fetch all rows for this order_id (one per product)
      const { data: ordersData } = await supabase
        .from("Orders")
        .select("*")
        .eq("order_id", orderId);

      if (ordersData && ordersData.length > 0) {
        setOrders(ordersData);
        // Send order confirmation email
        try {
          await fetch("/api/order-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order: ordersData[0],
              orders: ordersData,
              customerEmail: ordersData[0].Email,
            }),
          });
        } catch (error) {
          console.error("Failed to send order confirmation:", error);
        }
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading order summary...</div>;
  }

  if (orders.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Order not found.</div>;
  }

  const total = orders.reduce(
    (sum: number, item: any) => sum + Number(item["Total Price"] || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400 text-center">Order Placed Successfully!</h2>
        <div className="mb-4 text-gray-700 dark:text-gray-200 space-y-2">
          <div><b>Order ID:</b> {orders[0].order_id}</div>
          <div><b>Name:</b> {orders[0].Name}</div>
          <div><b>Address:</b> {orders[0].Address}, {orders[0].Pincode}</div>
          <div><b>Contact (WhatsApp):</b> {orders[0].Contact}</div>
          <div><b>Email:</b> {orders[0].Email}</div>
          <div>
            <b>Items Ordered:</b>
            <ul className="list-disc ml-6">
              {orders.map((item, idx) => (
                <li key={idx}>
                  <span className="font-medium">{item.Product}</span>
                  <span className="ml-2">x {item.Quantity}</span>
                  <span className="ml-2">₹{item.Price} each</span>
                  <span className="ml-2 text-gray-500">Subtotal: ₹{Number(item["Total Price"]).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 text-lg font-bold">
            Total Paid: <span className="text-green-700 dark:text-green-300">₹{total.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-green-700 dark:text-green-300 text-center font-semibold mt-4">
          Thank you for shopping with The Loopy Dragon!
        </div>
        <div className="flex justify-center mt-6">
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSummary() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading order summary...</div>}>
      <OrderSummaryContent />
    </Suspense>
  );
}
