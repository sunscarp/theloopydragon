"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function CustomOrder() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      alert("You can only upload up to 3 images");
      return;
    }

    setImages(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("details", details);
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      const res = await fetch("/api/custom-order", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setPhone("");
        setDetails("");
        setImages([]);
        setPreviews([]);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col font-sans scroll-smooth">
      <Navbar />
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
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={preview}
                        alt={`Pattern ${index + 1}`}
                        fill
                        className="object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Upload up to 3 images to share your design inspiration</p>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}