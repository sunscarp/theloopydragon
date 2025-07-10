"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/utils/supabase";

interface Product {
  Product?: string;
  product_name?: string;
  quantity?: number;
  Quantity?: number;
  qty?: number;
  Price?: number;
  price?: number;
  keyChain?: boolean;
  giftWrap?: boolean;
  customMessage?: string;
}

interface OrderDetails {
  "Total Price"?: number;
  Address?: string;
  Pincode?: string;
  "Order Date"?: string;
  "Shipping Cost"?: number;
  uid?: string;
}

interface Order {
  order_id: string;
  Status: string;
  "Order Date": string;
  Products: Product[] | string;
  uid: string;
  Orders?: OrderDetails;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "total" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [customStatus, setCustomStatus] = useState<string>("");

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
        throw new Error("Error fetching orders: " + profileError.message);
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
        throw new Error("Error fetching order details: " + ordersError.message);
      }

      // Merge by order_id
      const ordersMap = new Map<string, OrderDetails>();
      if (ordersData) {
        ordersData.forEach((o) => {
          ordersMap.set(o.order_id, o);
        });
      }

      const merged = (profileData || []).map((profileOrder) => ({
        ...profileOrder,
        Orders: ordersMap.get(profileOrder.order_id) || {}
      }));

      setOrders(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const { error } = await supabase
        .from("Your Profile")
        .update({ Status: newStatus })
        .eq("order_id", orderId);

      if (error) {
        throw new Error("Failed to update status: " + error.message);
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.order_id === orderId 
          ? { ...order, Status: newStatus }
          : order
      ));

      setEditingStatus(null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const parseProducts = (products: Product[] | string): Product[] => {
    try {
      if (typeof products === 'string') {
        return JSON.parse(products);
      } else if (products && typeof products === 'object') {
        return Array.isArray(products) ? products : [products];
      }
      return [];
    } catch (e) {
      console.error('Error parsing products:', e);
      return [];
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter((order) => {
      const matchesSearch = 
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.Orders?.Address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a["Order Date"] || a.Orders?.["Order Date"] || "").getTime();
          bValue = new Date(b["Order Date"] || b.Orders?.["Order Date"] || "").getTime();
          break;
        case "total":
          aValue = a.Orders?.["Total Price"] || 0;
          bValue = b.Orders?.["Total Price"] || 0;
          break;
        case "status":
          aValue = a.Status;
          bValue = b.Status;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, searchTerm, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number | undefined) => {
    return amount ? `₹${amount.toLocaleString()}` : "₹0";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateOrderTotal = (orderProducts: Product[]): number => {
    return orderProducts.reduce((total, prod) => {
      const price = prod.Price || prod.price || 0;
      const quantity = prod.quantity || prod.Quantity || prod.qty || 0;
      return total + (price * quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-medium text-red-800 dark:text-red-200">
                Error Loading Orders
              </h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Orders Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and track all customer orders
          </p>
        </div>

        {/* Total Orders Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {orders.length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Orders
              </label>
              <input
                type="text"
                placeholder="Search by Order ID, UID, or Address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "total" | "status")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="date">Order Date</option>
                <option value="total">Total Price</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Orders ({filteredAndSortedOrders.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedOrders.map((order) => {
                  const orderDetails = order.Orders || {};
                  const products = parseProducts(order.Products);
                  const isEditing = editingStatus === order.order_id;
                  const isUpdating = updatingStatus === order.order_id;

                  return (
                    <tr key={order.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* Order Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            #{order.order_id}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order["Order Date"] || orderDetails["Order Date"])}
                          </div>
                        </div>
                      </td>

                      {/* Status - Now Editable with Custom Option */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={customStatus}
                              onChange={(e) => setCustomStatus(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && customStatus.trim()) {
                                  updateOrderStatus(order.order_id, customStatus);
                                }
                              }}
                              placeholder="Enter status..."
                              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                              onClick={() => {
                                setEditingStatus(null);
                                setCustomStatus("");
                              }}
                              disabled={isUpdating}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span 
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(order.Status)}`}
                              onClick={() => {
                                setEditingStatus(order.order_id);
                                setCustomStatus(order.Status);
                              }}
                            >
                              {order.Status}
                            </span>
                            {isUpdating && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Products */}
                      <td className="px-6 py-4">
                        <div className="w-full max-w-sm">
                          {products.length > 0 ? (
                            <div className="space-y-2">
                              {products.map((prod, idx) => {
                                const addonUnitPrice =
                                  (prod.keyChain ? 10 : 0) + (prod.giftWrap ? 10 : 0);
                                const unitPrice = (Number(prod.Price) || 0) + addonUnitPrice;
                                const subtotal = unitPrice * (prod.quantity || prod.Quantity || prod.qty || 0);
                                return (
                                  <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                      {prod.Product || prod.product_name || "Unknown Product"}
                                      {(prod.keyChain || prod.giftWrap || prod.customMessage) && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {prod.keyChain && <span className="mr-2">+ Keychain <span className="text-[10px]">(+₹10)</span></span>}
                                          {prod.giftWrap && <span className="mr-2">+ Gift Wrap <span className="text-[10px]">(+₹10)</span></span>}
                                          {prod.customMessage && (
                                            <div>
                                              <span className="italic">Message:</span> {prod.customMessage}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 ml-2">
                                      <span className="mr-2">x{prod.quantity || prod.Quantity || prod.qty || 0}</span>
                                      <span>₹{unitPrice.toFixed(2)}{addonUnitPrice > 0 && <span className="ml-1 text-xs text-purple-500">(+addons)</span>}</span>
                                      <span className="ml-2 text-gray-400">Subtotal: ₹{subtotal.toFixed(2)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No products</span>
                          )}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            UID: {order.uid || orderDetails.uid || "N/A"}
                          </div>
                          {orderDetails.Address && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                              {orderDetails.Address}
                            </div>
                          )}
                          {orderDetails.Pincode && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              PIN: {orderDetails.Pincode}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(calculateOrderTotal(products))}
                          </div>
                          {orderDetails["Shipping Cost"] && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Shipping: {formatCurrency(orderDetails["Shipping Cost"])}
                            </div>
                          )}
                          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            Total: {formatCurrency(calculateOrderTotal(products) + (orderDetails["Shipping Cost"] || 0))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSortedOrders.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? "Try adjusting your search criteria."
                  : "Orders will appear here once customers place them."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}