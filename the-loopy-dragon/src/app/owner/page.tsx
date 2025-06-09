"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user as { email?: string } | null;

      const authorizedEmails = [
        "sanskarisamazing@gmail.com",
        "snp480@gmail.com",
        "ssp3201@gmail.com",
        "f20231193@hyderabad.bits-pilani.ac.in"
      ];

      if (!currentUser || !currentUser.email || !authorizedEmails.includes(currentUser.email)) {
        router.push("/");
        return;
      }

      setUser(currentUser);
      fetchOrders();
    };

    checkAuth();
  }, [router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all from "Your Profile"
      const { data: profileData, error: profileError } = await supabase
        .from("Your Profile")
        .select(`
          order_id,
          Status,
          "Order Date",
          Products,
          uid
        `)
        .order("Order Date", { ascending: false });

      if (profileError) {
        setError("Error fetching orders: " + profileError.message);
        setLoading(false);
        return;
      }

      // Fetch all from "Orders"
      const { data: ordersData, error: ordersError } = await supabase
        .from("Orders")
        .select(`
          order_id,
          "Total Price",
          Address,
          Pincode,
          "Order Date",
          "Shipping Cost",
          uid
        `);

      if (ordersError) {
        setError("Error fetching order details: " + ordersError.message);
        setLoading(false);
        return;
      }

      // Merge by order_id
      const ordersMap = new Map();
      if (ordersData) {
        for (const o of ordersData) {
          ordersMap.set(o.order_id, o);
        }
      }

      const merged = (profileData || []).map((profileOrder) => ({
        ...profileOrder,
        Orders: ordersMap.get(profileOrder.order_id) || {}
      }));

      setOrders(merged);
    } catch (err) {
      setError("Unexpected error occurred");
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("Your Profile")
      .update({ Status: newStatus })
      .eq("order_id", orderId);

    if (error) {
      console.error("Error updating order:", error);
      return;
    }

    fetchOrders();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Owner Dashboard</h1>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">Error</h2>
            <pre className="whitespace-pre-wrap text-red-600 dark:text-red-300 text-sm">
              {error}
            </pre>
            <button
              onClick={() => {
                setError(null);
                fetchOrders();
              }}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Sneshisan gang</h1>
          <p className="text-gray-600 dark:text-gray-300">No Idea what to put here</p>
        </div>
      </div>
    </div>
  );
}
