"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Trigger at 50px for smooth transition
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
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

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-pink-600 to-pink-800 dark:from-pink-900 dark:to-pink-700 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 text-center tracking-tight">
          Contact Us
        </h1>
        <p className="text-lg sm:text-xl text-pink-100 max-w-3xl text-center leading-relaxed">
          Have questions or want a custom order? Reach out, and let's create something special together!
        </p>
      </section>

      <main className="max-w-5xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 dark:text-pink-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Us a Message
              </h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200"
                    value={name}
                    onChange={e => setName(e.target.value)}
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-200 resize-none"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    placeholder="Tell us about your inquiry or custom order"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold text-base sm:text-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={status === "sending"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
                {status === "sent" && (
                  <div className="text-green-600 dark:text-green-400 text-center bg-green-50 dark:bg-green-900/50 rounded-lg p-3">
                    Message sent successfully! We'll get back to you soon.
                  </div>
                )}
                {status === "error" && (
                  <div className="text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/50 rounded-lg p-3">
                    Failed to send message. Please try again.
                  </div>
                )}
              </form>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 dark:text-pink-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Contact Information
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                <p>
                  <span className="font-semibold">Email:</span> <a href="mailto:theloopydragon123@gmail.com" className="text-pink-600 dark:text-pink-400 hover:underline">theloopydragon123@gmail.com</a>
                </p>
                <p>
                  <span className="font-semibold">WhatsApp:</span> <a href="https://wa.me/911234567890" className="text-pink-600 dark:text-pink-400 hover:underline">+91 1234567890</a>
                </p>
                <p>
                  <span className="font-semibold">Hours:</span> Mon-Sat, 10:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
