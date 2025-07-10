"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase";

type CustomOrder = {
  id: number;
  uid: string;
  "Full Name": string;
  Email: string;
  Phone: string;
  "Order Details": string;
  ImageUrl1?: string | null;
  ImageUrl2?: string | null;
  ImageUrl3?: string | null;
};

type ProductItem = {
  Product: string;
  Price: number;
  Quantity: number;
  "Total Price": string;
  "Shipping Cost": string;
  keyChain?: boolean;
  giftWrap?: boolean;
};

export default function CustomOrderPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // For Accept: interactive form instead of JSON paste
  const [acceptingOrder, setAcceptingOrder] = useState<null | { id: number, uid?: string, email: string }>(null);
  const [products, setProducts] = useState<ProductItem[]>([{
    Product: "",
    Price: 0,
    Quantity: 1,
    "Total Price": "",
    "Shipping Cost": ""
  }]);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptMsg, setAcceptMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("Custom")
        .select('id, uid, "Full Name", Email, Phone, "Order Details", ImageUrl1, ImageUrl2, ImageUrl3')
        .order("id", { ascending: false });
      if (error) {
        setError("Failed to fetch orders: " + error.message);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Component to handle image with fallback and loading states
  const ImageWithFallback = ({ src, alt, className }: { src: string | null, alt: string, className: string }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    if (!src || src.trim() === '') return null;

    return (
      <div className="relative">
        {imageLoading && (
          <div className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
            <span className="text-gray-500 text-xs">Loading...</span>
          </div>
        )}
        {!imageError ? (
          <img
            src={src}
            alt={alt}
            className={`${className} ${imageLoading ? 'hidden' : 'block'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <div className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-400`}>
            <span className="text-gray-500 text-xs text-center">Image not found</span>
          </div>
        )}
      </div>
    );
  };

  // Helper to generate unique order_id
  const generateOrderId = async () => {
    let orderId: string;
    let exists = true;
    while (exists) {
      orderId = `ODR-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data } = await supabase.from("Your Profile").select("order_id").eq("order_id", orderId);
      exists = !!(data && data.length > 0);
    }
    return orderId!;
  };

  // Send mail API
  const sendMail = async (to: string, subject: string, body: string) => {
    try {
      const response = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          text: body,
          html: body.split('\n').map(line => `<p>${line}</p>`).join(''),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      return true;
    } catch (error: any) {
      console.error('Send mail error:', error);
      setActionMessage(`Failed to send mail: ${error.message}`);
      return false;
    }
  };

  // Handle reply
  const handleReply = async (order: CustomOrder) => {
    setActionLoading(true);
    setActionMessage(null);
    const ok = await sendMail(order.Email, "Reply to your custom order", replyText);
    setActionLoading(false);
    setActionMessage(ok ? "Reply sent!" : "Failed to send reply.");
    setReplyingId(null);
    setReplyText("");
  };

  // Handle Accept
  const handleAccept = (order: CustomOrder) => {
    setAcceptingOrder({ 
      id: order.id, 
      uid: order.uid, // Now correctly getting uid from Custom table
      email: order.Email 
    });
    // Reset products to single empty item
    setProducts([{
      Product: "",
      Price: 0,
      Quantity: 1,
      "Total Price": "",
      "Shipping Cost": ""
    }]);
    setAcceptMsg(null);
  };

  // Product form handlers
  const updateProduct = (index: number, field: keyof ProductItem, value: string | number) => {
    const newProducts = [...products];
    
    // Handle empty input for numeric fields
    if ((field === 'Price' || field === 'Quantity' || field === 'Shipping Cost') && value === '') {
      newProducts[index] = { 
        ...newProducts[index], 
        [field]: field === 'Shipping Cost' ? '' : 0,
        "Total Price": field === 'Shipping Cost' ? newProducts[index]["Total Price"] : ""
      };
    } else {
      if (field === 'Shipping Cost') {
        // For shipping cost, preserve the exact input value
        newProducts[index] = { 
          ...newProducts[index], 
          [field]: value.toString()
        };
      } else {
        newProducts[index] = { ...newProducts[index], [field]: value };
        
        // Auto-calculate total price when price or quantity changes
        if (field === 'Price' || field === 'Quantity' || field === 'keyChain' || field === 'giftWrap') {
          const price = field === 'Price' ? Number(value) : newProducts[index].Price;
          const quantity = field === 'Quantity' ? Number(value) : newProducts[index].Quantity;
          const addonUnitPrice =
            (newProducts[index].keyChain ? 10 : 0) + (newProducts[index].giftWrap ? 10 : 0);
          newProducts[index]["Total Price"] = ((price + addonUnitPrice) * quantity || 0).toFixed(2);
        }
      }
    }
    
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, {
      Product: "",
      Price: 0,
      Quantity: 1,
      "Total Price": "",
      "Shipping Cost": ""
    }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleAcceptSubmit = async () => {
    setAcceptLoading(true);
    setAcceptMsg(null);
    
    try {
      // Validate products
      const invalidProducts = products.filter(p => !p.Product.trim() || p.Price <= 0 || p.Quantity <= 0);
      if (invalidProducts.length > 0) {
        setAcceptMsg("Please fill in all product details with valid values.");
        setAcceptLoading(false);
        return;
      }

      const orderId = await generateOrderId();
      const now = new Date().toISOString();
      
      // Format products for consistency with existing format
      const formattedProducts = products.map(p => ({
        Price: p.Price,
        Product: p.Product,
        Quantity: p.Quantity,
        "Total Price": (p.Price * p.Quantity).toFixed(2),
        "Shipping Cost": p["Shipping Cost"]
      }));

      // Calculate total shipping cost
      const totalShipping = formattedProducts.reduce((sum, p) => 
        sum + parseFloat(p["Shipping Cost"] || "0"), 0
      );

      // Calculate total product cost
      const totalProducts = formattedProducts.reduce((sum, p) => 
        sum + (p.Price * p.Quantity), 0
      );

      // Insert into Orders table first with Name field
      const { error: orderError } = await supabase.from("Orders").insert([{
        order_id: orderId,
        Name: orders.find(o => o.id === acceptingOrder?.id)?.["Full Name"], // Add Name field
        "Shipping Cost": totalShipping,
        "Total Price": totalProducts,
        uid: acceptingOrder?.uid
      }]);

      if (orderError) throw orderError;

      // Then insert into Your Profile
      const { error } = await supabase.from("Your Profile").insert([{
        order_id: orderId,
        Status: "Order successful: Your Order is now being made",
        "Order Date": now,
        Products: formattedProducts, // Use formatted products array
        uid: acceptingOrder?.uid
      }]);
      
      if (error) throw error;
      
      // Send mail to customer with order details
      const productsText = formattedProducts.map(p => 
        `${p.Product}: ${p.Quantity} x ₹${p.Price} = ₹${p["Total Price"]}`
      ).join('\n');

      const ok = await sendMail(
        acceptingOrder!.email,
        "Your Custom Order is Accepted",
        `Your order has been accepted!\n\nOrder ID: ${orderId}\n\nProducts:\n${productsText}\n\nShipping Cost: ₹${totalShipping}\nTotal Amount: ₹${totalProducts + totalShipping}`
      );
      
      // Delete from Custom table
      const { error: deleteError } = await supabase
        .from("Custom")
        .delete()
        .eq('id', acceptingOrder?.id);

      if (deleteError) throw deleteError;

      // Update local state to remove the order
      setOrders(prev => prev.filter(order => order.id !== acceptingOrder?.id));
      
      setAcceptMsg(ok ? "Order accepted and customer notified!" : "Order accepted, but failed to send mail.");
      setAcceptingOrder(null);
    } catch (e: any) {
      setAcceptMsg("Error: " + (e.message || "Unknown error"));
    }
    setAcceptLoading(false);
  };

  // Handle Reject
  const handleReject = async (order: CustomOrder) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const ok = await sendMail(
        order.Email,
        "Custom Order Update",
        "We're sorry, but we are unable to accept your custom order at this time."
      );

      if (ok) {
        // Delete from Custom table
        const { error: deleteError } = await supabase
          .from("Custom")
          .delete()
          .eq('id', order.id);

        if (deleteError) throw deleteError;

        // Update local state to remove the order
        setOrders(prev => prev.filter(o => o.id !== order.id));
      }

      setActionMessage(ok ? "Rejection sent and order removed." : "Failed to send rejection mail.");
    } catch (error: any) {
      setActionMessage("Error: " + (error.message || "Unknown error"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Custom Orders</h1>
      {loading && <p className="text-gray-700 dark:text-gray-200">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {actionMessage && (
        <div className="mb-4 text-center text-sm text-green-600 dark:text-green-400">{actionMessage}</div>
      )}
      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-700 dark:text-gray-200">No custom orders found.</p>
      )}
      <div className="space-y-8">
        {orders.map(order => (
          <div key={order.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 shadow">
            <div className="mb-2">
              <span className="font-semibold">Order ID:</span> {order.id}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Full Name:</span> {order["Full Name"]}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Email:</span> {order.Email}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Phone:</span> {order.Phone}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Order Details:</span> {order["Order Details"]}
            </div>
            {/* Images Section */}
            {(order.ImageUrl1 || order.ImageUrl2 || order.ImageUrl3) && (
              <div className="mt-4">
                <span className="font-semibold block mb-2">Images:</span>
                <div className="flex gap-4 flex-wrap">
                  {[order.ImageUrl1, order.ImageUrl2, order.ImageUrl3].map(
                    (imageUrl, idx) =>
                      imageUrl && (
                        <ImageWithFallback
                          key={idx}
                          src={imageUrl}
                          alt={`Order ${order.id} Image ${idx + 1}`}
                          className="w-32 h-32 object-cover rounded border"
                        />
                      )
                  )}
                </div>
              </div>
            )}
            {/* Reply/Accept/Reject Actions */}
            <div className="mt-6 flex flex-col gap-2">
              {replyingId === order.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="w-full border rounded p-2"
                    rows={3}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply to the customer..."
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                      disabled={actionLoading}
                      onClick={() => handleReply(order)}
                      type="button"
                    >
                      {actionLoading ? "Sending..." : "Send Reply"}
                    </button>
                    <button
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                      disabled={actionLoading}
                      onClick={() => { setReplyingId(null); setReplyText(""); }}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => setReplyingId(order.id)}
                  type="button"
                >
                  Reply via Email
                </button>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() => handleAccept(order as any)}
                  type="button"
                >
                  Accept Order
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded"
                  onClick={() => handleReject(order)}
                  disabled={actionLoading}
                  type="button"
                >
                  Reject Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Interactive Accept Modal */}
      {acceptingOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Accept Order - Add Products</h3>
            
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Product {index + 1}</h4>
                    {products.length > 1 && (
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Name *</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={product.Product}
                        onChange={(e) => updateProduct(index, 'Product', e.target.value)}
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full border rounded p-2"
                        value={product.Price || ''}
                        onChange={(e) => updateProduct(index, 'Price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity *</label>
                      <input
                        type="number"
                        min="0" // Changed from min="1"
                        className="w-full border rounded p-2"
                        value={product.Quantity || ''} // Show empty string instead of 0
                        onChange={(e) => updateProduct(index, 'Quantity', parseInt(e.target.value) || 0)} // Allow 0
                        placeholder="0" // Changed from "1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Shipping Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full border rounded p-2"
                        value={product["Shipping Cost"]}
                        onChange={(e) => updateProduct(index, 'Shipping Cost', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Keychain Add-on</label>
                      <input
                        type="checkbox"
                        checked={!!product.keyChain}
                        onChange={e => updateProduct(index, 'keyChain', Number(e.target.checked))}
                      /> +₹10
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gift Wrap Add-on</label>
                      <input
                        type="checkbox"
                        checked={!!product.giftWrap}
                        onChange={e => updateProduct(index, 'giftWrap', Number(e.target.checked))}
                      /> +₹10
                    </div>
                  </div>
                  
                  <div className="mt-3 text-right">
                    <span className="text-lg font-semibold">
                      Total Price: ₹{product["Total Price"]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={addProduct}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                type="button"
              >
                + Add Another Product
              </button>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <div className="text-right text-xl font-bold mb-4">
                Grand Total: ₹{products.reduce((sum, p) => sum + parseFloat(p["Total Price"]) + parseFloat(p["Shipping Cost"]), 0).toFixed(2)}
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded"
                  onClick={() => setAcceptingOrder(null)}
                  disabled={acceptLoading}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded"
                  onClick={handleAcceptSubmit}
                  disabled={acceptLoading}
                  type="button"
                >
                  {acceptLoading ? "Processing..." : "Accept & Notify Customer"}
                </button>
              </div>
            </div>
            
            {acceptMsg && (
              <div className="mt-4 text-center text-sm text-green-600 dark:text-green-400">
                {acceptMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}