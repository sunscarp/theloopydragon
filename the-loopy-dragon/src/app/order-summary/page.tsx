"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function OrderSummary() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      const { data } = await supabase.from("Orders").select("*").eq("id", orderId).single();
      setOrder(data);

      // Fetch product details from Inventory if Product ID exists
      if (data && data["Product ID"]) {
        const { data: prod } = await supabase
          .from("Inventory")
          .select("Product, Price")
          .eq("id", data["Product ID"])
          .single();
        setProduct(prod);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading order summary...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400 text-center">Order Placed Successfully!</h2>
        <div className="mb-4 text-gray-700 dark:text-gray-200 space-y-2">
          <div><b>Order ID:</b> {order.id}</div>
          <div><b>Name:</b> {order.Name}</div>
          <div><b>Address:</b> {order.Address}, {order.Pincode}</div>
          <div><b>Contact (WhatsApp):</b> {order.Contact}</div>
          <div><b>Email:</b> {order.Email}</div>
          <div>
            <b>Product:</b> {product ? product.Product : order.Product}
            {product && <span> (₹{product.Price})</span>}
          </div>
          <div><b>Product ID:</b> {order["Product ID"]}</div>
        </div>
        <div className="text-green-700 dark:text-green-300 text-center font-semibold mt-4">
          Thank you for shopping with The Loopy Dragon!
        </div>
      </div>
    </div>
  );
}
