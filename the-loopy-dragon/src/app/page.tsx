"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Handle scroll effect for navbar
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Google Fonts Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
      `}</style>
      
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
          {/* Background Image - Scaled to proper aspect ratio */}
          <div 
            className="w-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url(/flower-image.png)',
              height: 'clamp(400px, 32.5vw, 624px)', // Maintains 1920:624 aspect ratio
              minHeight: '400px'
            }}
          >
            {/* Content Container - Positioned absolutely for precise placement */}
            <div className="relative h-full flex items-center">
              <div 
                className="flex flex-col justify-center"
                style={{
                  marginLeft: 'clamp(20px, 9.74vw, 187px)', // 187px at 1920px width, responsive
                  width: 'clamp(300px, 31.875vw, 612px)', // 612px at 1920px width, responsive
                  height: 'clamp(350px, 22.24vw, 427px)' // 427px at 1920px width, responsive
                }}
              >
                {/* Main Heading */}
                <h1 
                  className="text-black mb-6 leading-none tracking-wider"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(28px, 3.125vw, 60px)', // 60px at 1920px width
                    letterSpacing: '0.05em'
                  }}
                >
                  SHOP FOR CROCHET ITEMS
                </h1>
                
                {/* Subtitle */}
                <p 
                  className="text-black mb-8"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(16px, 1.25vw, 24px)', // 24px at 1920px width
                    lineHeight: '1.875', // 45px / 24px = 1.875
                    letterSpacing: '0.05em'
                  }}
                >
                  Hey there! Welcome to The Loopy Dragon. <br></br>
                  We bring you cozy, handmade crochet pieces made with love and a whole lot of heart!
                </p>
                
                {/* CTA Button */}
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{
                    width: 'clamp(240px, 14.9vw, 286px)', // 286px at 1920px width
                    height: 'clamp(70px, 4.69vw, 90px)', // 90px at 1920px width
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(16px, 1.04vw, 20px)', // 20px at 1920px width
                    letterSpacing: '0.05em',
                    borderRadius: 0 // Sharp corners
                  }}
                >
                  Check us out
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-white">
          <div className="relative w-full">
            {/* Feature Items Container */}
            <div className="flex items-center justify-between w-full px-4">
              {/* Custom Orders */}
              <div 
                className="flex flex-col items-center"
                style={{
                  marginLeft: 'clamp(20px, 12.8vw, 246px)', // 246px at 1920px width
                }}
              >
                <img 
                  src="/custom-orders.png" 
                  alt="Custom Orders Available"
                  style={{
                    width: 'clamp(25px, 2.6vw, 50px)', // 50px at 1920px width
                    height: 'clamp(25px, 2.6vw, 50px)', // 50px at 1920px width
                  }}
                  className="mb-4"
                />
                <p 
                  className="text-black text-center"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(12px, 1.04vw, 20px)', // 20px at 1920px width
                    lineHeight: '100%',
                    letterSpacing: '0.05em'
                  }}
                >
                  Custom Orders Available
                </p>
              </div>

              {/* Decorative Line 1 */}
              <div 
                className="w-px bg-gray-300"
                style={{
                  height: 'clamp(40px, 4.48vw, 86px)', // 86px at 1920px width
                  minHeight: '40px'
                }}
              ></div>
              {/* Free Delivery */}
              <div 
                className="flex flex-col items-center"
                style={{
                  marginLeft: 'clamp(10px, 1vw, 20px)', // Small spacing adjustment
                }}
              >
                <img 
                  src="/delivery.png" 
                  alt="Free Delivery above ₹1000"
                  style={{
                    width: 'clamp(30px, 3.125vw, 60px)', // 60px at 1920px width
                    height: 'clamp(30px, 3.125vw, 60px)', // 60px at 1920px width
                  }}
                  className="mb-4"
                />
                <p 
                  className="text-black text-center"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(12px, 1.04vw, 20px)', // 20px at 1920px width
                    lineHeight: '100%',
                    letterSpacing: '0.05em'
                  }}
                >
                  Free Delivery above ₹1000
                </p>
              </div>

              {/* Decorative Line 2 */}
              <div 
                className="w-px bg-gray-300"
                style={{
                  height: 'clamp(40px, 4.48vw, 86px)', // 86px at 1920px width
                  minHeight: '40px'
                }}
              ></div>
              {/* Wide Product Range */}
              <div 
                className="flex flex-col items-center"
                style={{
                  marginLeft: 'clamp(10px, 1vw, 20px)', // Small spacing adjustment
                }}
              >
                <img 
                  src="/product-range.png" 
                  alt="Wide product range"
                  style={{
                    width: 'clamp(24px, 2.5vw, 48px)', // 48px at 1920px width
                    height: 'clamp(24px, 2.5vw, 48px)', // 48px at 1920px width
                  }}
                  className="mb-4"
                />
                <p 
                  className="text-black text-center"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(12px, 1.04vw, 20px)', // 20px at 1920px width
                    lineHeight: '100%',
                    letterSpacing: '0.05em'
                  }}
                >
                  Wide product range
                </p>
              </div>

              {/* Decorative Line 3 */}
              <div 
                className="w-px bg-gray-300"
                style={{
                  height: 'clamp(40px, 4.48vw, 86px)', // 86px at 1920px width
                  minHeight: '40px'
                }}
              ></div>
              {/* 100% Handmade */}
              <div 
                className="flex flex-col items-center"
                style={{
                  marginRight: 'clamp(20px, 12.8vw, 246px)', // 246px at 1920px width (same as left margin)
                }}
              >
                <img 
                  src="/handmade.png" 
                  alt="100% Handmade"
                  style={{
                    width: 'clamp(28px, 2.92vw, 56px)', // 56px at 1920px width
                    height: 'clamp(28px, 2.92vw, 56px)', // 56px at 1920px width
                  }}
                  className="mb-4"
                />
                <p 
                  className="text-black text-center"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(12px, 1.04vw, 20px)', // 20px at 1920px width
                    lineHeight: '100%',
                    letterSpacing: '0.05em'
                  }}
                >
                  100% Handmade
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Stack vertically on small screens */}
          <div className="block sm:hidden px-4 space-y-8">
            {/* Custom Orders */}
            <div className="flex flex-col items-center">
              <img 
                src="/custom-orders.png" 
                alt="Custom Orders Available"
                className="w-12 h-12 mb-3"
              />
              <p 
                className="text-black text-center text-sm"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 400,
                  letterSpacing: '0.05em'
                }}
              >
                Custom Orders Available
              </p>
            </div>

            {/* Free Delivery */}
            <div className="flex flex-col items-center">
              <img 
                src="/delivery.png" 
                alt="Free Delivery above ₹1000"
                className="w-14 h-14 mb-3"
              />
              <p 
                className="text-black text-center text-sm"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 400,
                  letterSpacing: '0.05em'
                }}
              >
                Free Delivery above ₹1000
              </p>
            </div>

            {/* Wide Product Range */}
            <div className="flex flex-col items-center">
              <img 
                src="/product-range.png" 
                alt="Wide product range"
                className="w-11 h-11 mb-3"
              />
              <p 
                className="text-black text-center text-sm"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 400,
                  letterSpacing: '0.05em'
                }}
              >
                Wide product range
              </p>
            </div>

            {/* 100% Handmade */}
            <div className="flex flex-col items-center">
              <img 
                src="/handmade.png" 
                alt="100% Handmade"
                className="w-13 h-13 mb-3"
              />
              <p 
                className="text-black text-center text-sm"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 400,
                  letterSpacing: '0.05em'
                }}
              >
                100% Handmade
              </p>
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
    </>
  );
}