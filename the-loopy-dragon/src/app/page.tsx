"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex flex-col font-sans">
      {/* Sticky Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50' 
          : 'bg-transparent'
      }`}>
        <Navbar />
      </div>
      
      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20"></div>
      
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 dark:from-purple-900 dark:via-purple-800 dark:to-purple-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-300/20 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-1/4 w-12 h-12 bg-yellow-300/20 rounded-full blur-lg animate-pulse delay-700"></div>
        
        <div className="relative z-10 py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="max-w-5xl mx-auto">
            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 sm:mb-8 tracking-tight leading-tight">
              Handmade
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200 mt-2">
                Crochet Creations
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed opacity-90 mb-8 sm:mb-10">
              Discover unique, handcrafted crochet items made with love, care, and a touch of magic! 
              Each piece tells a story of creativity and passion.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/collections"
                className="group bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-3 min-w-[200px] justify-center"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                View Collections
              </Link>
              
              <button
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="group bg-purple-800/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-purple-700/30 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3 min-w-[200px] justify-center"
              >
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Shop Now
              </button>
            </div>
            
            {/* Decorative separator */}
            <div className="mt-10 sm:mt-12 flex items-center justify-center space-x-4">
              <div className="h-px bg-white/30 w-12 sm:w-16"></div>
              <div className="flex space-x-2 text-2xl sm:text-3xl">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🧶</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms' }}>✨</span>
                <span className="animate-bounce" style={{ animationDelay: '400ms' }}>💜</span>
              </div>
              <div className="h-px bg-white/30 w-12 sm:w-16"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-purple-800 dark:from-gray-900 dark:to-gray-800 py-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px bg-white/30 flex-1 max-w-20"></div>
            <div className="text-3xl">🧶</div>
            <div className="h-px bg-white/30 flex-1 max-w-20"></div>
          </div>
          <p className="text-purple-100 text-lg font-medium mb-2">
            The Loopy Dragon
          </p>
          <p className="text-purple-200 text-sm opacity-80">
            © {new Date().getFullYear()} — Handcrafted with love • All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}