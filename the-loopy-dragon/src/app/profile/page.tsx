"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

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
    keyChain?: boolean;
    giftWrap?: boolean;
    carMirror?: boolean;
    customMessage?: string;
    isSpecialOffer?: boolean;
    ImageUrl1?: string; // Added ImageUrl1 for product image
  }>;
  uid?: string;
  "Dragon Offer"?: string;
  "Total Discount"?: string;
  Name?: string; // Added Name property
  Tracking_ID?: string; // Add Tracking_ID property
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState<{ [orderId: string]: boolean }>({
    });
  const [productImages, setProductImages] = useState<{ [productName: string]: string }>({});
  const [invoiceOpen, setInvoiceOpen] = useState<{ [orderId: string]: boolean }>({});
  const { addToCart, products } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) router.replace("/login");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) router.replace("/login");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    async function fetchOrdersAndImages() {
      setLoading(true);
      const { data: profileRows, error: profileError } = await supabase
        .from("Your Profile")
        .select("*, Tracking_ID") // Fetch Tracking_ID
        .eq('uid', user.id)
        .order("Order Date", { ascending: false });

      if (profileError) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Collect all product names from previous orders (non custom)
      const allProductNames = Array.from(
        new Set(
          (profileRows ?? [])
            .filter((order: ProfileOrder) => !order.Status?.includes("Pending Payment"))
            .flatMap((order: ProfileOrder) => order.Products?.map((p: any) => p.Product) ?? [])
        )
      );

      // Fetch images for these products from Inventory
      let imagesMap: { [productName: string]: string } = {};
      if (allProductNames.length > 0) {
        const { data: inventoryRows } = await supabase
          .from("Inventory")
          .select("Product, ImageUrl1")
          .in("Product", allProductNames);

        if (Array.isArray(inventoryRows)) {
          for (const row of inventoryRows) {
            if (row.Product && row.ImageUrl1) {
              imagesMap[row.Product] = row.ImageUrl1;
            }
          }
        }
      }
      setProductImages(imagesMap);

      const pendingCount = (profileRows || []).filter(
        (order: ProfileOrder) => order.Status?.includes("Pending Payment")
      ).length;
      if (typeof window !== "undefined") {
        localStorage.setItem("pendingPaymentCount", String(pendingCount));
      }
      setOrders(profileRows || []);
      setLoading(false);
    }
    fetchOrdersAndImages();
  }, [user]);

  const handleRepeatOrder = async (order: ProfileOrder) => {
    if (!order.Products || order.Products.length === 0) return;
    
    // Add all items from the order to cart
    for (const item of order.Products) {
      // Find the product in inventory
      const inventoryProduct = products.find(p => p.Product === item.Product);
      if (inventoryProduct) {
        // Prepare addons
        const addons = {
          keyChain: item.keyChain || false,
          giftWrap: item.giftWrap || false,
          carMirror: item.carMirror || false,
          customMessage: item.customMessage || ''
        };
        
        // Add to cart with quantity and addons
        addToCart(inventoryProduct.id, addons, item.Quantity);
      }
    }
    
    // Redirect to cart page
    router.push('/cart');
  };

  const pendingOrders = orders.filter(order => order.Status?.includes("Pending Payment"));
  const showCustomOrders = loading || pendingOrders.length > 0;

  if (!user) return null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F5F9FF",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Montserrat, sans-serif",
          overflowX: "hidden",
        }}
      >
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        <div style={{ height: 'calc(2.5rem + 4.5rem)' }}></div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 48,
              height: 48,
              margin: "0 auto 1.5rem",
              border: "4px solid #EFDFFF",
              borderTopColor: "#22223B",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: 16, color: "#6B7280", fontWeight: 500 }}>Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F9FF",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Montserrat, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Fixed Navbar + Marquee (handled inside Navbar) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      {/* Spacer for fixed navbar + marquee (marquee is 2.5rem, navbar is ~4.5rem) */}
      <div style={{ height: 'calc(2.5rem + 4.5rem)' }}></div>

      {/* Header Section */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: isMobile ? "1.5rem 1rem 1rem" : "3rem 1.5rem 1.5rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? "1rem" : "2rem", position: "relative" }}>
          <style jsx>{`
            .profile-header {
              font-family: Montserrat, sans-serif;
              font-size: 40px;
              font-weight: 700;
              color: #22223B;
              margin-bottom: 1rem;
              letter-spacing: 0.05em;
              text-transform: none;
              line-height: 1.1;
              display: inline-block;
              position: relative;
              z-index: 2;
            }
            @media (max-width: 767px) {
              .profile-header {
                font-size: 28px !important;
                letter-spacing: 0.08em !important;
                line-height: 1.1 !important;
                font-weight: 700 !important;
                text-transform: none !important;
                margin-bottom: 0.5rem !important;
              }
            }
            @media (max-width: 480px) {
              .profile-header {
                font-size: 26px !important;
                letter-spacing: 0.1em !important;
              }
            }
          `}</style>
          <h2 className="profile-header">
            <span style={{ position: "relative", display: "inline-block" }}>
              <span
                style={{
                  position: "absolute",
                  left: isMobile ? "-6px" : "-14px",
                  top: isMobile ? "4px" : "10px",
                  width: isMobile ? "28px" : "48px",
                  height: isMobile ? "28px" : "48px",
                  background: "#EFDFFF",
                  borderRadius: "50%",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />
              <span style={{ position: "relative", zIndex: 2 }}>Y</span>
            </span>
            <span style={{ position: "relative", zIndex: 2 }}>our Orders</span>
          </h2>
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: isMobile ? "16px" : "20px",
              fontWeight: 400,
              color: "#22223B",
              maxWidth: "100%",
              margin: "0 auto",
              lineHeight: "1.2",
            }}
          >
            Handmade treasures that you've claimed
          </p>
        </div>
      </section>

      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: isMobile ? "0 1rem 2rem" : "0 1.5rem 5rem",
          flex: 1,
          width: "100%",
        }}
      >
        <div>
          <div style={{ display: showCustomOrders ? "" : "none" }}>
          <h2
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: 700,
              color: "#22223B",
              marginBottom: isMobile ? "1rem" : "1.5rem",
            }}
          >
            Custom Orders (Payment pending)
          </h2>
          {orders.filter(order => order.Status?.includes("Pending Payment")).length === 0 ? (
                <div
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "16px",
                    color: "#6B7280",
                    textAlign: "center",
                    padding: "2rem 0",
                  }}
                >
                  No custom orders pending payment.
                </div>
              ) : (
                orders.filter(order => order.Status?.includes("Pending Payment")).map((order: ProfileOrder) => (
                  <div
                    key={order.order_id}
                    style={{
                      background: "transparent",
                      borderRadius: "0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      border: "1px solid #E5E7EB",
                      padding: isMobile ? "1rem" : "1.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {/* Custom mobile layout for product rows */}
                    <div style={{ marginBottom: "0.5rem" }}>
                      {isMobile ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {order.Products?.map((item: any, idx: number) => {
                            const addonUnitPrice =
                              (item.keyChain ? 10 : 0) +
                              (item.giftWrap ? 10 : 0) +
                              (item.carMirror ? 50 : 0);
                            const unitPrice = (Number(item.Price) || 0) + addonUnitPrice;
                            const subtotal = unitPrice * Number(item.Quantity);
                            return (
                              <div
                                key={idx}
                                style={{
                                  borderBottom: order.Products && idx < (order.Products.length - 1) ? "1px solid #E5E7EB" : undefined,
                                  paddingBottom: "1rem",
                                  marginBottom: order.Products && idx < (order.Products.length - 1) ? "1rem" : undefined,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.5rem",
                                }}
                              >
                                <div style={{ fontWeight: 700, fontSize: "15px", color: "#22223B" }}>{item.Product}</div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "14px", color: "#22223B" }}>Qty: {item.Quantity}</span>
                                  <span style={{ fontSize: "14px", color: "#22223B", fontWeight: 700 }}>₹{subtotal.toFixed(2)}</span>
                                </div>
                                {idx === 0 && (
                                  <div style={{ marginTop: "0.5rem" }}>
                                    <Link
                                      href={`/checkout?custom_order=${order.order_id}`}
                                      style={{
                                        display: "inline-block",
                                        background: "#D8B6FA",
                                        color: "#22223B",
                                        padding: "12px 24px",
                                        borderRadius: "0",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        fontFamily: "Montserrat, sans-serif",
                                        textDecoration: "none",
                                        transition: "background 0.2s",
                                        marginLeft: "auto",
                                        whiteSpace: "nowrap",
                                      }}
                                      className="hover:bg-purple-100"
                                    >
                                      Checkout
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: "14px",
                            background: "transparent",
                          }}>
                            <thead>
                              <tr style={{ background: "#F5F9FF" }}>
                                <th style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "left", color: "#6B7280", fontWeight: 700, fontSize: isMobile ? "12px" : "14px" }}>Product</th>
                                <th style={{ padding: isMobile ? "8px 4px" : "10px", textAlign: "center", color: "#6B7280", fontWeight: 700, fontSize: isMobile ? "12px" : "14px" }}>Qty</th>
                                <th style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#6B7280", fontWeight: 700, paddingRight: isMobile ? "20px" : "30px", fontSize: isMobile ? "12px" : "14px" }}>Total</th>
                                <th style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#6B7280", fontWeight: 700, fontSize: isMobile ? "12px" : "14px" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.Products?.map((item: any, idx: number) => {
                                const addonUnitPrice =
                                  (item.keyChain ? 10 : 0) +
                                  (item.giftWrap ? 10 : 0) +
                                  (item.carMirror ? 50 : 0);
                                const unitPrice = (Number(item.Price) || 0) + addonUnitPrice;
                                const subtotal = unitPrice * Number(item.Quantity);
                                return (
                                  <tr key={idx} style={{ borderBottom: "1px solid #E5E7EB" }}>
                                    <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "left", color: "#22223B", fontSize: isMobile ? "14px" : "16px" }}>
                                      {isMobile ? (
                                        <div style={{ wordBreak: "break-word", lineHeight: "1.2" }}>
                                          {item.Product}
                                        </div>
                                      ) : (
                                        item.Product
                                      )}
                                    </td>
                                    <td style={{ padding: isMobile ? "8px 4px" : "10px", textAlign: "center", color: "#22223B", fontSize: isMobile ? "14px" : "16px" }}>
                                      {item.Quantity}
                                    </td>
                                    <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#22223B", fontWeight: 700, fontSize: isMobile ? "14px" : "16px" }}>
                                      ₹{subtotal.toFixed(2)}
                                    </td>
                                    <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right" }}>
                                      {idx === 0 && (
                                        <Link
                                          href={`/checkout?custom_order=${order.order_id}`}
                                          style={{
                                            display: "inline-block",
                                            background: "#D8B6FA",
                                            color: "#22223B",
                                            padding: isMobile ? "12px 24px" : "15px 52px",
                                            borderRadius: "0",
                                            fontSize: isMobile ? "12px" : "13px",
                                            fontWeight: 700,
                                            fontFamily: "Montserrat, sans-serif",
                                            textDecoration: "none",
                                            transition: "background 0.2s",
                                            marginLeft: "auto",
                                            whiteSpace: "nowrap",
                                          }}
                                          className="hover:bg-purple-100"
                                        >
                                          Checkout
                                        </Link>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    {/* "View details" link below the table, left aligned */}
                    <div style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginBottom: "0.5rem"
                    }}>
                      <span
                        style={{
                          color: "#22223B",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontSize: isMobile ? "13px" : "14px",
                          fontWeight: 600,
                          fontFamily: "Montserrat, sans-serif",
                        }}
                        onClick={() =>
                          setBreakdownOpen(prev => ({
                            ...prev,
                            [order.order_id]: !prev[order.order_id],
                          }))
                        }
                      >
                        {breakdownOpen[order.order_id] ? "Hide details" : "View details"}
                      </span>
                    </div>
                    {/* Breakdown Section - Remains the same */}
                    {breakdownOpen[order.order_id] && (
                      <div>
                        <div style={{ marginTop: "0.5rem" }}>
                          <h4
                            style={{
                              fontWeight: 600,
                              marginBottom: "0.5rem",
                              color: "#22223B",
                              fontSize: isMobile ? "15px" : "16px",
                              fontFamily: "Montserrat, sans-serif",
                            }}
                          >
                            Order Summary
                          </h4>
                          <div style={{ overflowX: "auto" }}>
                            {isMobile ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {order.Products?.map((item: any, idx: number) => {
                                  const addonUnitPrice =
                                    (item.keyChain ? 10 : 0) +
                                    (item.giftWrap ? 10 : 0) +
                                    (item.carMirror ? 50 : 0);
                                  const unitPrice = (Number(item.Price) || 0) + addonUnitPrice;
                                  const subtotal = unitPrice * Number(item.Quantity);

                                  return (
                                    <div
                                      key={idx}
                                      style={{
                                        border: "1px solid #E5E7EB",
                                        borderRadius: "0px",
                                        padding: "1rem",
                                        background: "transparent",
                                      }}
                                    >
                                      <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                            <span style={{ fontWeight: 600, color: "#22223B" }}>{item.Product}</span>
                                            {item.isSpecialOffer && (
                                              <span
                                                style={{
                                                  fontSize: "10px",
                                                  background: "#059669",
                                                  color: "#fff",
                                                  padding: "2px 6px",
                                                  borderRadius: "4px",
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                FREE
                                              </span>
                                            )}
                                          </div>
                                          <div style={{ fontSize: "12px", color: "#6B7280" }}>
                                            ₹{Number(item.Price).toFixed(2)}
                                            {addonUnitPrice > 0 && (
                                              <span style={{ marginLeft: "0.5rem", color: "#8B5CF6" }}>
                                                + Addons ₹{addonUnitPrice}
                                              </span>
                                            )}
                                            {(item.keyChain || item.giftWrap || item.carMirror || item.customMessage) && (
                                              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "0.5rem" }}>
                                                {item.keyChain && <div>+ Keychain (+₹10)</div>}
                                                {item.giftWrap && <div>+ Gift Wrap (+₹10)</div>}
                                                {item.carMirror && <div>+ Car mirror (+₹50)</div>}
                                                {item.customMessage && (
                                                  <div style={{ marginTop: "0.25rem" }}>
                                                    <div style={{ fontStyle: "italic" }}>Message:</div>
                                                    <div>{item.customMessage}</div>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                          <div style={{ fontSize: "14px", color: "#22223B" }}>
                                            Qty: {item.Quantity}
                                          </div>
                                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#22223B", marginTop: "0.25rem" }}>
                                            ₹{subtotal.toFixed(2)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Summary rows */}
                                <div style={{ border: "1px solid #E5E7EB", borderRadius: "0px", padding: "1rem", background: "transparent" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ fontWeight: 600, color: "#22223B" }}>Subtotal</span>
                                    <span style={{ fontWeight: 600, color: "#22223B" }}>
                                      ₹{(order.Products ?? []).reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0).toFixed(2)}
                                    </span>
                                  </div>

                                  {order["Total Discount"] && Number(order["Total Discount"]) > 0 && (
                                    <>
                                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                        <div>
                                          <span style={{ fontWeight: 600, color: "#059669" }}>Fire Discount</span>
                                          {order["Dragon Offer"]?.includes('Buy 3 Get 1 Free') && (
                                            <div style={{ fontSize: "10px", color: "#6B7280" }}>
                                              (Cheapest items made free)
                                            </div>
                                          )}
                                        </div>
                                        <span style={{ fontWeight: 600, color: "#059669" }}>
                                          -₹{Number(order["Total Discount"]).toFixed(2)}
                                        </span>
                                      </div>

                                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                        <span style={{ fontWeight: 600, color: "#22223B" }}>Subtotal after discount</span>
                                        <span style={{ fontWeight: 600, color: "#22223B" }}>
                                          ₹{(((order.Products ?? []).reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0) - Number(order["Total Discount"]))).toFixed(2)}
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ fontWeight: 600, color: "#22223B" }}>Shipping</span>
                                    <span style={{ fontWeight: 600, color: "#22223B" }}>
                                      ₹{Number(order.Products?.[0]?.["Shipping Cost"] ?? 0).toFixed(2)}
                                    </span>
                                  </div>

                                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #E5E7EB" }}>
                                    <span style={{ fontWeight: 700, color: "#22223B" }}>Total Paid</span>
                                    <span style={{ fontWeight: 700, color: "#22223B" }}>
                                      ₹{(() => {
                                        const subtotal = (order.Products ?? []).reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0);
                                        const discount = Number(order["Total Discount"] || 0);
                                        const shipping = Number(order.Products?.[0]?.["Shipping Cost"] ?? 0);
                                        const finalTotal = (subtotal - discount) + shipping;
                                        return finalTotal.toFixed(2);
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: "14px",
                                  background: "transparent",
                                }}
                              >
                                <thead>
                                  <tr style={{ background: "#F5F9FF" }}>
                                    <th style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "left", color: "#6B7280", fontWeight: 700 }}>Product</th>
                                    <th style={{ padding: isMobile ? "8px 4px" : "10px", textAlign: "center", color: "#6B7280", fontWeight: 700 }}>Qty</th>
                                    <th style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#6B7280", fontWeight: 700 }}>Unit Price</th>
                                    <th style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#6B7280", fontWeight: 700 }}>Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.Products?.map((item: any, idx: number) => {
                                    const addonUnitPrice =
                                      (item.keyChain ? 10 : 0) +
                                      (item.giftWrap ? 10 : 0) +
                                      (item.carMirror ? 50 : 0);
                                    const unitPrice = (Number(item.Price) || 0) + addonUnitPrice;
                                    const subtotal = unitPrice * Number(item.Quantity);
                                    return (
                                      <tr key={idx} style={{ borderBottom: "1px solid #E5E7EB" }}>
                                        <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "left", color: "#22223B" }}>
                                          <div style={{ display: "flex", gap: "0.5rem", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}>
                                            {productImages[item.Product] && (
                                              <img
                                                src={productImages[item.Product]}
                                                alt={item.Product}
                                                style={{
                                                  width: isMobile ? "50px" : "66px",
                                                  height: isMobile ? "50px" : "66px",
                                                  objectFit: "cover",
                                                  borderRadius: "0px",
                                                  border: "1px solid #E5E7EB",
                                                  background: "#fff",
                                                }}
                                              />
                                            )}
                                            <div style={{ width: "100%" }}>
                                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                                <span style={{ wordBreak: "break-word", lineHeight: "1.2" }}>{item.Product}</span>
                                                {item.isSpecialOffer && (
                                                  <span
                                                    style={{
                                                      fontSize: isMobile ? "10px" : "12px",
                                                      background: "#059669",
                                                      color: "#fff",
                                                      padding: "2px 6px",
                                                      borderRadius: "4px",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    FREE
                                                  </span>
                                                )}
                                              </div>
                                              {addonUnitPrice > 0 && (
                                                <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#6B7280" }}>
                                                  <span style={{ marginLeft: "0.5rem", color: "#8B5CF6" }}>
                                                    + Addons ₹{addonUnitPrice}
                                                  </span>
                                                </div>
                                              )}
                                              {(item.keyChain || item.giftWrap || item.carMirror || item.customMessage) && (
                                                <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#6B7280" }}>
                                                  {item.keyChain && <span style={{ marginRight: "0.5rem" }}>+ Keychain (+₹10)</span>}
                                                  {item.giftWrap && <span style={{ marginRight: "0.5rem" }}>+ Gift Wrap (+₹10)</span>}
                                                  {item.carMirror && <span style={{ marginRight: "0.5rem" }}>+ Car mirror (+₹50)</span>}
                                                  {item.customMessage && (
                                                    <div style={{ wordBreak: "break-word" }}>
                                                      <span style={{ fontStyle: "italic" }}>Message:</span> {item.customMessage}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td style={{ padding: isMobile ? "8px 4px" : "10px", textAlign: "center", color: "#22223B" }}>
                                          {item.Quantity}
                                        </td>
                                        <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#22223B" }}>
                                          ₹{unitPrice.toFixed(2)}
                                        </td>
                                        <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#22223B", fontWeight: 700 }}>
                                          ₹{subtotal.toFixed(2)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
          </div>

          {/* Previous Orders Section */}
          <h2
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: 700,
              color: "#22223B",
              margin: isMobile ? "2rem 0 1rem" : "2.5rem 0 1.5rem",
            }}
          >
            Previous Orders
          </h2>
          {orders.filter(order => !order.Status?.includes("Pending Payment")).length === 0 ? (
                <div
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "16px",
                    color: "#6B7280",
                    textAlign: "center",
                    padding: "2rem 0",
                  }}
                >
                  No previous orders found.
                </div>
              ) : (
                orders
                  .filter(order => !order.Status?.includes("Pending Payment"))
                  .map((order: ProfileOrder) => {
                    // Check if this order is a custom order (was previously pending payment)
                    const isCustomOrder = order.Status?.toLowerCase().includes("custom order");
                    return (
                    <div
                      key={order.order_id}
                      style={{
                        background: "transparent",
                        borderRadius: "0",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        border: "1px solid #E5E7EB",
                        padding: isMobile ? "1rem" : "1.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                          justifyContent: "space-between",
                          gap: isMobile ? "0.75rem" : "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#22223B",
                            fontSize: isMobile ? "13px" : "16px",
                            fontFamily: "Montserrat, sans-serif",
                          }}
                        >
                          Order ID: <span style={{ wordBreak: "break-all", color: "#22223B", fontSize: isMobile ? "12px" : "16px" }}>{order.order_id}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isMobile ? "flex-start" : "flex-end",
                            justifyContent: "flex-end",
                            minWidth: isMobile ? undefined : "180px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: isMobile ? "11px" : "14px",
                              color: "#6B7280",
                              fontFamily: "Montserrat, sans-serif",
                              textAlign: isMobile ? "left" : "right",
                            }}
                          >
                            {order["Order Date"] ? new Date(order["Order Date"]).toLocaleString() : "N/A"}
                          </div>
                          {/* Tracking ID display below date */}
                          {order.Tracking_ID && (
                            <div
                              style={{
                                fontSize: isMobile ? "11px" : "14px",
                                color: "#059669",
                                fontFamily: "Montserrat, sans-serif",
                                marginTop: "0.25rem",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <a
                                href={order.Tracking_ID.startsWith("http") ? order.Tracking_ID : `https://www.ship24.com/tracking/${order.Tracking_ID}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#7C3AED",
                                  textDecoration: "underline",
                                  fontWeight: 600,
                                }}
                              >
                                Track Here
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div
                        style={{
                          fontSize: isMobile ? "12px" : "15px",
                          color: "#22223B",
                          fontFamily: "Montserrat, sans-serif",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <b>Status:</b>{" "}
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            color: "#22223B",
                            fontWeight: 400,
                          }}
                        >
                          {order.Status?.toLowerCase() === "rejected"
                            ? "Rejected: This order has been cancelled. A refund will be processed within 2 business days."
                            : order.Status || "Order Placed: Will be dispatched within 2 days of order date"}
                        </span>
                      </div>

                      {/* Compact Product Display */}
                      {Array.isArray(order.Products) && order.Products.length > 0 && (
                        <div style={{ marginTop: "1rem" }}>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.5rem",
                              marginBottom: "1rem",
                              alignItems: "center",
                            }}
                          >
                            {/* First product details */}
                            {(() => {
                              const firstNonFreeIdx = order.Products.findIndex(p => !p.isSpecialOffer);
                              if (firstNonFreeIdx === -1) return null;
                              const firstProduct = order.Products[firstNonFreeIdx];
                              // Only truncate on mobile
                              const truncatedName = isMobile && firstProduct.Product.length > 20
                                ? `${firstProduct.Product.slice(0, 20)}...`
                                : firstProduct.Product;

                              return (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: isMobile ? "flex-start" : "center",
                                    gap: isMobile ? "0.75rem" : "0.5rem",
                                    padding: isMobile ? "0.75rem 0" : "0.5rem 0.75rem",
                                    fontSize: isMobile ? "13px" : "14px",
                                    fontFamily: "Montserrat, sans-serif",
                                    position: "relative",
                                    width: "100%",
                                    justifyContent: "space-between",
                                    flexDirection: isMobile ? "row" : "row",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "0.5rem", width: isMobile ? "auto" : "auto", flex: 1 }}>
                                    {productImages[firstProduct.Product] && (
                                      <img
                                        src={productImages[firstProduct.Product]}
                                        alt={firstProduct.Product}
                                        style={{
                                          width: isMobile ? "60px" : "76px",
                                          height: isMobile ? "60px" : "76px",
                                          objectFit: "cover",
                                          borderRadius: "0px",
                                          border: "1px solid #E5E7EB",
                                          background: "#fff",
                                          marginRight: isMobile ? "0" : "46px",
                                        }}
                                      />
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                      <span style={{ color: "#22223B", fontWeight: 400, fontSize: isMobile ? "14px" : "16px", wordBreak: "break-word", lineHeight: "1.2" }}>
                                        {truncatedName}
                                        {/* Only show + X more items when dropdown is NOT open */}
                                        {order.Products.filter(p => !p.isSpecialOffer).length > 1 && !breakdownOpen['products_' + order.order_id] && (
                                          <span
                                            style={{
                                              textDecoration: "underline",
                                              color: "#BD7CFE",
                                              cursor: "pointer",
                                              fontWeight: 500,
                                              fontFamily: "Montserrat, sans-serif",
                                              fontSize: isMobile ? "13px" : "15px",
                                              marginLeft: "0.5rem",
                                            }}
                                            onClick={() =>
                                              setBreakdownOpen(prev => ({
                                                ...prev,
                                                ['products_' + order.order_id]: !prev['products_' + order.order_id],
                                              }))
                                            }
                                          >
                                            + {order.Products.filter(p => !p.isSpecialOffer).length - 1} more item
                                            {order.Products.filter(p => !p.isSpecialOffer).length > 2 ? 's' : ''}
                                          </span>
                                        )}
                                      </span>
                                      {(firstProduct.keyChain || firstProduct.giftWrap || firstProduct.carMirror || firstProduct.customMessage) && (
                                        <span style={{ fontSize: isMobile ? "11px" : "12px", color: "#6B7280", marginTop: "2px" }}>
                                          {firstProduct.keyChain && <span style={{ marginRight: "0.5rem" }}>+ Keychain (+₹10)</span>}
                                          {firstProduct.giftWrap && <span style={{ marginRight: "0.5rem" }}>+ Gift Wrap (+₹10)</span>}
                                          {firstProduct.carMirror && <span style={{ marginRight: "0.5rem" }}>+ Car mirror (+₹50)</span>}
                                          {firstProduct.customMessage && (
                                            <span style={{ display: "block", wordBreak: "break-word" }}>
                                              <span style={{ fontStyle: "italic" }}>Message:</span> {firstProduct.customMessage}
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ 
                                    display: "flex", 
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    marginLeft: isMobile ? "0.5rem" : "0"
                                  }}>
                                    {/* Show Repeat Order button when dropdown is NOT open */}
                                    {!breakdownOpen['products_' + order.order_id] && !isCustomOrder && (
                                      <button
                                        onClick={() => handleRepeatOrder(order)}
                                        style={{
                                          display: "inline-block",
                                          background: "#D8B6FA",
                                          color: "#22223B",
                                          padding: isMobile ? "12px 24px" : "15px 38px",
                                          borderRadius: "0",
                                          fontSize: isMobile ? "12px" : "13px",
                                          fontWeight: 800,
                                          fontFamily: "Montserrat, sans-serif",
                                          border: "none",
                                          cursor: "pointer",
                                          textDecoration: "none",
                                          transition: "background 0.2s",
                                          whiteSpace: "nowrap",
                                        }}
                                        className="hover:bg-purple-100"
                                      >
                                        Repeat Order
                                      </button>
                                    )}
                                    {/* Buy Again button for first product when dropdown is open */}
                                    {breakdownOpen['products_' + order.order_id] && (
                                      <Link
                                        href={`/product/${encodeURIComponent(firstProduct.Product)}`}
                                        style={{
                                          display: "inline-block",
                                          background: "#D8B6FA",
                                          color: "#22223B",
                                          padding: isMobile ? "8px 16px" : "15px 52px",
                                          borderRadius: "0",
                                          fontSize: isMobile ? "11px" : "13px",
                                          fontWeight: 700,
                                          fontFamily: "Montserrat, sans-serif",
                                          textDecoration: "none",
                                          transition: "background 0.2s",
                                          whiteSpace: "nowrap",
                                        }}
                                        className="hover:bg-purple-100"
                                      >
                                        Buy Again
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                            {/* List remaining products below (not repeating the first one), only non-free */}
                            {breakdownOpen['products_' + order.order_id] && order.Products.filter(p => !p.isSpecialOffer).length > 1 && (
                              <div style={{ width: "100%" }}>
                                {order.Products &&
                                  order.Products
                                    .filter((item, idx) => {
                                      if (!item.isSpecialOffer && order.Products) {
                                        return idx !== order.Products.findIndex(p => !p.isSpecialOffer);
                                      }
                                      return !item.isSpecialOffer;
                                    })
                                    .map((item: any, idx: number, arr) => (
                                  <div key={idx}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: isMobile ? "flex-start" : "center",
                                        gap: isMobile ? "0.75rem" : "0.5rem",
                                        padding: isMobile ? "0.75rem 0" : "0.5rem 0.75rem",
                                        fontSize: isMobile ? "13px" : "14px",
                                        fontFamily: "Montserrat, sans-serif",
                                        position: "relative",
                                        width: "100%",
                                        justifyContent: "space-between",
                                        flexDirection: isMobile ? "row" : "row",
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "0.5rem", width: isMobile ? "auto" : "auto", flex: 1 }}>
                                        {productImages[item.Product] && (
                                          <img
                                            src={productImages[item.Product]}
                                            alt={item.Product}
                                            style={{
                                              width: isMobile ? "60px" : "76px",
                                              height: isMobile ? "60px" : "76px",
                                              objectFit: "cover",
                                              borderRadius: "0px",
                                              border: "1px solid #E5E7EB",
                                              background: "#fff",
                                              marginRight: isMobile ? "0" : "46px",
                                            }}
                                          />
                                        )}
                                        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                          <span style={{ color: "#22223B", fontWeight: 400, fontSize: isMobile ? "14px" : "16px", wordBreak: "break-word", lineHeight: "1.2" }}>
                                            {item.Product}
                                          </span>
                                          {(item.keyChain || item.giftWrap || item.carMirror || item.customMessage) && (
                                            <span style={{ fontSize: isMobile ? "11px" : "12px", color: "#6B7280", marginTop: "2px" }}>
                                              {item.keyChain && <span style={{ marginRight: "0.5rem" }}>+ Keychain (+₹10)</span>}
                                              {item.giftWrap && <span style={{ marginRight: "0.5rem" }}>+ Gift Wrap (+₹10)</span>}
                                              {item.carMirror && <span style={{ marginRight: "0.5rem" }}>+ Car mirror (+₹50)</span>}
                                              {item.customMessage && (
                                                <span style={{ display: "block", wordBreak: "break-word" }}>
                                                  <span style={{ fontStyle: "italic" }}>Message:</span> {item.customMessage}
                                                </span>
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div style={{ 
                                        display: "flex", 
                                        justifyContent: "flex-end",
                                        alignItems: "center",
                                        marginLeft: isMobile ? "0.5rem" : "0"
                                      }}>
                                        <Link
                                          href={`/product/${encodeURIComponent(item.Product)}`}
                                          style={{
                                            display: "inline-block",
                                            background: "#D8B6FA",
                                            color: "#22223B",
                                            padding: isMobile ? "8px 16px" : "15px 52px",
                                            borderRadius: "0",
                                            fontSize: isMobile ? "11px" : "13px",
                                            fontWeight: 700,
                                            fontFamily: "Montserrat, sans-serif",
                                            textDecoration: "none",
                                            transition: "background 0.2s",
                                            whiteSpace: "nowrap",
                                          }}
                                          className="hover:bg-purple-100"
                                        >
                                          Buy Again
                                        </Link>
                                      </div>
                                    </div>
                                    {idx < arr.length - 1 && (
                                      <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "0.5rem 0" }} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Invoice Toggle Line */}
                          <div
                            style={{
                              borderTop: "1px solid #E5E7EB",
                              paddingTop: "1rem",
                              display: "flex",
                              flexDirection: isMobile ? "column" : "row",
                              justifyContent: "space-between",
                              alignItems: isMobile ? "flex-start" : "center",
                              gap: isMobile ? "0.75rem" : "1rem",
                            }}
                          >
                            <span
                              style={{
                                color: "#22223B",
                                textDecoration: "underline",
                                cursor: "pointer",
                                fontSize: isMobile ? "13px" : "14px",
                                fontWeight: 600,
                                fontFamily: "Montserrat, sans-serif",
                              }}
                              onClick={() =>
                                setInvoiceOpen(prev => ({
                                  ...prev,
                                  [order.order_id]: !prev[order.order_id],
                                }))
                              }
                            >
                              {invoiceOpen[order.order_id] ? "Hide Invoice" : "View Invoice"}
                            </span>
                            <span
                              style={{
                                fontSize: isMobile ? "15px" : "16px",
                                fontWeight: 700,
                                color: "#22223B",
                                fontFamily: "Montserrat, sans-serif",
                              }}
                            >
                              Total: ₹{(() => {
                                const subtotal = order.Products.reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0);
                                const discount = Number(order["Total Discount"] || 0);
                                const shipping = Number(order.Products[0]?.["Shipping Cost"] || 0);
                                const finalTotal = (subtotal - discount) + shipping;
                                return finalTotal.toFixed(2);
                              })()}
                            </span>
                          </div>
                          {/* Collapsible Invoice */}
                          {invoiceOpen[order.order_id] && (
                            <div style={{ marginTop: "1rem" }}>
                              <div style={{ overflowX: "auto" }}>
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontFamily: "Montserrat, sans-serif",
                                    fontSize: isMobile ? "12px" : "14px",
                                    background: "transparent",
                                  }}
                                >
                                  <thead>
                                    <tr style={{ background: "#F5F9FF" }}>
                                      <th style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "left", color: "#6B7280", fontWeight: 700 }}>Product</th>
                                      <th style={{ padding: isMobile ? "8px 4px" : "10px", textAlign: "center", color: "#6B7280", fontWeight: 700 }}>Qty</th>
                                      <th style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#6B7280", fontWeight: 700 }}>Unit Price</th>
                                      <th style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#6B7280", fontWeight: 700 }}>Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.Products.map((item: any, idx: number) => {
                                      const addonUnitPrice =
                                        (item.keyChain ? 10 : 0) +
                                        (item.giftWrap ? 10 : 0) +
                                        (item.carMirror ? 50 : 0);
                                      const unitPrice = (Number(item.Price) || 0) + addonUnitPrice;
                                      const subtotal = unitPrice * Number(item.Quantity);
                                      return (
                                        <tr key={idx} style={{ borderBottom: "1px solid #E5E7EB" }}>
                                          <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "left", color: "#22223B" }}>
                                            <div style={{ display: "flex", gap: "0.5rem", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}>
                                              {/* Removed product image from invoice */}
                                              <div style={{ width: "100%" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                                  <span style={{ wordBreak: "break-word", lineHeight: "1.2" }}>{item.Product}</span>
                                                  {item.isSpecialOffer && (
                                                    <span
                                                      style={{
                                                        fontSize: isMobile ? "10px" : "12px",
                                                        background: "#059669",
                                                        color: "#fff",
                                                        padding: "2px 6px",
                                                        borderRadius: "4px",
                                                        fontWeight: "bold",
                                                      }}
                                                    >
                                                      FREE
                                                    </span>
                                                  )}
                                                </div>
                                                {addonUnitPrice > 0 && (
                                                  <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#6B7280" }}>
                                                    <span style={{ marginLeft: "0.5rem", color: "#8B5CF6" }}>
                                                      + Addons ₹{addonUnitPrice}
                                                    </span>
                                                  </div>
                                                )}
                                                {(item.keyChain || item.giftWrap || item.carMirror || item.customMessage) && (
                                                  <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#6B7280" }}>
                                                    {item.keyChain && <span style={{ marginRight: "0.5rem" }}>+ Keychain (+₹10)</span>}
                                                    {item.giftWrap && <span style={{ marginRight: "0.5rem" }}>+ Gift Wrap (+₹10)</span>}
                                                    {item.carMirror && <span style={{ marginRight: "0.5rem" }}>+ Car mirror (+₹50)</span>}
                                                    {item.customMessage && (
                                                      <div style={{ wordBreak: "break-word" }}>
                                                        <span style={{ fontStyle: "italic" }}>Message:</span> {item.customMessage}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </td>
                                          <td style={{ padding: isMobile ? "8px 4px" : "10px", textAlign: "center", color: "#22223B" }}>
                                            {item.Quantity}
                                          </td>
                                          <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#22223B" }}>
                                            ₹{unitPrice.toFixed(2)}
                                          </td>
                                          <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", color: "#22223B", fontWeight: 700 }}>
                                            ₹{subtotal.toFixed(2)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    <tr>
                                      <td colSpan={3} style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 600, color: "#22223B" }}>Subtotal</td>
                                      <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 600, color: "#22223B" }}>
                                        ₹{order.Products.reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0).toFixed(2)}
                                      </td>
                                    </tr>
                                    {/* Dragon Discount Row */}
                                    {order["Total Discount"] && Number(order["Total Discount"]) > 0 ? (
                                      <tr>
                                        <td colSpan={3} style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 600, color: "#059669" }}>
                                          Fire Discount
                                          {order["Dragon Offer"]?.includes('Buy 3 Get 1 Free') && (
                                            <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#6B7280" }}>
                                              (Cheapest items made free)
                                            </div>
                                          )}
                                        </td>
                                        <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 600, color: "#059669" }}>
                                          -₹{Number(order["Total Discount"]).toFixed(2)}
                                        </td>
                                      </tr>
                                    ) : null}
                                    {/* Show subtotal after discount if there was a discount */}
                                    {order["Total Discount"] && Number(order["Total Discount"]) > 0 ? (
                                      <tr>
                                        <td colSpan={3} style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 600, color: "#22223B" }}>Subtotal after discount</td>
                                        <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 600, color: "#22223B" }}>
                                          ₹{(((order.Products ?? []).reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0) - Number(order["Total Discount"]))).toFixed(2)}
                                        </td>
                                      </tr>
                                    ) : null}
                                    <tr>
                                      <td colSpan={3} style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 600, color: "#22223B" }}>Shipping</td>
                                      <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 600, color: "#22223B" }}>
                                        ₹{Number(order.Products?.[0]?.["Shipping Cost"] ?? 0).toFixed(2)}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colSpan={3} style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 700, color: "#22223B" }}>Total Paid</td>
                                      <td style={{ padding: isMobile ? "8px 6px" : "10px", textAlign: "right", fontWeight: 700, color: "#22223B" }}>
                                        ₹{(() => {
                                          const subtotal = order.Products.reduce((sum: number, item: any) => sum + (Number(item["Total Price"]) || 0), 0);
                                          const discount = Number(order["Total Discount"] || 0);
                                          const shipping = Number(order.Products?.[0]?.["Shipping Cost"] ?? 0);
                                          const finalTotal = (subtotal - discount) + shipping;
                                          return finalTotal.toFixed(2);
                                        })()}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
        </div>
      </main>
      <Footer />
    </div>
  );
}