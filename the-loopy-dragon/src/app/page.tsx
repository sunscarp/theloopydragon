"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import Footer from "@/components/Footer";

import HomeMobile from "@/components/HomeMobile";
import useMobileDetect from "@/hooks/useMobileDetect";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const isMobile = useMobileDetect();

  useEffect(() => {
    // Handle scroll effect for navbar
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Top Picks from Supabase Inventory
  type Product = {
    Product: string;
    Price: number;
    ImageUrl1: string;
  };

  const [topPicksProducts, setTopPicksProducts] = useState<Product[]>([]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    async function fetchTopPicks() {
      const { data, error } = await supabase
        .from('Inventory')
        .select('Product, Price, ImageUrl1')
        .in('Product', [
          "Angry Hair Clip",
          "Cat Ears",
          "Sunflower Hair Tie",
          "Rose Hair Tie"
        ]);

      if (!error && data) {
        // Ensure order matches the requested list
        const order = [
          "Angry Hair Clip",
          "Cat Ears",
          "Sunflower Hair Tie",
          "Rose Hair Tie"
        ];
        const sorted = order
          .map(name => data.find((item: any) => item.Product === name))
          .filter((item): item is Product => Boolean(item));
        setTopPicksProducts(sorted);
      }
    }

    fetchTopPicks();
  }, []);

  // FAQ Dropdown State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Can I customize my crochet item?",
      answer: "Yes! We’d love to make something just for you. Head over to our Customise page to get started. Share your ideas with us and we will make sure to bring your vision to life!"
    },
    {
      question: "What materials do you use for your crochet items?",
      answer: "We use a variety of yarns including acrylic, cotton, and velvet to create our pieces. The specific material used is always listed in the product description. If you have a preference, feel free to request a different yarn type — we’re happy to customize it for you!"
    },
    {
      question: "How long will it take to receive my order?",
      answer: "We usually take around 1–2 weeks to prepare and ship your order, making sure every detail is just right! Custom pieces or larger quantity orders may take a little longer, but don’t worry, we’ll keep you in the loop throughout the process."
    },
    {
      question: "How do I care for my crochet items?",
      answer: "To keep your crochet pieces looking their best, we recommend gentle hand washing with mild soap and water at room temperature. Lay flat to dry to maintain their shape. Avoid wringing, harsh detergents, or machine washing."
    },
    {
      question: "Do you offer gift wrapping or packaging?",
      answer: "Yes! Gift wrapping is available as an add-on. Just select the option when you're choosing your product.  We’ll make sure your order arrives looking extra special and ready to gift!"
    }
  ];

  if (isMobile) {
    return <HomeMobile />;
  }
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
        <section className="relative w-full overflow-hidden -mx-4 sm:mx-0">
          {/* Background Image - Scaled to proper aspect ratio */}
          <div 
            className="w-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url(/flower-image.png)',
              height: 'clamp(400px, 32.5vw, 624px)', // Maintains 1920:624 aspect ratio
              minHeight: '400px',
              width: '100vw', // Force full viewport width
              marginLeft: 'calc(-50vw + 50%)', // Center while extending full width
            }}
          >
            {/* Content Container - Positioned absolutely for precise placement */}
            <div className="relative h-full flex items-center">
              <div 
                className="flex flex-col justify-center px-4 sm:px-0"
                style={{
                  marginLeft: 'clamp(20px, 9.74vw, 187px)', // 187px at 1920px width, responsive
                  width: 'clamp(280px, 31.875vw, 612px)', // Slightly smaller on mobile
                  height: 'clamp(350px, 22.24vw, 427px)' // 427px at 1920px width, responsive
                }}
              >
                {/* Main Heading */}
                <h1 
                  className="text-black mb-4 sm:mb-6 leading-none tracking-wider"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(24px, 3.125vw, 60px)', // Slightly smaller starting size for mobile
                    letterSpacing: '0.05em'
                  }}
                >
                  SHOP FOR CROCHET ITEMS
                </h1>
                
                {/* Subtitle */}
                <p 
                  className="text-black mb-6 sm:mb-8"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(14px, 1.25vw, 24px)', // Slightly smaller starting size for mobile
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
                    width: 'clamp(200px, 14.9vw, 286px)', // Smaller starting width for mobile
                    height: 'clamp(60px, 4.69vw, 90px)', // Smaller starting height for mobile
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(14px, 1.04vw, 20px)', // Smaller starting size for mobile
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
        <section className="w-full py-3.5 bg-white">
          <div className="relative w-full">
            {/* Desktop Layout - Hidden on small screens */}
            <div className="hidden sm:flex items-center justify-between w-full px-4">
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
                  height: 'clamp(60px, 4vw, 90px)', // Reduced height to match content better
                  minHeight: '60px'
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
                  height: 'clamp(60px, 4vw, 90px)', // Reduced height to match content better
                  minHeight: '60px'
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
                  height: 'clamp(60px, 4vw, 90px)', // Reduced height to match content better
                  minHeight: '60px'
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

          {/* Mobile Layout - Beautiful grid layout for small screens */}
          <div className="block sm:hidden px-6">
            <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto">
              {/* Custom Orders */}
              <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-pink-50 py-3 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <img 
                    src="/custom-orders.png" 
                    alt="Custom Orders Available"
                    className="w-8 h-8"
                  />
                </div>
                <p 
                  className="text-gray-800 text-center text-xs leading-relaxed"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    letterSpacing: '0.02em'
                  }}
                >
                  Custom Orders Available
                </p>
              </div>

              {/* Free Delivery */}
              <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <img 
                    src="/delivery.png" 
                    alt="Free Delivery above ₹1000"
                    className="w-9 h-9"
                  />
                </div>
                <p 
                  className="text-gray-800 text-center text-xs leading-relaxed"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    letterSpacing: '0.02em'
                  }}
                >
                  Free Delivery above ₹1000
                </p>
              </div>

              {/* Wide Product Range */}
              <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <img 
                    src="/product-range.png" 
                    alt="Wide product range"
                    className="w-8 h-8"
                  />
                </div>
                <p 
                  className="text-gray-800 text-center text-xs leading-relaxed"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    letterSpacing: '0.02em'
                  }}
                >
                  Wide product range
                </p>
              </div>

              {/* 100% Handmade */}
              <div className="flex flex-col items-center bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <img 
                    src="/handmade.png" 
                    alt="100% Handmade"
                    className="w-8 h-8"
                  />
                </div>
                <p 
                  className="text-gray-800 text-center text-xs leading-relaxed"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    letterSpacing: '0.02em'
                  }}
                >
                  100% Handmade
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Picks Section */}
        <section
          className="w-full py-12 md:py-16 lg:py-20 xl:py-24" // Responsive vertical padding
          style={{
            backgroundImage: "url('/yes.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Increased horizontal padding on container */}
          <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-12">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 
                className="text-black mb-4"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(28px, 3.75vw, 36px)',
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                Top Picks
              </h2>
              <p 
                className="text-black"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(18px, 2.5vw, 24px)',
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                Our most loved handmade pieces! Add to cart before they disappear.
              </p>
            </div>

            {/* Products Grid - Added responsive horizontal margins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 mx-2 sm:mx-4 md:mx-0">
              {topPicksProducts.map((product) => (
                <div key={product.Product} className="flex flex-col items-start">
                  {/* Product Image - Only this part is clickable and animated */}
                  <Link
                    href={`/product/${encodeURIComponent(product.Product)}`}
                    className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    style={{ textDecoration: 'none', background: 'transparent', border: 'none' }}
                  >
                    {product.ImageUrl1 ? (
                      <img 
                        src={product.ImageUrl1}
                        alt={product.Product}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA5NS4zNDMgNzAuNzY2IDEwMC4wODkgNzYuMzE4SzEwMC4wODkgMTI4LjMxOEM5NS4zNDMgMTMzLjg3IDEwOC4yODQgMTM1IDEwMCAxMzVTMTA0LjY1NyAxMzMuODcgOTkuOTExIDEyOC4zMThWNzYuMzE4Qzk0LjY1NyA7MC43NjYgOTEuNzE2IDcwIDEwMCA3MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyMCA5MEM4Ni44NjI5IDkwIDYwIDExNi44NjMgNjAgMTUwUzg2Ljg2MjkgMjEwIDEyMCAyMTBTMTgwIDE4My4xMzcgMTgwIDE1MFMxNTMuMTM3IDkwIDEyMCA9MFoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-4xl opacity-30">🧶</span>
                      </div>
                    )}
                  </Link>
                  {/* Product Info - Static, no animation */}
                  <div className="mt-3 text-left w-full">
                    <h3 
                      className="text-black mb-1"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 500,
                        fontSize: 'clamp(14px, 1.2vw, 18px)',
                        lineHeight: '1.2'
                      }}
                    >
                      {product.Product}
                    </h3>
                    <p
                      className="font-semibold"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 600,
                        fontSize: 'clamp(16px, 1.4vw, 20px)',
                        color: '#000'
                      }}
                    >
                      ₹{product.Price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            <div className="text-center mt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{
                  width: 'clamp(240px, 14.9vw, 286px)',
                  height: 'clamp(70px, 4.69vw, 90px)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(16px, 1.04vw, 20px)',
                  letterSpacing: '0.05em',
                  borderRadius: 0
                }}
              >
                View More
              </Link>
            </div>
          </div>
        </section>
        
        {/* Custom Orders Section with Responsive Background */}
        <section 
          className="w-full relative overflow-hidden flex items-center justify-center"
          style={{
            backgroundImage: "url('/hero_custom.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            paddingTop: 'clamp(2rem, 8vw, 5rem)',
            paddingBottom: 'clamp(2rem, 8vw, 5rem)',
            minHeight: 0 // Let content dictate height
          }}
        >
          {/* Content Container - now with better contrast without overlay */}
          <div className="relative z-10 w-full flex flex-col justify-center items-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <h2 
                className="text-black mb-6 md:mb-8"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(28px, 5vw, 36px)',
                  lineHeight: '1.2',
                  letterSpacing: '0.05em',
                  textShadow: '2px 2px 4px rgba(255,255,255,0.9)'
                }}
              >
                Want Something <span style={{ color: '#BD7CFE' }}>Unique</span>?
              </h2>
              
              <div 
                className="text-black mx-auto"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: 'clamp(18px, 3.5vw, 24px)',
                  lineHeight: '1.4',
                  maxWidth: '800px',
                  marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                  textShadow: '2px 2px 4px rgba(255,255,255,0.9)'
                }}
              >
                {/* Mobile & iPad: 2 lines */}
                <span className="block lg:hidden">
                  We Accept Custom Crochet Orders<br />
                  Just Let Us Know Your Idea
                </span>
                
                {/* PC: Single line */}
                <span className="hidden lg:block">
                  We Accept Custom Crochet Orders – Just Let Us Know Your Idea
                </span>
              </div>
              
              {/* Customize Button */}
              <div>
                <Link
                  href="/custom-order"
                  className="inline-flex items-center justify-center bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{  
                    width: 'clamp(240px, 14.9vw, 286px)',
                    height: 'clamp(70px, 4.69vw, 90px)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(16px, 1.04vw, 20px)',
                    letterSpacing: '0.05em',
                    borderRadius: 0,
                    backgroundColor: '#D7B3FB'
                  }}
                >
                  Customize
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
<section className="w-full py-8 sm:py-12 md:py-16 lg:py-20" style={{ backgroundColor: '#F7F0FE' }}>
  <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
    <h2 
      className="text-black text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16"
      style={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 600,
        fontSize: 'clamp(24px, 4vw, 36px)',
        lineHeight: '100%',
        letterSpacing: '0%'
      }}
    >
      Why Choose Us?
    </h2>
    
    {/* Features Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
      {/* Feature 1 */}
      <div className="text-left px-2 sm:px-4">
        <h3 
          className="text-black mb-3 sm:mb-4"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            lineHeight: '1.2'
          }}
        >
          High-Quality Materials
        </h3>
        <p 
          className="text-black text-left"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            lineHeight: '1.4',
            maxWidth: '280px'
          }}
        >
          Only the softest, coziest yarns make the cut.
        </p>
      </div>
      
      {/* Feature 2 */}
      <div className="text-left px-2 sm:px-4">
        <h3 
          className="text-black mb-3 sm:mb-4"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            lineHeight: '1.2'
          }}
        >
          Handmade with Care
        </h3>
        <p 
          className="text-black text-left"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            lineHeight: '1.4',
            maxWidth: '280px'
          }}
        >
          No mass production - just real hands, real skill, real heart.
        </p>
      </div>
      
      {/* Feature 3 */}
      <div className="text-left px-2 sm:px-4">
        <h3 
          className="text-black mb-3 sm:mb-4"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            lineHeight: '1.2'
          }}
        >
          Uniquely Designed
        </h3>
        <p 
          className="text-black text-left"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            lineHeight: '1.4',
            maxWidth: '280px'
          }}
        >
          Every product is crafted with detail and creativity.
        </p>
      </div>
      
      {/* Feature 4 */}
      <div className="text-left px-2 sm:px-4">
        <h3 
          className="text-black mb-3 sm:mb-4"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            lineHeight: '1.2'
          }}
        >
          Long Lasting
        </h3>
        <p 
          className="text-black text-left"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            lineHeight: '1.4',
            maxWidth: '280px'
          }}
        >
          Built to last and made to love, over and over again.
        </p>
      </div>
    </div>
  </div>
</section>

        {/* Instagram Section */}
        <section className="w-full py-16" style={{ backgroundColor: '#EAD4FF' }}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Header */}
    <div className="text-center mb-12 md:mb-16">
      <h2 
        className="text-black mb-6"
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          fontSize: '36px',
          lineHeight: '100%',
          letterSpacing: '0%',
          textTransform: 'capitalize'
        }}
      >
        Follow Us on Instagram
      </h2>
      <p 
        className="text-black mx-auto max-w-2xl px-4"
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(14px, 4vw, 24px)',
          lineHeight: '1.3',
          letterSpacing: '0%'
        }}
      >
        Get behind-the-scenes peeks, cozy crochet inspo, and first dibs on new drops.
      </p>
    </div>

    {/* Instagram Image - Responsive with padding */}
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full overflow-hidden rounded-lg shadow-lg">
        <div 
          className="w-full bg-cover bg-center"
          style={{
            paddingBottom: '25%',
            backgroundImage: 'url(/hero_insta.png)',
            minHeight: '200px'
          }}
        >
          {/* Instagram embed or image content */}
        </div>
      </div>
    </div>
  </div>
</section>

        {/* Frequently Asked Questions Section */}
<section className="w-full py-8 bg-white">
  <div className="max-w-6xl mx-auto px-4"> {/* Changed from max-w-7xl to max-w-6xl for slightly more width */}
    {/* Section Header */}
    <div className="text-center mb-6">
      <h2 
        className="text-black mb-2"
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 650, // Increased from 600
          fontSize: 'clamp(20px, 2.5vw, 28px)',
          lineHeight: '100%',
          letterSpacing: '0%',
          textTransform: 'capitalize'
        }}
      >
        Frequently Asked Questions
      </h2>
    </div>

    {/* FAQ Items */}
    <div className="max-w-5xl mx-auto"> {/* Increased from max-w-4xl to max-w-5xl */}
      {faqs.map((faq, idx) => (
        <div className="mb-4" key={idx}>
          <div className="flex justify-between items-center py-2 gap-6">
            <h3 
              className="text-black flex-1"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500, // Increased from 580 to 620
                fontSize: 'clamp(13px, 1.4vw, 16px)',
                lineHeight: '120%',
              }}
            >
              {faq.question}
            </h3>
            <button
              className="text-black text-xl w-6 h-6 flex items-center justify-center transition-transform duration-300"
              aria-label={openFaq === idx ? "Collapse" : "Expand"}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              style={{ color: 'black' }}
            >
              <span 
                className="block transition-transform duration-300"
                style={{ transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)' }}
              >
                +
              </span>
            </button>
          </div>
          <div 
            className="w-full border-t my-3" 
            style={{ borderColor: '#EFDEFF', height: '2px', width: '100%' }} 
          ></div>
          {/* Dropdown answer */}
          {openFaq === idx && (
            <div
              className="text-black py-2 pl-2"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 450, // Slightly increased from 400
                fontSize: 'clamp(12px, 1.2vw, 15px)',
                lineHeight: '1.5',
              }}
            >
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</section>

    {/* Footer */}
    <Footer />
  </div>
</>
  );
}