"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/mobilefooter";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from 'uuid';
import { User } from "@supabase/supabase-js";
import { Fragment } from "react";

export default function CustomOrder() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [material, setMaterial] = useState("Acrylic yarn (Default)");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Trigger at 50px for smooth transition
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Combine existing and new files, but max 3
    let combined = [...images, ...files];

    // Remove duplicates by name and size (not perfect, but works for most cases)
    combined = combined.filter(
      (file, idx, arr) =>
        arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
    );

    if (combined.length > 3) {
      alert("You can only upload up to 3 images");
      // Only keep the first 3
      combined = combined.slice(0, 3);
    }

    // Clean up old previews
    previews.forEach(url => URL.revokeObjectURL(url));

    setImages(combined);
    setPreviews(combined.map(file => URL.createObjectURL(file)));
    // Clear the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    // Revoke the URL for the removed image
    URL.revokeObjectURL(previews[indexToRemove]);
    
    // Filter out the image and preview at the specified index
    const newImages = images.filter((_, index) => index !== indexToRemove);
    const newPreviews = previews.filter((_, index) => index !== indexToRemove);
    
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const uploadImage = async (file: File, retryCount = 0): Promise<string> => {
    try {
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Invalid file type');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt) throw new Error('Invalid file extension');

      const fileName = `${uuidv4()}-${Date.now()}.${fileExt}`;
      const filePath = `custom-orders/${fileName}`;

      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from('custom-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError.message);

        // Retry logic for specific errors
        if (retryCount < 2 && (
          uploadError.message.includes('security policy') ||
          uploadError.message.includes('timeout')
        )) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return uploadImage(file, retryCount + 1);
        }

        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('custom-images')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return publicUrl;

    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in with Google to send a custom order.");
      return;
    }
    
    if (images.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }
    
    setStatus("sending");
    try {
      // Initialize imageUrls array even if no images
      const imageUrls: string[] = [];
      
      // Only process images if there are any
      if (images.length > 0) {
        setUploadProgress("Preparing to upload images...");
        // Upload images one by one with progress
        for (let i = 0; i < images.length; i++) {
          setUploadProgress(`Uploading image ${i + 1} of ${images.length}...`);
          const url = await uploadImage(images[i]);
          imageUrls.push(url);
        }
      }

      setUploadProgress("Saving order details...");
      
      // Insert into Custom table - use EXACT column names from Supabase
      const { error: dbError } = await supabase
        .from('Custom')
        .insert([{
          uid: user.id,
          "Full Name": name,
          Email: user.email,
          Phone: phone,
          "Order Details": details,
          Quantity: quantity,
          Material: material,
          ImageUrl1: imageUrls[0] || null,
          ImageUrl2: imageUrls[1] || null,
          ImageUrl3: imageUrls[2] || null,
        }]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      setUploadProgress("Sending email notification...");

      // Send email notification
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", user.email || "");
      formData.append("phone", phone);
      formData.append("details", details);
      formData.append("quantity", quantity);
      formData.append("material", material);
      imageUrls.forEach((url, index) => {
        formData.append(`imageUrl${index + 1}`, url);
      });

      const res = await fetch("/api/custom-order", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('Email sending failed:', errorData);
        throw new Error('Failed to send email');
      }

      setStatus("sent");
      setName("");
      setPhone("");
      setDetails("");
      setQuantity("1");
      setMaterial("Acrylic yarn (Default)");
      setImages([]);
      setPreviews([]);
      setUploadProgress("");
      setShowPopup(true); // Show popup on success
    } catch (error: any) {
      console.error('Submission error:', error);
      setStatus("error");
      setUploadProgress("");
      
      // More specific error handling
      if (error?.message?.includes("row-level security policy") || 
          error?.details?.includes("row-level security policy") ||
          error?.code === 'PGRST116') {
        alert("We're sorry, but your order could not be submitted due to a server permission issue. Please contact support or try again later.");
      } else if (error?.message?.includes("relation") || error?.message?.includes("column")) {
        alert("There was a database configuration issue. Please contact support.");
      } else {
        alert("Failed to submit your custom order. Please try again or contact support if the issue persists.");
      }
    }
  };

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useEffect(() => {
    // Get current session/user
    const getSession = async () => {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      setAuthLoading(false);
    };
    getSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google" });
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF] dark:from-gray-900 dark:to-gray-800 flex flex-col font-sans scroll-smooth">
      {/* Popup Overlay */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(30,30,30,0.15)",
            borderRadius: 0
          }}
        >
          <div
            className="relative flex flex-col items-center justify-center"
            style={{
              background: "#fff",
              borderRadius: 0,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              padding: "0",
              minWidth: isMobile ? "100vw" : "700px",
              maxWidth: "100vw",
              width: isMobile ? "100vw" : "700px",
              minHeight: isMobile ? "320px" : "360px",
              border: "1px solid #e5e7eb",
              justifyContent: "center"
            }}
          >
            {/* X Button */}
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                background: "transparent",
                borderWidth: 0,
                borderStyle: "none",
                color: "#888", // grey color
                fontSize: "2.2rem", // bigger size
                fontWeight: 400, // thinner
                padding: "12px 22px",
                lineHeight: 1,
                cursor: "pointer",
                borderRadius: 0
              }}
              aria-label="Close"
            >
              ×
            </button>
            {/* Tick Icon */}
            <div className="flex items-center justify-center mt-10 mb-4">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#D8B6FA" />
                <path d="M16 25.5L22 31.5L33 19.5" stroke="#22223B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Title */}
            <div
              className="text-black text-center"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? "20px" : "24px",
                letterSpacing: "0.02em",
                marginBottom: "10px"
              }}
            >
              Request Submitted
            </div>
            {/* Description */}
            <div
              className="text-black text-center"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: isMobile ? "12px" : "15px",
                letterSpacing: "0.01em",
                margin: "0 18px 0 18px",
                marginBottom: "32px",
                lineHeight: 1.5
              }}
            >
              Request will be added to “Your Orders” once accepted. Check your email for the confirmation in 2-3 business days. Check your spam folder if the email is not visible.
            </div>
            {/* Got it Button */}
            <button
              onClick={() => setShowPopup(false)}
              style={{
                background: "#D8B6FA",
                color: "#22223B",
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: isMobile ? "15px" : "16px",
                letterSpacing: "0.02em",
                border: "none",
                borderRadius: 0,
                padding: "10px 64px",
                marginBottom: "28px",
                marginTop: "0",
                alignSelf: "center",
                cursor: "pointer",
                minWidth: "340px",
                width: "auto"
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {/* Sticky Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-md py-2 px-4 sm:px-6'
            : 'bg-transparent py-4 px-6 sm:px-8'
        }`}
      >
        <Navbar />
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-16 sm:h-20"></div>

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
        {/* CUSTOMIZE header with decorative circles */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: isMobile ? '32px' : '50px',
              fontWeight: 900,
              color: '#22223B',
              marginBottom: '0.5rem',
              letterSpacing: '0.05em',
              position: 'relative',
              zIndex: 2,
              display: 'inline-block'
            }}
          >
            <span style={{ position: 'relative', display: 'inline-block' }}>
              {/* Main filled circle behind 'C', slightly higher and more overlapped */}
              <span
              style={{
                position: 'absolute',
                left: isMobile ? '-10px' : '-16px',
                top: isMobile ? '4px' : '10px', // moved up
                width: isMobile ? '32px' : '48px',
                height: isMobile ? '32px' : '48px',
                background: '#EFDFFF',
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none'
              }}
              />
              <span style={{ position: 'relative', zIndex: 2 }}>C</span>
            </span>
            <span style={{ position: 'relative', zIndex: 2 }}>USTOMIZE</span>
          </h2>
          <div
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: isMobile ? '14px' : '20px',
              fontWeight: 400,
              color: '#22223B',
              maxWidth: '100%',
              margin: '0 auto',
              lineHeight: '1.2',
              letterSpacing: '0.03em',
              padding: isMobile ? '0 1rem' : '0'
            }}
          >
            You dream it. We stitch it.
          </div>
        </div>
        {/* --- How Custom Orders Work Section START --- */}
        {/* Top separator line */}
        <div className="relative my-7">
          <div
            className="absolute inset-x-0 h-3 bg-[#F4E9FE]"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        </div>
        <div className="flex flex-col items-center w-full mb-8 pt-8">
          <div className="w-full relative z-10">
            <h3
              className="text-black text-center mb-8"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: isMobile ? '20px' : '30px',
                letterSpacing: '0.01em'
              }}
            >
              How custom orders work
            </h3>
            <div
              className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-4 gap-8'} max-w-7xl mx-auto w-full`}
            >
              {/* Step 1 */}
              <div className="flex flex-col items-start text-left px-2 sm:px-4">
                <div className="flex items-center mb-1 relative">
                  <span
                    style={{
                      display: 'inline-block',
                      position: 'relative',
                      marginRight: '0.5rem'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: isMobile ? '28px' : '32px',
                        height: isMobile ? '28px' : '32px',
                        background: '#E9D2FF',
                        borderRadius: '50%',
                        zIndex: 0
                      }}
                    />
                    <span
                      style={{
                        position: 'relative',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: isMobile ? '15px' : '18px',
                        color: '#22223B',
                        letterSpacing: '0.05em',
                        zIndex: 1,
                        paddingLeft: '8px',
                        paddingRight: '8px'
                      }}
                    >
                      01
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      fontSize: isMobile ? '15px' : '17px',
                      color: '#22223B'
                    }}
                  >
                    Fill in Details
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    fontSize: isMobile ? '11px' : '13px',
                    color: '#22223B',
                    lineHeight: '1.4',
                    marginLeft: isMobile ? '36px' : '40px'
                  }}
                >
                  Fill in the form and provide details according to your requirements
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-start text-left px-2 sm:px-4">
                <div className="flex items-center mb-1 relative">
                  <span
                    style={{
                      display: 'inline-block',
                      position: 'relative',
                      marginRight: '0.5rem'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: isMobile ? '28px' : '32px',
                        height: isMobile ? '28px' : '32px',
                        background: '#E9D2FF',
                        borderRadius: '50%',
                        zIndex: 0
                      }}
                    />
                    <span
                      style={{
                        position: 'relative',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: isMobile ? '15px' : '18px',
                        color: '#22223B',
                        letterSpacing: '0.05em',
                        zIndex: 1,
                        paddingLeft: '8px',
                        paddingRight: '8px'
                      }}
                    >
                      02
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      fontSize: isMobile ? '15px' : '17px',
                      color: '#22223B'
                    }}
                  >
                    We’ll review request
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    fontSize: isMobile ? '11px' : '13px',
                    color: '#22223B',
                    lineHeight: '1.4',
                    marginLeft: isMobile ? '36px' : '40px'
                  }}
                >
                  Once you submit your request, we’ll review it and get back to you in 2–3 working days.
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-start text-left px-2 sm:px-4">
                <div className="flex items-center mb-1 relative">
                  <span
                    style={{
                      display: 'inline-block',
                      position: 'relative',
                      marginRight: '0.5rem'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: isMobile ? '28px' : '32px',
                        height: isMobile ? '28px' : '32px',
                        background: '#E9D2FF',
                        borderRadius: '50%',
                        zIndex: 0
                      }}
                    />
                    <span
                      style={{
                        position: 'relative',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: isMobile ? '15px' : '18px',
                        color: '#22223B',
                        letterSpacing: '0.05em',
                        zIndex: 1,
                        paddingLeft: '8px',
                        paddingRight: '8px'
                      }}
                    >
                      03
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      fontSize: isMobile ? '15px' : '17px',
                      color: '#22223B'
                    }}
                  >
                    Check “Your Orders”
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    fontSize: isMobile ? '11px' : '13px',
                    color: '#22223B',
                    lineHeight: '1.4',
                    marginLeft: isMobile ? '36px' : '40px'
                  }}
                >
                  If accepted, your custom order will be automatically added to your orders
                </div>
              </div>
              {/* Step 4 */}
              <div className="flex flex-col items-start text-left px-2 sm:px-4">
                <div className="flex items-center mb-1 relative">
                  <span
                    style={{
                      display: 'inline-block',
                      position: 'relative',
                      marginRight: '0.5rem'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: isMobile ? '28px' : '32px',
                        height: isMobile ? '28px' : '32px',
                        background: '#E9D2FF',
                        borderRadius: '50%',
                        zIndex: 0
                      }}
                    />
                    <span
                      style={{
                        position: 'relative',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: isMobile ? '15px' : '18px',
                        color: '#22223B',
                        letterSpacing: '0.05em',
                        zIndex: 1,
                        paddingLeft: '8px',
                        paddingRight: '8px'
                      }}
                    >
                      04
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      fontSize: isMobile ? '15px' : '17px',
                      color: '#22223B'
                    }}
                  >
                    Proceed to payment
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    fontSize: isMobile ? '11px' : '13px',
                    color: '#22223B',
                    lineHeight: '1.4',
                    marginLeft: isMobile ? '36px' : '40px'
                  }}
                >
                  Once the order is added, you can proceed with payment like any regular order
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom separator line */}
        <div className="relative my-9 mb-16">
          <div
            className="absolute inset-x-0 h-3 bg-[#F4E9FE]"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        </div>
        {/* --- How Custom Orders Work Section END --- */}
      </section>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-8 -mt-13">
        <div className="bg-white shadow-lg overflow-hidden">
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
            {/* Info Section */}
            <div className={`bg-[#EFDFFF] p-8 sm:p-12 ${isMobile ? 'w-full' : 'w-full sm:w-[400px]'} max-w-full flex flex-col`}>
              <h2 className="text-2xl font-semibold text-black mb-8" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', lineHeight: '1.5' }}>
                Fill in the form
              </h2>
              <ul className="list-disc pl-5 space-y-5 text-black" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: isMobile ? '13px' : '15px', letterSpacing: '0.01em' }}>
                <li>
                  We’ll review your request and get back to you within 2–3 working days.
                </li>
                <li>
                  The preferred size and color may be slightly different depending upon the availability and pattern.
                </li>
                <li>
                  Remember to check your email for updates about your custom order.
                </li>
                <li>
                  Contact us for any queries<br />
                  theloopydragon123@gmail.com<br />
                  Instagram: @theloopydragon
                </li>
              </ul>
            </div>
            {/* Custom Order Form */}
            <div className={`bg-white p-8 sm:p-12 ${isMobile ? 'pb-8' : 'pb-0'} flex flex-col justify-start ${isMobile ? 'w-full' : 'flex-1'}`}>
              {authLoading ? (
                <div className="text-center text-gray-700 dark:text-gray-200 py-8">Checking authentication...</div>
              ) : !user ? (
                <div className="flex flex-col items-center py-8">
                  <button
                    onClick={handleGoogleLogin}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <g>
                        <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 32.9 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z"/>
                        <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.5 29.6 4 24 4c-7.1 0-13.1 3.7-16.7 9.3z"/>
                        <path fill="#FBBC05" d="M24 44c5.6 0 10.5-1.8 14.3-4.9l-6.6-5.4C29.8 35.7 27 36.5 24 36.5c-6.1 0-10.7-3.1-11.7-7.5l-7 5.4C7.1 40.3 14.1 44 24 44z"/>
                        <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.2 5.5-7.7 5.5-4.6 0-8.4-3.8-8.4-8.5s3.8-8.5 8.4-8.5c2.5 0 4.7.9 6.3 2.4l6.1-6.1C38.5 10.5 31.7 7 24 7c-8.3 0-15.2 6.7-15.2 15s6.9 15 15.2 15c7.7 0 14.2-5.6 15.2-13.5z"/>
                      </g>
                    </svg>
                    Sign in with Google to send a custom order
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Full Name"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="Enter your phone number"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="details" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                      What would you like us to make?* (description, size, color, pattern or reference link if available)
                    </label>
                    <textarea
                      id="details"
                      rows={isMobile ? 4 : 5}
                      maxLength={300}
                      className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      required
                      placeholder="Add details about your desired product"
                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                    />
                    <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                      {details.length}/300 characters
                    </p>
                  </div>
                  <div>
                    <label htmlFor="images" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                      Upload Pictures (if you have any)
                    </label>
                    <div
                      className="flex w-full border border-gray-300 bg-[#F5F9FF] overflow-hidden cursor-pointer"
                      style={{ height: '48px', borderRadius: 0 }}
                      onClick={() => document.getElementById('images')?.click()}
                    >
                      <span
                        className="flex items-center px-4 text-gray-500 select-none flex-1 min-w-0"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', userSelect: 'none' }}
                      >
                        {images.length === 0 
                          ? "Upload a file (JPEG, PNG)" 
                          : images.map(f => {
                              const name = f.name;
                              const ext = name.substring(name.lastIndexOf('.'));
                              const baseName = name.substring(0, name.lastIndexOf('.'));
                              return baseName.length > 6 ? `${baseName.substring(0, 6)}...${ext}` : name;
                            }).join(", ")
                        }
                      </span>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={e => { e.stopPropagation(); document.getElementById('images')?.click(); }}
                        className="flex items-center justify-center font-semibold transition h-full"
                        style={{
                          width: '120px',
                          background: images.length === 0 ? "#EEDCFF" : "#D8B6FA",
                          color: images.length === 0 ? "#b9a7d1" : "#22223B",
                          fontFamily: 'Montserrat, sans-serif',
                          letterSpacing: '0.02em',
                          border: 'none',
                          borderLeft: '1px solid #d1d5db',
                          margin: 0,
                          padding: 0,
                          borderRadius: 0
                        }}
                      >
                        Upload
                      </button>
                      <input
                        id="images"
                        type="file"
                        accept="image/jpeg,image/png"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    {previews.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative aspect-square group">
                            <Image
                              src={preview}
                              alt={`Pattern ${index + 1}`}
                              fill
                              className="object-cover rounded-lg shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              title="Remove image"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              Image {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                      Upload up to 3 images to share your design inspiration ({images.length}/3 selected)
                    </p>
                  </div>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Quantity
                      </label>
                      <select
                        id="quantity"
                        className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="material" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Material
                      </label>
                      <select
                        id="material"
                        className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        required
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      >
                        <option value="Acrylic yarn (Default)">Acrylic yarn (Default)</option>
                        <option value="Velvet Yarn (Plush, luxe texture)">Velvet Yarn (Plush, luxe texture)</option>
                        <option value="Cotton Yarn (gentle, and baby-safe)">Cotton Yarn (gentle, and baby-safe)</option>
                      </select>
                    </div>
                  </div>
                  <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-col md:flex-row md:items-center gap-4'}`}>
                    <button
                      type="submit"
                      className={`${isMobile ? 'w-full' : 'w-full md:w-[calc(50%-0.5rem)]'} px-6 py-3 bg-[#D8B6FA] hover:bg-[#C8A6EA] text-black font-semibold text-base transition duration-200 border-0`}
                      disabled={status === "sending"}
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        letterSpacing: '0.02em',
                        borderRadius: '0'
                      }}
                    >
                      {status === "sending" ? "Sending..." : "Submit"}
                    </button>
                    {status === "sent" && (
                      <p
                        className={`text-sm text-green-600 ${isMobile ? 'text-center' : 'md:self-center'}`}
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      >
                        Custom order sent successfully! We'll get back to you soon.
                      </p>
                    )}
                    {status === "error" && (
                      <p
                        className={`text-sm text-red-500 ${isMobile ? 'text-center' : 'md:self-center'}`}
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      >
                        Failed to send order. Please try again.
                      </p>
                    )}
                  </div>
                  {uploadProgress && (
                    <div className="text-yellow-600 text-center bg-yellow-50 rounded-lg p-3 mt-4" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                      {uploadProgress}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Conditional Footer rendering */}
      {isMobile ? <MobileFooter /> : <Footer />}
    </div>
  );
}