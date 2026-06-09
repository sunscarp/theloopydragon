"use client";
import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Import Montserrat font
import { Montserrat } from "next/font/google";
// Import Arapey from Google Fonts
import { Arapey } from "next/font/google";
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });
const arapey = Arapey({ subsets: ["latin"], weight: "400" });

function OrderSummaryContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams ? searchParams.get("order_id") : null;
  const [orders, setOrders] = useState<any[]>([]);
  const [profileOrder, setProfileOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const dragonDiscount = Number(profileOrder?.["Total Discount"] || 0);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      // Fetch all sub-orders matching the base order_id (grouped by seller)
      const { data: ordersData } = await supabase
        .from("Orders")
        .select("*")
        .or(`order_id.eq.${orderId},order_id.like.${orderId}%`);

      const { data: profileData } = await supabase
        .from("Your Profile")
        .select("*")
        .or(`order_id.eq.${orderId},order_id.like.${orderId}%`)
        .order("Order Date", { ascending: true });

      setOrders(ordersData || []);
      // Combine multiple profile entries into one for display
      if (profileData && profileData.length > 0) {
        const combined = { ...profileData[0] };
        combined.Products = profileData.flatMap((p: any) => p.Products || []);
        setProfileOrder(combined);
      } else {
        setProfileOrder(null);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  const getBasePrice = (item: any) => {
    if (item["Custom Order"] || (profileOrder && profileOrder["Custom Order"])) {
      const totalPrice = Number(item["Total Price"] || 0);
      const quantity = Number(item.Quantity || 1);
      if (totalPrice > 0 && quantity > 0) {
        return totalPrice / quantity;
      }
    }
    if (typeof item.Price === "number" && !isNaN(item.Price)) return item.Price;
    if (item.Price && !isNaN(Number(item.Price))) return Number(item.Price);
    if (item["Base Price"] && !isNaN(Number(item["Base Price"]))) return Number(item["Base Price"]);
    if (item["Unit Price"] && !isNaN(Number(item["Unit Price"]))) return Number(item["Unit Price"]);
    if (typeof window !== "undefined") {
      try {
        const products = JSON.parse(localStorage.getItem("products") || "[]");
        let found = products.find((p: any) => p.Product === item.Product);
        if (!found && item["Product ID"]) {
          found = products.find((p: any) => p.id === item["Product ID"]);
        }
        if (found && found.Price) return Number(found.Price);
      } catch {}
    }
    return 0;
  };

  // Ref for the invoice section
  const invoiceRef = useRef<HTMLDivElement>(null);

  // PDF download handler using html2canvas for exact visual match
  async function handleDownloadPDF() {
    if (!invoiceRef.current) return;
    // Use html2canvas to render the invoice section
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff"
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dimensions to fit A4 while maintaining aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let y = 0;

    // If image is taller than page, scale to fit height
    if (imgHeight > pageHeight) {
      const imgHeightFit = pageHeight;
      const imgWidthFit = (canvas.width * imgHeightFit) / canvas.height;
      pdf.addImage(imgData, "PNG", (pageWidth - imgWidthFit) / 2, 0, imgWidthFit, imgHeightFit);
    } else {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save(`Invoice-${orders[0]?.order_id || "order"}.pdf`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: montserrat.style.fontFamily, color: "#000" }}>
        <div className="text-lg font-medium animate-pulse">
          Loading order summary...
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: montserrat.style.fontFamily, color: "#000" }}>
        <div className="text-lg font-medium bg-gray-50 rounded-lg p-4">
          Order not found.
        </div>
      </div>
    );
  }

  const order = orders[0];
  const subtotal = orders.reduce(
    (sum, item) => sum + (Number(item["Total Price"]) || 0),
    0
  );
  const shippingCost = orders.reduce(
    (sum, item) => sum + (Number(item["Shipping Cost"]) || 0),
    0
  );

  const finalTotalAfterDiscount = subtotal - dragonDiscount;
  const totalPaid = finalTotalAfterDiscount + shippingCost;

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div
      className="min-h-screen bg-white py-4 px-4" // was py-8
      style={{
        fontFamily: montserrat.style.fontFamily,
        color: "#000",
        background: "#fff", // Ensure background is hex, not oklch
      }}
    >
      <div
        className="max-w-2xl mx-auto"
        ref={invoiceRef}
        style={{
          background: "#ffffff",
          color: "#000000",
          padding: "2rem",
          fontFamily: montserrat.style.fontFamily,
        }}
      >
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#f3e8ff" }}
          >
            <img
              src="/circle-logo.png"
              alt="The Loopy Dragon Logo"
              className="w-16 h-16 rounded-full object-cover"
              style={{ background: "#ffffff" }}
            />
          </div>
          <span
            className={arapey.className}
            style={{
              fontSize: "clamp(16px, 1.3vw, 20px)",
              letterSpacing: "clamp(0.15em, 0.2vw, 0.25em)",
              lineHeight: "100%",
              color: "#000000",
              fontWeight: 400,
              whiteSpace: "nowrap",
              display: "block",
              marginBottom: "0.5rem"
            }}
          >
            THE LOOPY DRAGON
          </span>
        </div>
        {/* Invoice Title and Details */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', 'Times New Roman', serif",
                fontSize: "2.5rem",
                fontWeight: 400,
                color: "#000000",
                marginBottom: "0.5rem",
                lineHeight: 1,
                letterSpacing: "0.04em"
              }}
            >
              INVOICE
            </h1>
            <div
              style={{
                fontFamily: montserrat.style.fontFamily,
                fontSize: "1rem",
                color: "#000000",
                marginBottom: "1.2rem",
                fontWeight: 500,
              }}
            >
              Invoice No. {order.order_id}
            </div>
            <div className="space-y-1 text-sm" style={{ color: "#000000" }}>
              <div>
                <span className="font-medium">Name:</span> {order.Name}
              </div>
              <div>
                <span className="font-medium">Address:</span> {order.Address}, {order.Pincode}
              </div>
              <div>
                <span className="font-medium">Contact:</span> {order.Contact}
              </div>
              <div>
                <span className="font-medium">Email:</span> {order.Email}
              </div>
            </div>
          </div>
          <div className="text-right text-sm" style={{ color: "#000000" }}>
            <div>{currentDate}</div>
          </div>
        </div>

        {/* Special Offers */}
        {profileOrder?.["Dragon Offer"] && (
          <div 
            className="mb-6 p-3 rounded"
            style={{ 
              backgroundColor: "#f0fdf4", 
              border: "1px solid #bbf7d0",
              color: "#000000"
            }}
          >
            <div className="text-sm">
              <span className="font-semibold">🔥 Fire Offer Applied:</span> {profileOrder["Dragon Offer"]}
              {dragonDiscount > 0 && (
                <span className="ml-2 font-semibold">(Discount: -₹{dragonDiscount.toFixed(2)})</span>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <div 
          className="py-4 mb-6"
          style={{ 
            borderTop: "1px solid #e5e7eb", 
            borderBottom: "1px solid #e5e7eb" 
          }}
        >
          {/* Table Header */}
          <div 
            className="grid grid-cols-12 gap-4 text-sm font-medium mb-4 pb-2"
            style={{ 
              color: "#000000",
              borderBottom: "1px solid #f3f4f6"
            }}
          >
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-center">Unit Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {/* Table Rows */}
          {orders.map((item, idx) => {
            const basePrice = getBasePrice(item);
            const isTrue = (v: any) => v === true || v === "true";
            const isCustomOrder = item["Custom Order"] || (profileOrder && profileOrder["Custom Order"]);
            const addonDetails: { label: string; price: number }[] = [];
            if (!isCustomOrder) {
              if (isTrue(item.keyChain)) addonDetails.push({ label: "Keychain", price: 10 });
              if (isTrue(item.giftWrap)) addonDetails.push({ label: "Gift Wrap", price: 10 });
              if (isTrue(item.carMirror)) addonDetails.push({ label: "Car mirror accessory", price: 50 });
            }
            const addonUnitPrice = addonDetails.reduce((sum, a) => sum + a.price, 0);
            let unitPrice = isCustomOrder ? basePrice : basePrice + addonUnitPrice;
            let total = unitPrice * Number(item.Quantity);
            if (item["Total Price"] && Math.abs(Number(item["Total Price"]) - total) < 0.01) {
              total = Number(item["Total Price"]);
              unitPrice = total / Number(item.Quantity);
            }
            return (
              <div key={idx} className="grid grid-cols-12 gap-4 text-sm py-2" style={{ color: "#000000" }}>
                <div className="col-span-6">
                  <div className="font-medium">{item.Product}</div>
                  {item.isSpecialOffer && (
                    <div className="text-xs font-medium" style={{ color: "#16a34a" }}>FREE (Fire Offer)</div>
                  )}
                  {addonDetails.length > 0 && (
                    <div className="text-xs mt-1" style={{ color: "#6b7280" }}>
                      {addonDetails.map(addon => addon.label).join(", ")}
                    </div>
                  )}
                  {item.customMessage && (
                    <div className="text-xs italic mt-1" style={{ color: "#6b7280" }}>
                      Message: {item.customMessage}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-center">{item.Quantity}</div>
                <div className="col-span-2 text-center">₹{unitPrice.toFixed(0)}</div>
                <div className="col-span-2 text-right font-medium">₹{total.toFixed(0)}</div>
              </div>
            );
          })}
        </div>

        {/* Totals Section */}
        <div className="space-y-2" style={{ color: "#000000" }}>
          <div className="flex justify-between text-sm">
            <span style={{ fontWeight: 700 }}>Subtotal</span>
            <span style={{ fontWeight: 700 }}>₹{subtotal.toFixed(0)}</span>
          </div>
          {dragonDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Fire Discount</span>
              <span>-₹{dragonDiscount.toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>₹{shippingCost.toFixed(0)}</span>
          </div>
          {/* Total and total price beside each other */}
          <div 
            className="flex justify-between items-center pt-4 mt-4"
            style={{ borderTop: "1px solid #e5e7eb" }}
          >
            <span className="text-lg font-light">Total</span>
            <span className="text-2xl font-bold" style={{ color: "#000000" }}>₹{totalPaid.toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-light">Thank you!</span>
            <span></span>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mt-8 mb-6"> {/* was mt-12 mb-8 */}
          <h2 className="text-xl font-medium mb-2" style={{ color: "#000000" }}>Order Placed Successfully!</h2>
          <p className="text-sm" style={{ color: "#000000" }}>Thank you for shopping with The Loopy Dragon!</p>
        </div>
      </div>
      {/* Buttons outside the invoiceRef so they don't appear in the PDF */}
      <div className="text-center flex flex-col sm:flex-row gap-4 justify-center mt-2"> {/* was mt-4 */}
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("cart");
              window.dispatchEvent(new Event("cart:clear"));
              window.location.href = "/";
            }
          }}
          style={{
            background: "#D7B3FB",
            color: "#000",
            border: "none",
            borderRadius: 0,
            padding: "12px 28px",
            fontWeight: 600,
            fontSize: "1rem",
            fontFamily: montserrat.style.fontFamily,
            cursor: "pointer",
            transition: "background 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          Back to Home
        </button>
        <button
          onClick={handleDownloadPDF}
          style={{
            background: "#D7B3FB",
            color: "#000",
            border: "none",
            borderRadius: 0,
            padding: "12px 28px",
            fontWeight: 600,
            fontSize: "1rem",
            fontFamily: montserrat.style.fontFamily,
            cursor: "pointer",
            transition: "background 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          Download Invoice PDF
        </button>
      </div>
    </div>
  );
}

export default function OrderSummary() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: montserrat.style.fontFamily, color: "#000" }}>
        <div className="text-lg font-medium animate-pulse">
          Loading order summary...
        </div>
      </div>
    }>
      <OrderSummaryContent />
    </Suspense>
  );
}