"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "@/utils/supabase";
import { useCart } from "@/contexts/CartContext";
import OrderSummary from "@/components/OrderSummary";
import { SPECIAL_OFFER_PRODUCTS } from "@/utils/dragonOffers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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

  // Add this state for address form data
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
      // Do not update addressFormData here
    }
    // If "Add Address" is selected, restore from addressFormData
    if (showAddressForm) {
      setName(addressFormData.name);
      setPhone(addressFormData.phone);
      setEmail(addressFormData.email);
      setAddress(addressFormData.address);
      // Do NOT clear city, stateName, country here; let autofill from pincode effect handle them
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

  // Calculate totals using the new function
  const { subtotal, dragonDiscount, finalTotal } = calculateOrderTotals();
  const total = finalTotal + (finalTotal >= 1000 ? 0 : shippingInfo.shippingCost);

  const validate = () => {
    // Only validate if address form is shown
    if (!showAddressForm) {
      setError(null);
      return true;
    }
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
    // Only validate if address form is shown
    if (!validate()) return;

    const hasPaidItems = cartItems.some(item => item && !item.isSpecialOffer);
    if (!hasPaidItems) {
      setError("You cannot checkout with only free items. Please add at least one paid item to your cart.");
      return;
    }

    if (!shippingInfo.pincode || shippingInfo.pincode.length !== 6) {
      setError("Please go back to cart and enter a valid pincode for shipping calculation.");
      return;
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

      const generatedOrderId = `ODR-${order.id}-${Date.now()}`;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "The Loopy Dragon",
        description: "Purchase from The Loopy Dragon",
        order_id: order.id,
        handler: async function (response: any) {
          let allSuccess = true;
          let supabaseErrorMsg = "";
          const orderDate = new Date().toISOString();
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
              "Total Price": ((product.Price + addonUnitPrice) * qty).toFixed(2),
              "Shipping Cost": finalShippingCost.toFixed(2),
              "Fire Offer": activeDragonOffer ? activeDragonOffer.title : "",
              "Fire Discount": dragonDiscount.toFixed(2),
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
          
          clearCart();
          
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
        },
        modal: {
          ondismiss: function () {
            router.push("/order-failed");
          }
        }
      };
      const paymentObject = new window.Razorpay(options);
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

  const cartItems = Object.entries(cart)
    .map(([cartKey, qty]) => {
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
        ...product,
        cartKey,
        quantity: qty,
        addons,
        addonUnitPrice,
        totalPrice: (product.Price + addonUnitPrice) * qty,
        isSpecialOffer: !!specialOffer,
      };
    })
    .filter(Boolean);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div
        className="min-h-screen bg-[#F5F9FF]"
        style={{
          fontFamily: "sans-serif",
          overflowX: "hidden",
        }}
      >
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
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: isMobile ? "2rem 1rem 1rem" : "3rem 1.5rem 1.5rem",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: isMobile ? "1.2rem" : "2rem",
              position: "relative",
            }}
          >
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
                position: "relative",
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
            <p
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: isMobile ? "1rem" : "20px",
                fontWeight: 400,
                color: "#22223B",
                maxWidth: "100%",
                margin: "0 auto",
                lineHeight: "1.2",
              }}
            >
              Confirm and claim your treasure
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: isMobile ? "0 0.5rem 2rem" : "0 1.5rem 5rem",
          }}
        >
          <div
            style={
              isMobile
                ? {
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }
                : {
                    display: "grid",
                    gridTemplateColumns: "1fr 400px",
                    gap: "2rem",
                  }
            }
          >
            <div
              style={{
                // Remove card background and border, just padding for spacing
                padding: isMobile ? "1.5rem" : "2rem",
              }}
            >
              <h3
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 700,
                  color: "#22223B",
                  marginBottom: "1.5rem",
                }}
              >
                Shipping Address
              </h3>

              {/* Fire Offer Display */}
              {activeDragonOffer && (dragonDiscount > 0 || cartItems.some(item => item && item.isSpecialOffer)) && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Fire Offer Applied: {activeDragonOffer.title}
                      </span>
                      {dragonDiscount > 0 && (
                        <span className="text-sm">
                          Discount: -₹{dragonDiscount.toFixed(2)}
                        </span>
                      )}
                      {activeDragonOffer.type === 'free_product' && (
                        <span className="text-sm">
                          Free item added to your cart!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                            background: "#FFFFFF", // white card
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
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)" // subtle shadow
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
                    {/* Add Address option as white card */}
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        background: "#FFFFFF", // white card
                        border: showAddressForm
                          ? "2px solid #8B5CF6"
                          : "1px solid #E5E7EB",
                        borderRadius: "0",
                        padding: "0.75rem 1rem",
                        cursor: "pointer",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "15px",
                        color: "#22223B",
                        transition: "border 0.2s",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)" // subtle shadow
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
                      <span style={{ fontWeight: 600 }}>
                        + Add Address
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Address form only if Add Address is selected or no previous addresses */}
              {(showAddressForm || previousAddresses.length === 0) && (
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
                      {/* Shipping Address - full width */}
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
                            onChange={() => {}}
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
                            onChange={() => {}}
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
                            onChange={() => {}}
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
                            onChange={() => {}}
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

              {/* If previous address is selected, show error only */}
              {!showAddressForm && previousAddresses.length > 0 && error && (
                <div style={{ marginTop: "1rem" }}>
                  <p
                    className={`text-sm text-red-600 ${isMobile ? 'text-center' : 'md:self-center'}`}
                    style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                  >
                    {error}
                  </p>
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
                    borderRadius: "0", // sharp corners
                    border: "none",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  className="hover:bg-purple-300"
                >
                  Pay Now →
                </button>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: isMobile ? "12px" : "14px",
                    color: "#6B7280",
                    marginTop: "1rem",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Secure checkout powered by Razorpay
                </p>
              </div>
            </div>

            {/* Order Summary and (removed Pay Now button from here) */}
            <div
              style={
                isMobile
                  ? { width: "100%" }
                  : { width: "420px", marginLeft: "auto" } // reduced width for better balance
              }
            >
              <div
                style={{
                  backgroundColor: "#F5F9FF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "0", // sharp corners
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
                {/* Custom summary UI */}
                <div style={{ marginBottom: "1.5rem" }}>
                  {cartItems.map((item, idx) => (
                    item ? (
                      <div key={item.cartKey} style={{ marginBottom: "1rem" }}>
                        <div style={{ fontWeight: 600, fontSize: isMobile ? "15px" : "16px", color: "#22223B" }}>
                          {item.Product}
                        </div>
                        {/* Add-ons display */}
                        {(item.addons?.keyChain || item.addons?.giftWrap || item.addons?.carMirror || item.addons?.customMessage) && (
                          <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "0.25rem" }}>
                            {item.addons?.keyChain && <span style={{ marginRight: "0.5rem" }}>+ Keychain (+₹10)</span>}
                            {item.addons?.giftWrap && <span style={{ marginRight: "0.5rem" }}>+ Gift Wrap (+₹10)</span>}
                            {item.addons?.carMirror && <span style={{ marginRight: "0.5rem" }}>+ Car mirror (+₹50)</span>}
                            {item.addons?.customMessage && (
                              <div>
                                <span style={{ fontStyle: "italic" }}>Message:</span>{" "}
                                {item.addons.customMessage.length > 60
                                  ? item.addons.customMessage.slice(0, 60) + '...'
                                  : item.addons.customMessage}
                              </div>
                            )}
                          </div>
                        )}
                        <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "0.25rem" }}>
                          Qty: {item.quantity} × ₹{item.Price.toFixed(2)}
                          {item.addonUnitPrice > 0 && (
                            <span style={{ marginLeft: "0.5rem", color: "#8B5CF6" }}>
                              + Addons ₹{item.addonUnitPrice}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "16px", color: "#22223B" }}>
                          ₹{item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #E5E7EB", margin: "1rem 0" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#6B7280", fontWeight: 500 }}>Subtotal</span>
                  <span style={{ fontWeight: 600, color: "#22223B" }}>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#6B7280", fontWeight: 500 }}>Shipping</span>
                  <span style={{ fontWeight: 600, color: "#22223B" }}>
                    {subtotal >= 1000 ? "FREE" : `₹${shippingInfo.shippingCost.toFixed(2)}`}
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
              {/* Remove Pay Now button and Razorpay info from here */}
            </div>
          </div>
        </main>
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}