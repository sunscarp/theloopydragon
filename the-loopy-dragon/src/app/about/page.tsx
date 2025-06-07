"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-700 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 text-center tracking-tight">
          About The Loopy Dragon
        </h1>
        <p className="text-lg sm:text-xl text-blue-100 max-w-3xl text-center leading-relaxed">
          Crafting beautiful crochet creations with love, dedication, and a touch of magic
        </p>
      </section>

      <main className="max-w-5xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-3">
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Our Story</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              The Loopy Dragon began as a heartfelt passion project, born from a love for creating handmade crochet items that bring joy, warmth, and a sprinkle of whimsy to every home.
            </p>
          </section>
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              We are dedicated to crafting high-quality crochet pieces that blend traditional techniques with modern designs, ensuring each creation is as unique as the hands that make it.
            </p>
          </section>
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.5 3.5 0 005.33 0l8.135 8.136a3.5 3.5 0 000 4.95l-4.95 4.95a3.5 3.5 0 01-4.95 0l-8.136-8.135a3.5 3.5 0 010-5.33l4.95-4.95z" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Quality & Care</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              Every piece is meticulously handcrafted with premium materials and an eye for detail, ensuring exceptional quality that you can feel in every stitch.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}