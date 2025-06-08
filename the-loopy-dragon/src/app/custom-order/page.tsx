"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from 'uuid';
import { AuthError, Session, User } from "@supabase/supabase-js";
import { StorageError } from '@supabase/storage-js';

export default function CustomOrder() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Trigger at 50px for smooth transition
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
      
      // Insert into Custom table, include uid
      const { error: dbError } = await supabase
        .from('Custom')
        .insert([{
          uid: user.id,
          "Full Name": name,
          Email: email,
          Phone: phone,
          "Order Details": details,
          ImageUrl1: imageUrls[0] || null,
          ImageUrl2: imageUrls[1] || null,
          ImageUrl3: imageUrls[2] || null,
        }]);

      if (dbError) throw dbError;

      setUploadProgress("Sending email notification...");

      // Send email notification
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("details", details);
      imageUrls.forEach((url, index) => {
        formData.append(`imageUrl${index + 1}`, url);
      });

      const res = await fetch("/api/custom-order", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to send email');

      setStatus("sent");
      setName("");
      setEmail("");
      setPhone("");
      setDetails("");
      setImages([]);
      setPreviews([]);
      setUploadProgress("");
    } catch (error: any) {
      console.error('Submission error:', error);
      // Add user-friendly error for row-level security policy
      if (
        error?.message?.includes("row-level security policy") ||
        error?.details?.includes("row-level security policy")
      ) {
        setUploadProgress("");
        alert(
          "We're sorry, but your order could not be submitted due to a server permission issue. Please contact support or try again later."
        );
      }
      setStatus("error");
      setUploadProgress("");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col font-sans scroll-smooth">
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

      <section className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-900 dark:to-yellow-700 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 text-center tracking-tight">
          Create Your Custom Order
        </h1>
        <p className="text-lg sm:text-xl text-yellow-100 max-w-3xl text-center leading-relaxed">
          Dream up something unique! Share your vision, and we'll bring it to life with our handcrafted crochet expertise.
        </p>
      </section>
      <main className="max-w-3xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 flex items-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Custom Order Request
          </h2>
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
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Order Details
                </label>
                <textarea
                  id="details"
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200 resize-none"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                  placeholder="Describe your custom order (e.g., colors, size, design preferences)"
                />
              </div>
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Pattern Images (Optional, up to 3)
                </label>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:file:bg-gray-600 dark:file:text-yellow-300 dark:hover:file:bg-gray-500 transition"
                />
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Upload up to 3 images to share your design inspiration ({images.length}/3 selected)
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={status === "sending"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {status === "sending" ? "Sending..." : "Send Custom Order"}
              </button>
              {/* Add progress indicator */}
              {uploadProgress && (
                <div className="text-yellow-600 dark:text-yellow-400 text-center bg-yellow-50 dark:bg-yellow-900/50 rounded-lg p-3 mt-4">
                  {uploadProgress}
                </div>
              )}
              {status === "sent" && (
                <div className="text-green-600 dark:text-green-400 text-center bg-green-50 dark:bg-green-900/50 rounded-lg p-3">
                  Custom order sent successfully! We'll get back to you soon.
                </div>
              )}
              {status === "error" && (
                <div className="text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/50 rounded-lg p-3">
                  Failed to send order. Please try again.
                </div>
              )}
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}