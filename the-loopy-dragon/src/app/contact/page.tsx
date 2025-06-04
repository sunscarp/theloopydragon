"use client";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="w-full bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-xl font-bold text-green-700 dark:text-green-400 mb-3 sm:mb-0">
            The Loopy Dragon
          </span>
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-gray-700 dark:text-gray-200 text-sm font-medium items-center">
            <li key="home"><Link href="/">Home</Link></li>
            <li key="about"><Link href="/about">About Us</Link></li>
            <li key="collections"><Link href="/collections">Collections</Link></li>
            <li key="contact"><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto py-16 px-4 flex-1">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">
          Contact Us
        </h2>
        {submitted ? (
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded">
            Thank you for contacting us! We'll get back to you soon.
          </div>
        ) : (
          <form
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Your Name"
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              required
            />
            <textarea
              placeholder="Your Message"
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              rows={4}
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition font-semibold"
            >
              Send Message
            </button>
          </form>
        )}
      </main>
      <footer className="bg-white dark:bg-gray-800 py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} The Loopy Dragon
      </footer>
    </div>
  );
}
