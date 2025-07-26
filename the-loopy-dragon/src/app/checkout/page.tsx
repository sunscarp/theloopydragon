"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/utils/supabase";
import { useCart } from "@/contexts/CartContext";
import OrderSummary from "@/components/OrderSummary";
import { SPECIAL_OFFER_PRODUCTS } from "@/utils/dragonOffers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CartItem {
  cartKey: string;
  Product: string;
  quantity: number;
  Price: number;
  addons: any;
  addonUnitPrice: number;
  totalPrice: number;
  isCustomOrder: boolean;
  isSpecialOffer: boolean;
}

interface CustomOrderProduct {
  Product: string;
  Quantity: number;
  "Total Price": string | number;
  "Shipping Cost": string | number;
  Price?: number;
}

interface CustomOrder {
  order_id: string;
  Products: CustomOrderProduct[];
  Status?: string;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customOrderId = searchParams?.get('custom_order');
  const [user, setUser] = useState<any>(null);
  const [customOrder, setCustomOrder] = useState<CustomOrder | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { 
    cart, 
    products, 
    cartAddons, 
    shippingInfo, 
    clearCart, 
    getProductIdFromCartKey,
    activeDragonOffer,
    calculateOrderTotals
  } = useCart();

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previousAddresses, setPreviousAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Address form data
  const [addressFormData, setAddressFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Pre-fill pincode from shipping info
  useEffect(() => {
    if (shippingInfo.pincode) {
      setPincode(String(shippingInfo.pincode));
    }
  }, [shippingInfo.pincode]);

  // Autofill city/state/country from pincode
  useEffect(() => {
    const fetchLocation = async () => {
      if (/^\d{6}$/.test(pincode)) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await res.json();
          if (Array.isArray(data) && data[0]?.Status === "Success") {
            const postOffice = data[0].PostOffice?.[0];
            setCity(postOffice?.District || "");
            setStateName(postOffice?.State || "");
            setCountry(postOffice?.Country || "India");
          } else {
            setCity("");
            setStateName("");
            setCountry("");
          }
        } catch {
          setCity("");
          setStateName("");
          setCountry("");
        }
      } else {
        setCity("");
        setStateName("");
        setCountry("");
      }
    };
    fetchLocation();
  }, [pincode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setEmail(session?.user?.email ?? "");
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setEmail(session?.user?.email ?? "");
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Helper to normalize address for similarity comparison
  function normalizeAddress(addr: any) {
    return [
      String(addr.Address ?? "").trim().toLowerCase().replace(/[\s,.-]+/g, " "),
      String(addr.Pincode ?? "").trim(),
      String(addr.Name ?? "").trim().toLowerCase(),
      String(addr.Contact ?? "").trim(),
      String(addr.Email ?? "").trim().toLowerCase()
    ].join("|");
  }

  // Fetch previous addresses for logged-in user
  useEffect(() => {
    if (!user || !pincode) return;
    const fetchAddresses = async () => {
      const { data, error } = await supabase
        .from("Orders")
        .select("Address,Pincode,Country,State,City,Name,Contact,Email")
        .eq("uid", user.id)
        .eq("Pincode", pincode);
      if (error || !data) return;

      // Deduplicate by similarity
      const seen = new Set<string>();
      const deduped: any[] = [];
      for (const addr of data) {
        const norm = normalizeAddress(addr);
        let isSimilar = false;
        for (const seenAddr of deduped) {
          if (normalizeAddress(seenAddr) === norm) {
            isSimilar = true;
            break;
          }
        }
        if (!isSimilar) {
          deduped.push(addr);
        }
      }
      setPreviousAddresses(deduped);
    };
    fetchAddresses();
  }, [user, pincode]);

  // Update individual fields when addressFormData changes
  useEffect(() => {
    setName(addressFormData.name);
    setPhone(addressFormData.phone);
    setEmail(addressFormData.email);
    setAddress(addressFormData.address);
  }, [addressFormData]);

  // Autofill fields when selecting a previous address
  useEffect(() => {
    if (
      selectedAddressIndex !== null &&
      previousAddresses[selectedAddressIndex] &&
      !showAddressForm
    ) {
      const prev = previousAddresses[selectedAddressIndex];
      setName(prev.Name || "");
      setPhone(prev.Contact ? String(prev.Contact) : "");
      setEmail(prev.Email || "");
      setAddress(prev.Address || "");
      setCity(prev.City || "");
      setStateName(prev.State || "");
      setCountry(prev.Country || "");
    }
    // If "Add Address" is selected, restore from addressFormData
    if (showAddressForm) {
      setName(addressFormData.name);
      setPhone(addressFormData.phone);
      setEmail(addressFormData.email);
      setAddress(addressFormData.address);
    }
  }, [selectedAddressIndex, previousAddresses, showAddressForm, user]);

  // Autofill email in addressFormData when switching to Add Address
  useEffect(() => {
    if (showAddressForm) {
      setAddressFormData(prev => ({
        ...prev,
        email: user?.email ?? ""
      }));
    }
  }, [showAddressForm, user]);

  // Fetch custom order if custom_order parameter is present
  useEffect(() => {
    if (customOrderId && user) {
      const fetchCustomOrder = async () => {
        const { data, error } = await supabase
          .from("Your Profile")
          .select("*")
          .eq("order_id", customOrderId)
          .eq("uid", user.id)
          .single();
        
        if (!error && data) {
          setCustomOrder(data);
          setEmail(user.email || "");
        }
      };
      fetchCustomOrder();
    }
  }, [customOrderId, user]);

  // Calculate totals - use custom order if present, otherwise use cart
  const calculateTotals = () => {
    if (customOrder) {
      const subtotal = customOrder.Products.reduce((sum: number, item: any) => 
        sum + (Number(item["Total Price"]) || 0), 0
      );
      const shippingCost = customOrder.Products.reduce((sum: number, item: any) => 
        sum + (Number(item["Shipping Cost"]) || 0), 0
      );
      return {
        subtotal,
        dragonDiscount: 0, // Custom orders don't have dragon discounts
        finalTotal: subtotal,
        total: subtotal + shippingCost
      };
    } else {
      const { subtotal, dragonDiscount, finalTotal } = calculateOrderTotals();
      return {
        subtotal,
        dragonDiscount,
        finalTotal,
        total: finalTotal + (finalTotal >= 1000 ? 0 : shippingInfo.shippingCost)
      };
    }
  };

  const { subtotal, dragonDiscount, finalTotal, total } = calculateTotals();

  const validate = () => {
    // For custom orders, skip pincode matching validation
    if (customOrder) {
      if (!name.trim() || !address.trim() || !pincode.trim() || !phone.trim() || !email.trim() || !city.trim() || !stateName.trim() || !country.trim()) {
        setError("Please fill in all fields.");
        return false;
      }
      if (!/^\d{6}$/.test(pincode)) {
        setError("Please enter a valid 6-digit pincode.");
        return false;
      }
      if (!/^\d{10}$/.test(phone)) {
        setError("Please enter a valid 10-digit phone number.");
        return false;
      }
      setError(null);
      return true;
    }

    // For regular orders, validate all fields including pincode matching
    if (!showAddressForm) {
      if (!name.trim() || !address.trim() || !pincode.trim() || !phone.trim() || !email.trim() || !city.trim() || !stateName.trim() || !country.trim()) {
        setError("Please fill in all fields.");
        return false;
      }
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }
    if (pincode !== shippingInfo.pincode) {
      setError("Pincode doesn't match the one used for shipping. Please go back to cart and recalculate shipping.");
      return false;
    }

    setError(null);
    return true;
  };

  const handlePayment = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!validate()) return;

    // For custom orders, skip the cart validation
    if (!customOrder) {
      const cartItems = Object.entries(cart).map(([cartKey, qty]) => {
        const productId = getProductIdFromCartKey(cartKey);
        const specialOffer = SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS];
        let product;
        if (specialOffer) {
          product = specialOffer;
        } else {
          product = products.find((p) => p.id === productId);
        }
        return product ? { ...product, isSpecialOffer: !!specialOffer } : null;
      }).filter(Boolean);

      const hasPaidItems = cartItems.some(item => item && !item.isSpecialOffer);
      if (!hasPaidItems) {
        setError("You cannot checkout with only free items. Please add at least one paid item to your cart.");
        return;
      }

      if (!shippingInfo.pincode || shippingInfo.pincode.length !== 6) {
        setError("Please go back to cart and enter a valid pincode for shipping calculation.");
        return;
      }
    }

    try {
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const order = await response.json();
      if (!order || !order.id) throw new Error("Error creating payment order");

      const generatedOrderId = customOrder ? customOrder.order_id : `ODR-${order.id}-${Date.now()}`;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "The Loopy Dragon",
        description: customOrder ? "Custom Order Payment" : "Purchase from The Loopy Dragon",
        order_id: order.id,
        handler: async function (response: any) {
          let allSuccess = true;
          let supabaseErrorMsg = "";
          const orderDate = new Date().toISOString();

          if (customOrder) {
            // Handle custom order payment
            try {
              // Update Your Profile status to confirmed
              const { error: profileError } = await supabase
                .from("Your Profile")
                .update({
                  Status: "Order successful: Your custom order is now being made"
                })
                .eq("order_id", customOrder.order_id);
              
              if (profileError) throw profileError;

              // Insert into Orders table for each product
              for (const item of customOrder.Products) {
                const { error: orderError } = await supabase
                  .from("Orders")
                  .insert([{
                    order_id: customOrder.order_id,
                    Name: name,
                    Address: address,
                    Pincode: pincode,
                    Country: country,
                    City: city,
                    State: stateName,
                    Contact: phone,
                    Email: email,
                    Product: item.Product,
                    Quantity: item.Quantity,
                    "Total Price": item["Total Price"],
                    "Shipping Cost": item["Shipping Cost"],
                    uid: user.id,
                    payment_id: response.razorpay_payment_id,
                    "Order Date": orderDate,
                    "Custom Order": true
                  }]);
                if (orderError) throw orderError;
              }

              // Send confirmation email
              await fetch("/api/order-confirmation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  order_id: customOrder.order_id,
                  Name: name,
                  Address: address,
                  Pincode: pincode,
                  Country: country,
                  City: city,
                  State: stateName,
                  Contact: phone,
                  Email: email,
                  orders: customOrder.Products.map((item: any) => ({
                    ...item,
                    Product: item.Product,
                    Quantity: item.Quantity,
                    Price: item.Price,
                    "Total Price": item["Total Price"],
                    "Shipping Cost": item["Shipping Cost"]
                  })),
                  total: total,
                }),
              });

            } catch (error: any) {
              allSuccess = false;
              supabaseErrorMsg = error.message || JSON.stringify(error);
              console.error("Custom order payment error:", error);
            }
          } else {
            // Handle regular cart payment
            const finalShippingCost = finalTotal >= 1000 ? 0 : shippingInfo.shippingCost;

            const productDetails = Object.entries(cart).map(([cartKey, qty]) => {
              const productId = getProductIdFromCartKey(cartKey);
              const specialOffer = SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS];
              let product;
              
              if (specialOffer) {
                product = specialOffer;
              } else {
                product = products.find((p) => p.id === productId);
              }
              
              if (!product) return null;
              
              const addons = cartAddons[cartKey] || {};
              const addonUnitPrice =
                (addons.keyChain ? 10 : 0) +
                (addons.giftWrap ? 10 : 0) +
                (addons.carMirror ? 50 : 0);
              return {
                Product: product.Product,
                Quantity: qty,
                Price: product.Price,
                keyChain: !!addons.keyChain,
                giftWrap: !!addons.giftWrap,
                carMirror: !!addons.carMirror,
                customMessage: addons.customMessage || "",
                'Total Price': ((product.Price + addonUnitPrice) * qty).toFixed(2),
                'Shipping Cost': finalShippingCost.toFixed(2),
                'Fire Offer': activeDragonOffer ? activeDragonOffer.title : "",
                'Fire Discount': dragonDiscount.toFixed(2),
                isSpecialOffer: !!specialOffer
              };
            }).filter(Boolean);

            const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
              for (let i = 0; i < maxRetries; i++) {
                try {
                  return await operation();
                } catch (error: any) {
                  console.log(`Attempt ${i + 1} failed:`, error);
                  if (i === maxRetries - 1) throw error;
                  await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
              }
            };

            try {
              await retryOperation(async () => {
                const { error: profileError } = await supabase
                  .from("Your Profile")
                  .insert([{
                    order_id: generatedOrderId,
                    "Order Date": orderDate,
                    Products: productDetails,
                    uid: user.id,
                    "Dragon Offer": activeDragonOffer ? activeDragonOffer.title : "",
                    "Total Discount": dragonDiscount.toFixed(2),
                    Country: country,
                    City: city,
                    State: stateName
                  }]);
                if (profileError) throw profileError;
              });
            } catch (profileError: any) {
              allSuccess = false;
              supabaseErrorMsg = profileError.message || JSON.stringify(profileError);
              console.error("Supabase Your Profile Insert Error:", profileError);
            }

            for (const [cartKey, qty] of Object.entries(cart)) {
              const productId = getProductIdFromCartKey(cartKey);
              const specialOffer = SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS];
              let product;
              
              if (specialOffer) {
                product = specialOffer;
              } else {
                product = products.find((p) => p.id === productId);
              }
              
              if (!product) continue;
              
              const addons = cartAddons[cartKey] || {};
              const addonUnitPrice =
                (addons.keyChain ? 10 : 0) +
                (addons.giftWrap ? 10 : 0) +
                (addons.carMirror ? 50 : 0);
              const totalPrice = ((product.Price + addonUnitPrice) * qty).toFixed(2);
              
              try {
                await retryOperation(async () => {
                  const { error: orderError } = await supabase
                    .from("Orders")
                    .insert([{
                      order_id: generatedOrderId,
                      Name: name,
                      Address: address,
                      Pincode: pincode,
                      Country: country,
                      City: city,
                      State: stateName,
                      Contact: phone,
                      Email: email,
                      Product: product.Product,
                      "Product ID": product.id,
                      Quantity: qty,
                      keyChain: !!addons.keyChain,
                      giftWrap: !!addons.giftWrap,
                      carMirror: !!addons.carMirror,
                      customMessage: addons.customMessage || "",
                      "Total Price": totalPrice,
                      "Shipping Cost": shippingInfo.shippingCost.toFixed(2),
                      uid: user.id,
                      payment_id: response.razorpay_payment_id,
                      "Order Date": orderDate,
                      "Dragon Offer": activeDragonOffer ? activeDragonOffer.title : "",
                      isSpecialOffer: !!specialOffer
                    }]);
                  if (orderError) throw orderError;
                });
              } catch (orderError: any) {
                allSuccess = false;
                supabaseErrorMsg = orderError.message || JSON.stringify(orderError);
                console.error("Supabase Order Insert Error:", orderError);
                continue;
              }
              
              if (!specialOffer) {
                try {
                  await retryOperation(async () => {
                    const { error: updateError } = await supabase
                      .from("Inventory")
                      .update({ Quantity: (product.Quantity || 1) - qty })
                      .eq("id", product.id);
                    if (updateError) throw updateError;
                  });
                } catch (updateError) {
                  console.error("Inventory update error:", updateError);
                }
              }
            }
          }
          
          if (!customOrder) {
            clearCart();
          }
          
          if (allSuccess) {
            router.push(`/order-summary?order_id=${generatedOrderId}`);
          } else {
            console.error("Order partially failed. Supabase error:", supabaseErrorMsg);
            router.push(`/order-summary?order_id=${generatedOrderId}&warning=partial_save`);
          }
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        notes: {
          address: `${address}, Pincode: ${pincode}`,
          ...(customOrder && { custom_order_id: customOrder.order_id })
        },
        modal: {
          ondismiss: function () {
            router.push("/order-failed");
          }
        }
      };
      
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error("Payment setup error:", error);
      let errorMessage = "Order failed! ";
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += "Network error: Please check your internet connection and try again.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }
      
      alert(errorMessage);
      if (!error.message.includes('fetch')) {
        router.push("/order-failed");
      }
    }
  };

  // Map cart to cartItems for display if not custom order
  const cartItems = Object.entries(cart).map(([cartKey, qty]) => {
    const productId = getProductIdFromCartKey(cartKey);
    const specialOffer = SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS];
    let product;
    if (specialOffer) {
      product = specialOffer;
    } else {
      product = products.find((p) => p.id === productId);
    }
    if (!product) return null;
    const addons = cartAddons[cartKey] || {};
    const addonUnitPrice =
      (addons.keyChain ? 10 : 0) +
      (addons.giftWrap ? 10 : 0) +
      (addons.carMirror ? 50 : 0);
    return {
      cartKey,
      Product: product.Product,
      quantity: qty,
      Price: product.Price,
      addons,
      addonUnitPrice,
      totalPrice: (product.Price + addonUnitPrice) * qty,
      isCustomOrder: false,
      isSpecialOffer: !!specialOffer
    };
  }).filter(Boolean) as CartItem[];

  // Use custom order items if present, otherwise use cart items
  const displayItems = customOrder ? 
    customOrder.Products.map((item: any, index: number) => ({
      ...item,
      cartKey: `custom-${index}`,
      quantity: item.Quantity,
      addons: {},
      addonUnitPrice: 0,
      totalPrice: Number(item["Total Price"]),
      isCustomOrder: true,
      isSpecialOffer: false,
      Price: item.Price || 0,
      Product: item.Product
    })) : 
    cartItems;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-[#F5F9FF]" style={{ fontFamily: "sans-serif", overflowX: "hidden" }}>
        {/* Fixed Navbar */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
              : "bg-transparent"
          }`}
        >
          <Navbar />
        </div>

        {/* Spacer for fixed navbar */}
        <div style={{ height: isMobile ? "60px" : "80px" }}></div>

        {/* Header Section */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "2rem 1rem 1rem" : "3rem 1.5rem 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? "1.2rem" : "2rem", position: "relative" }}>
            <style jsx>{`
              .checkout-header {
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
                .checkout-header {
                  font-size: 36px !important;
                  letter-spacing: 0.12em !important;
                  line-height: 0.95 !important;
                  font-weight: 700 !important;
                  text-transform: none !important;
                }
              }
              @media (max-width: 480px) {
                .checkout-header {
                  font-size: 30px !important;
                  letter-spacing: 0.15em !important;
                }
              }
            `}</style>
            <h2 className="checkout-header">
              <span style={{ position: "relative", display: "inline-block" }}>
                <span
                  style={{
                    position: "absolute",
                    left: isMobile ? "-8px" : "-14px",
                    top: isMobile ? "6px" : "10px",
                    width: isMobile ? "32px" : "48px",
                    height: isMobile ? "32px" : "48px",
                    background: "#EFDFFF",
                    borderRadius: "50%",
                    zIndex: 0,
                    pointerEvents: "none",
                  }}
                />
                <span style={{ position: "relative", zIndex: 2 }}>C</span>
              </span>
              <span style={{ position: "relative", zIndex: 2 }}>heckout</span>
            </h2>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: isMobile ? "1rem" : "20px", fontWeight: 400, color: "#22223B", maxWidth: "100%", margin: "0 auto", lineHeight: "1.2" }}>
              {customOrder ? "Complete payment for your custom order" : "Confirm and claim your treasure"}
            </p>
            {customOrder && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#E0F2FE", borderRadius: "8px", border: "1px solid #0EA5E9" }}>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "14px", color: "#0369A1", margin: 0 }}>
                  📝 Custom Order: {customOrder.order_id}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <main style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "0 0.5rem 2rem" : "0 1.5rem 5rem" }}>
          <div style={isMobile ? { display: "flex", flexDirection: "column", gap: "1.5rem" } : { display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem", alignItems: "flex-start" }}>
            <div style={{ padding: isMobile ? "1.5rem" : "2rem" }}>
              <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: isMobile ? "18px" : "24px", fontWeight: 700, color: "#22223B", marginBottom: "1.5rem" }}>
                Shipping Address
              </h3>

              {/* For custom orders, always show the address form since they need to enter delivery details */}
              {customOrder ? (
                <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: isMobile ? "1.5rem" : "2rem", marginBottom: "1.5rem" }}>
                  <form className="space-y-6" onSubmit={e => { e.preventDefault(); handlePayment(); }}>
                    {/* Full Name - full width */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                    </div>
                    {/* Phone and Email side by side */}
                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                          Phone (WhatsApp)
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="10-digit WhatsApp Number"
                          className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                          style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          required
                          maxLength={10}
                          pattern="\d{10}"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          placeholder="Your Email"
                          className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                          style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    {/* Delivery Address - full width */}
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Delivery Address
                      </label>
                      <textarea
                        id="address"
                        placeholder="House No, Street, Area, City"
                        className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                        rows={isMobile ? 4 : 5}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    {/* Pincode and Country side by side */}
                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                      <div>
                        <label htmlFor="pincode" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                          Pincode
                        </label>
                        <input
                          id="pincode"
                          type="text"
                          placeholder="6-digit Pincode"
                          className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                          style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                          value={pincode}
                          onChange={e => setPincode(e.target.value)}
                          required
                          maxLength={6}
                          pattern="\d{6}"
                        />
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                          Country
                        </label>
                        <input
                          id="country"
                          type="text"
                          placeholder="Country"
                          className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                          style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                          value={country}
                          onChange={e => setCountry(e.target.value)}
                          required
                          autoComplete="country"
                        />
                      </div>
                    </div>
                    {/* City and State side by side */}
                    <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          placeholder="City"
                          className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                          style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          required
                          autoComplete="address-level2"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                          State
                        </label>
                        <input
                          id="state"
                          type="text"
                          placeholder="State"
                          className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                          style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                          value={stateName}
                          onChange={e => setStateName(e.target.value)}
                          required
                          autoComplete="address-level1"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                /* Regular orders address selection code */
                <div>
                  {/* Previous addresses as white cards/buttons */}
                  {previousAddresses.length > 0 && (
                    <div className="mb-6">
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem"
                      }}>
                        {previousAddresses.map((addr, idx) => {
                          const addressDisplay = `${addr.Address}, ${addr.Pincode}`;
                          const trimmedAddress =
                            addressDisplay.length > 38
                              ? addressDisplay.slice(0, 35) + "..."
                              : addressDisplay;
                          return (
                            <label
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                background: "#FFFFFF",
                                border: selectedAddressIndex === idx && !showAddressForm
                                  ? "2px solid #8B5CF6"
                                  : "1px solid #E5E7EB",
                                borderRadius: "0",
                                padding: "0.75rem 1rem",
                                cursor: "pointer",
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: "15px",
                                color: "#22223B",
                                transition: "border 0.2s",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                              }}
                              onClick={() => {
                                setSelectedAddressIndex(idx);
                                setShowAddressForm(false);
                              }}
                            >
                              <input
                                type="radio"
                                name="addressSelect"
                                checked={selectedAddressIndex === idx && !showAddressForm}
                                onChange={() => {
                                  setSelectedAddressIndex(idx);
                                  setShowAddressForm(false);
                                }}
                                style={{ marginRight: "1rem" }}
                              />
                              <span style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                <span style={{
                                  fontWeight: 600,
                                  color: "#22223B",
                                  marginRight: "0.75rem",
                                  maxWidth: "180px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap"
                                }}>
                                  {addr.Name}
                                </span>
                                <span style={{
                                  color: "#7C7C7C",
                                  fontSize: "13px",
                                  maxWidth: "180px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap"
                                }}>
                                  {trimmedAddress}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                        {/* Wrap Add Address radio and form in a single card */}
                        <div
                          style={{
                            background: "#FFFFFF",
                            border: showAddressForm
                              ? "2px solid #8B5CF6"
                              : "1px solid #E5E7EB",
                            borderRadius: "0",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                            padding: "0.75rem 1rem",
                            marginBottom: "1.5rem",
                            display: showAddressForm ? "flex" : "flex",
                            flexDirection: showAddressForm ? "column" : "row",
                            alignItems: showAddressForm ? "flex-start" : "center",
                            minHeight: !showAddressForm ? "56px" : undefined,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              fontFamily: "Montserrat, sans-serif",
                              fontSize: "15px",
                              color: "#22223B",
                              width: "100%",
                              marginBottom: showAddressForm ? "1rem" : "0",
                            }}
                            onClick={() => {
                              setSelectedAddressIndex(null);
                              setShowAddressForm(true);
                            }}
                          >
                            <input
                              type="radio"
                              name="addressSelect"
                              checked={showAddressForm}
                              onChange={() => {
                                setSelectedAddressIndex(null);
                                setShowAddressForm(true);
                              }}
                              style={{ marginRight: "1rem" }}
                            />
                            <span style={{ display: "flex", alignItems: "center", width: "100%" }}>
                              <span style={{
                                fontWeight: 600,
                                color: "#22223B",
                                marginRight: "0.75rem",
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}>
                                + Add Address
                              </span>
                              <span style={{
                                color: "#7C7C7C",
                                fontSize: "13px",
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}>
                                {/* Empty for alignment */}
                              </span>
                            </span>
                          </label>
                          {showAddressForm && (
                            <form
                              className="space-y-6"
                              onSubmit={e => { e.preventDefault(); handlePayment(); }}
                              style={{ width: "100%" }}
                            >
                              <div className="space-y-6">
                                {/* Full Name - full width */}
                                <div>
                                  <label htmlFor="name" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                    Full Name
                                  </label>
                                  <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                    style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                    value={name}
                                    onChange={e => {
                                      setName(e.target.value);
                                      setAddressFormData(prev => ({ ...prev, name: e.target.value }));
                                    }}
                                    required
                                  />
                                </div>
                                {/* Phone and Email side by side */}
                                <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                                  <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                      Phone (WhatsApp)
                                    </label>
                                    <input
                                      id="phone"
                                      type="tel"
                                      placeholder="10-digit WhatsApp Number"
                                      className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                      value={phone}
                                      onChange={e => {
                                        setPhone(e.target.value);
                                        setAddressFormData(prev => ({ ...prev, phone: e.target.value }));
                                      }}
                                      required
                                      maxLength={10}
                                      pattern="\d{10}"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                      Email
                                    </label>
                                    <input
                                      id="email"
                                      type="email"
                                      placeholder="Your Email"
                                      className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                      value={email}
                                      onChange={e => {
                                        setEmail(e.target.value);
                                        setAddressFormData(prev => ({ ...prev, email: e.target.value }));
                                      }}
                                      required
                                      autoComplete="email"
                                    />
                                  </div>
                                </div>
                                {/* Delivery Address - full width */}
                                <div>
                                  <label htmlFor="address" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                    Delivery Address
                                  </label>
                                  <textarea
                                    id="address"
                                    placeholder="House No, Street, Area, City"
                                    className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none"
                                    style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                    rows={isMobile ? 4 : 5}
                                    value={address}
                                    onChange={e => {
                                      setAddress(e.target.value);
                                      setAddressFormData(prev => ({ ...prev, address: e.target.value }));
                                    }}
                                    required
                                  />
                                </div>
                                {/* Pincode and Country side by side */}
                                <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                                  <div>
                                    <label htmlFor="pincode" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                      Pincode
                                    </label>
                                    <input
                                      id="pincode"
                                      type="text"
                                      placeholder="6-digit Pincode"
                                      className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                      value={pincode}
                                      onChange={e => setPincode(e.target.value)}
                                      required
                                      maxLength={6}
                                      pattern="\d{6}"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                      Country
                                    </label>
                                    <input
                                      id="country"
                                      type="text"
                                      placeholder="Country"
                                      className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                      value={country}
                                      onChange={e => setCountry(e.target.value)}
                                      required
                                      autoComplete="country"
                                    />
                                  </div>
                                </div>
                                {/* City and State side by side */}
                                <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                                  <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                      City
                                    </label>
                                    <input
                                      id="city"
                                      type="text"
                                      placeholder="City"
                                      className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                      value={city}
                                      onChange={e => setCity(e.target.value)}
                                      required
                                      autoComplete="address-level2"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                      State
                                    </label>
                                    <input
                                      id="state"
                                      type="text"
                                      placeholder="State"
                                      className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                      value={stateName}
                                      onChange={e => setStateName(e.target.value)}
                                      required
                                      autoComplete="address-level1"
                                    />
                                  </div>
                                </div>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* If no previous addresses, show only the form in a card as before */}
                  {previousAddresses.length === 0 && (
                    <div
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "0",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        padding: isMobile ? "1.5rem" : "2rem",
                        marginBottom: "1.5rem"
                      }}
                    >
                      <form
                        className="space-y-6"
                        onSubmit={e => { e.preventDefault(); handlePayment(); }}
                      >
                        <div className="space-y-6">
                          {/* Full Name - full width */}
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                              Full Name
                            </label>
                            <input
                              id="name"
                              type="text"
                              placeholder="Enter your full name"
                              className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                              style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                              value={name}
                              onChange={e => {
                                setName(e.target.value);
                                setAddressFormData(prev => ({ ...prev, name: e.target.value }));
                              }}
                              required
                            />
                          </div>
                          {/* Phone and Email side by side */}
                          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                            <div>
                              <label htmlFor="phone" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                Phone (WhatsApp)
                              </label>
                              <input
                                id="phone"
                                type="tel"
                                placeholder="10-digit WhatsApp Number"
                                className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                value={phone}
                                onChange={e => {
                                  setPhone(e.target.value);
                                  setAddressFormData(prev => ({ ...prev, phone: e.target.value }));
                                }}
                                required
                                maxLength={10}
                                pattern="\d{10}"
                              />
                            </div>
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                Email
                              </label>
                              <input
                                id="email"
                                type="email"
                                placeholder="Your Email"
                                className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                value={email}
                                onChange={e => {
                                  setEmail(e.target.value);
                                  setAddressFormData(prev => ({ ...prev, email: e.target.value }));
                                }}
                                required
                                autoComplete="email"
                              />
                            </div>
                          </div>
                          {/* Delivery Address - full width */}
                          <div>
                            <label htmlFor="address" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                              Delivery Address
                            </label>
                            <textarea
                              id="address"
                              placeholder="House No, Street, Area, City"
                              className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none"
                              style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                              rows={isMobile ? 4 : 5}
                              value={address}
                              onChange={e => {
                                setAddress(e.target.value);
                                setAddressFormData(prev => ({ ...prev, address: e.target.value }));
                              }}
                              required
                            />
                          </div>
                          {/* Pincode and Country side by side */}
                          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                            <div>
                              <label htmlFor="pincode" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                Pincode
                              </label>
                              <input
                                id="pincode"
                                type="text"
                                placeholder="6-digit Pincode"
                                className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                value={pincode}
                                onChange={e => setPincode(e.target.value)}
                                required
                                maxLength={6}
                                pattern="\d{6}"
                                readOnly
                              />
                            </div>
                            <div>
                              <label htmlFor="country" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                Country
                              </label>
                              <input
                                id="country"
                                type="text"
                                placeholder="Country"
                                className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                required
                                autoComplete="country"
                                readOnly
                              />
                            </div>
                          </div>
                          {/* City and State side by side */}
                          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
                            <div>
                              <label htmlFor="city" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                City
                              </label>
                              <input
                                id="city"
                                type="text"
                                placeholder="City"
                                className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                required
                                autoComplete="address-level2"
                                readOnly
                              />
                            </div>
                            <div>
                              <label htmlFor="state" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                                State
                              </label>
                              <input
                                id="state"
                                type="text"
                                placeholder="State"
                                className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                                value={stateName}
                                onChange={e => setStateName(e.target.value)}
                                required
                                autoComplete="address-level1"
                                readOnly
                              />
                            </div>
                          </div>
                          {/* Error message */}
                          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-col md:flex-row md:items-center gap-4'}`}>
                            {error && (
                              <p 
                                className={`text-sm text-red-600 ${isMobile ? 'text-center' : 'md:self-center'}`}
                                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                              >
                                {error}
                              </p>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Pay Now button - full width, no card */}
                  <div style={{ width: "100%", marginTop: "1.5rem" }}>
                    <button
                      onClick={handlePayment}
                      style={{
                        width: "100%",
                        backgroundColor: "#D8B6FA",
                        color: "#000000",
                        padding: isMobile ? "12px" : "16px",
                        borderRadius: "0",
                        border: "none",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: isMobile ? "16px" : "18px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      className="hover:bg-purple-300"
                    >
                      {customOrder ? `Pay ₹${total.toFixed(2)} for Custom Order` : "Proceed to Payment"}
                    </button>
                    <p style={{ textAlign: "center", fontSize: isMobile ? "12px" : "14px", color: "#6B7280", marginTop: "1rem", fontFamily: "Montserrat, sans-serif" }}>
                      Secure checkout powered by Razorpay
                    </p>
                  </div>

                  {/* Error display */}
                  {error && (
                    <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#FEE2E2", borderRadius: "8px", border: "1px solid #F87171" }}>
                      <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "14px", color: "#DC2626", margin: 0 }}>
                        {error}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Pay Now button for custom orders - moved outside the address selection div */}
              {customOrder && (
                <div style={{ width: "100%", marginTop: "1.5rem" }}>
                  <button
                    onClick={handlePayment}
                    style={{
                      width: "100%",
                      backgroundColor: "#D8B6FA",
                      color: "#000000",
                      padding: isMobile ? "12px" : "16px",
                      borderRadius: "0",
                      border: "none",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: isMobile ? "16px" : "18px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    className="hover:bg-purple-300"
                  >
                    Pay ₹{total.toFixed(2)} for Custom Order
                  </button>
                  <p style={{ textAlign: "center", fontSize: isMobile ? "12px" : "14px", color: "#6B7280", marginTop: "1rem", fontFamily: "Montserrat, sans-serif" }}>
                    Secure checkout powered by Razorpay
                  </p>
                </div>
              )}

              {/* Error display for custom orders */}
              {customOrder && error && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#FEE2E2", borderRadius: "8px", border: "1px solid #F87171" }}>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "14px", color: "#DC2626", margin: 0 }}>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary - updated styles */}
            <div
              style={
                isMobile
                  ? { width: "100%" }
                  : { 
                      width: "400px",
                      position: "sticky",
                      top: "32px",
                      marginLeft: "0",
                      marginTop: "0"
                    }
              }
            >
              <div
                style={{
                  backgroundColor: "#F0ECFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0",
                  padding: isMobile ? "1.5rem" : "2rem",
                  width: "100%",
                  fontFamily: "Montserrat, sans-serif"
                }}
              >
                <h2
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: isMobile ? "18px" : "24px",
                    fontWeight: 700,
                    color: "#22223B",
                    marginBottom: isMobile ? "1rem" : "1.5rem",
                  }}
                >
                  Order Summary
                </h2>
                
                {/* Display custom order items or regular cart items */}
                {displayItems.length > 0 && (
                  <div style={{ marginBottom: "1rem", maxHeight: "300px", overflowY: "auto" }}>
                    {displayItems.map((item: any, index: number) => (
                      <div key={item.cartKey || index} style={{ padding: "0.75rem 0", borderBottom: "1px solid #E5E7EB" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 600, fontSize: "14px", color: "#22223B", margin: 0 }}>{item.Product}</h4>
                            <p style={{ fontSize: "12px", color: "#666", margin: "2px 0" }}>
                              Qty: {item.quantity} × ₹{(item.Price || 0).toFixed(2)}
                            </p>
                            {item.isCustomOrder && (
                              <span style={{ fontSize: "10px", backgroundColor: "#E0F2FE", color: "#0369A1", padding: "2px 6px", borderRadius: "12px" }}>
                                Custom Order
                              </span>
                            )}
                          </div>
                          <div style={{ fontWeight: 600, color: "#22223B" }}>
                            ₹{item.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ borderTop: "1px solid #E5E7EB", margin: "1rem 0" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#22223B", fontWeight: 500 }}>Subtotal</span>
                  <span style={{ fontWeight: 600, color: "#22223B" }}>₹{subtotal.toFixed(2)}</span>
                </div>
                {dragonDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#22223B", fontWeight: 500 }}>Discount</span>
                    <span style={{ fontWeight: 600, color: "#22223B" }}>-₹{dragonDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#22223B", fontWeight: 500 }}>Shipping</span>
                  <span style={{ fontWeight: 600, color: "#22223B" }}>
                    {customOrder ? 
                      `₹${(total - subtotal).toFixed(2)}` : 
                      (subtotal >= 1000 ? "FREE" : `₹${shippingInfo.shippingCost.toFixed(2)}`)
                    }
                  </span>
                </div>
                <div style={{ borderTop: "1px solid #E5E7EB", margin: "1rem 0" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "18px", color: "#22223B" }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: "20px", color: "#22223B" }}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}