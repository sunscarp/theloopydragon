"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabase";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { Arapey, Montserrat } from "next/font/google";

const arapey = Arapey({ subsets: ["latin"], weight: "400" });
const montserrat = Montserrat({ subsets: ["latin"], weight: "400" });

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { cart } = useCart();
  const navRef = useRef<HTMLElement>(null);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Track screen size for responsive scaling
    function updateScreenSize() {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  const goToCart = () => {
    router.push("/cart");
  };

  // Dynamic scaling based on screen width
  const getScaleClass = () => {
    if (screenSize.width >= 1920) return "scale-100";
    if (screenSize.width >= 1600) return "scale-95";
    if (screenSize.width >= 1400) return "scale-90";
    if (screenSize.width >= 1200) return "scale-85";
    return "scale-80";
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100"
      style={{ 
        transform: "translateX(-1.04vw)",
        background: "#F5F9FF",
        width: "101vw",
        boxShadow: "0 0 0 0 #F5F9FF"
      }}
    >
      <div className="relative h-20 max-w-screen-2xl mx-auto w-full px-4 lg:px-6" style={{ background: "#F5F9FF" }}>
        {/* DESKTOP LAYOUT (unchanged) */}
        {/* Logo - Desktop positioning */}
        <Link 
          href="/" 
          className="absolute hidden lg:flex items-center top-1/2 -translate-y-1/2"
          style={{ left: "9.73vw" }}
          id="navbar-logo-link"
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              width: "clamp(28px, 3vw, 44px)",
              height: "clamp(28px, 3vw, 44px)",
              minWidth: "28px",
              minHeight: "28px",
              maxWidth: "44px",
              maxHeight: "44px"
            }}
          >
            <Image
              src="/circle-logo.png"
              alt="The Loopy Dragon Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Text Logo - Desktop */}
        <span
          className={`${arapey.className} hidden lg:block absolute top-1/2 -translate-y-1/2`}
          style={{
            left: "13.38vw",
            fontSize: "clamp(14px, 1.2vw, 20px)",
            letterSpacing: "clamp(0.09em, 0.13vw, 0.16em)",
            lineHeight: "100%",
            color: "#000",
            fontWeight: 400,
            minWidth: "100px",
            maxWidth: "220px"
          }}
        >
          THE LOOPY DRAGON
        </span>

        {/* Desktop Navigation Links - Each link absolutely positioned */}
        <Link
          href="/shop"
          className={`${montserrat.className} hidden lg:flex items-center absolute top-1/2 -translate-y-1/2 text-gray-700 transition-colors hover:text-gray-900 whitespace-nowrap`}
          style={{
            left: "52.08vw",
            fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
            letterSpacing: "0.04em",
            fontWeight: pathname === "/shop" ? 600 : 400,
            ...(pathname === "/shop" && { color: "#111", fontWeight: 600 }),
          }}
        >
          Shop
        </Link>
        <Link
          href="/collections"
          className={`${montserrat.className} hidden lg:flex items-center absolute top-1/2 -translate-y-1/2 text-gray-700 transition-colors hover:text-gray-900 whitespace-nowrap`}
          style={{
            left: "57.55vw",
            fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
            letterSpacing: "0.04em",
            fontWeight: pathname === "/collections" ? 600 : 400,
            ...(pathname === "/collections" && { color: "#111", fontWeight: 600 }),
          }}
        >
          Collections
        </Link>
        <Link
          href="/custom-order"
          className={`${montserrat.className} hidden lg:flex items-center absolute top-1/2 -translate-y-1/2 text-gray-700 transition-colors hover:text-gray-900 whitespace-nowrap`}
          style={{
            left: "66.4vw",
            fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
            letterSpacing: "0.04em",
            fontWeight: pathname === "/custom-order" ? 600 : 400,
            ...(pathname === "/custom-order" && { color: "#111", fontWeight: 600 }),
          }}
        >
          Customise
        </Link>
        <Link
          href="/contact"
          className={`${montserrat.className} hidden lg:flex items-center absolute top-1/2 -translate-y-1/2 text-gray-700 transition-colors hover:text-gray-900 whitespace-nowrap`}
          style={{
            left: "74.94vw",
            fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
            letterSpacing: "0.04em",
            fontWeight: pathname === "/contact" ? 600 : 400,
            ...(pathname === "/contact" && { color: "#111", fontWeight: 600 }),
          }}
        >
          Contact us
        </Link>
        {/* Home */}
        <Link
          href="/"
          className={`${montserrat.className} hidden lg:flex items-center absolute top-1/2 -translate-y-1/2 text-gray-700 transition-colors hover:text-gray-900 whitespace-nowrap`}
          style={{
            left: "46.04vw",
            fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
            letterSpacing: "0.04em",
            fontWeight: pathname === "/" ? 600 : 400,
            ...(pathname === "/" && { color: "#111", fontWeight: 600 }),
          }}
        >
          Home
        </Link>

        {/* Desktop Icons */}
        {/* Heart Icon */}
        <div
          className="absolute top-1/2 -translate-y-1/2 hidden lg:flex items-center"
          style={{
            left: "83.125vw"
          }}
        >
          <Link 
            href="/wishlist" 
            className="p-2 rounded-lg transition-colors flex items-center justify-center" // removed hover:bg-gray-50
            style={{
              width: "clamp(2rem, 3vw, 2.5rem)",
              height: "clamp(2rem, 3vw, 2.5rem)",
            }}
          >
            <Image
              src="/heart.png"
              alt="Wishlist"
              width={20}
              height={20}
              className="object-contain"
              style={{
                width: "clamp(16px, 2vw, 20px)",
                height: "clamp(16px, 2vw, 20px)",
              }}
            />
          </Link>
        </div>

        {/* Bag Icon */}
        <div
          className="absolute top-1/2 -translate-y-1/2 hidden lg:flex items-center"
          style={{
            left: "86.0416vw"
          }}
        >
          <Link 
            href="/cart" 
            className="relative p-2 rounded-lg transition-colors flex items-center justify-center" // removed hover:bg-gray-50
            style={{
              width: "clamp(2rem, 3vw, 2.5rem)",
              height: "clamp(2rem, 3vw, 2.5rem)",
            }}
          >
            <Image
              src="/bag.png"
              alt="Cart"
              width={20}
              height={20}
              className="object-contain"
              style={{
                width: "clamp(16px, 2vw, 20px)",
                height: "clamp(16px, 2vw, 20px)",
              }}
            />
            {Object.keys(cart).length > 0 && (
              <span
                className="absolute bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white"
                style={{
                  top: '-0.5rem',
                  right: '-0.5rem',
                  minWidth: 'clamp(1rem, 1.5vw, 1.25rem)',
                  height: 'clamp(1rem, 1.5vw, 1.25rem)',
                  fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
                  padding: '0 0.25rem',
                  zIndex: 2
                }}
              >
                {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
              </span>
            )}
          </Link>
        </div>

        {/* User Icon */}
        <div
          className="absolute top-1/2 -translate-y-1/2 hidden lg:flex items-center"
          style={{
            left: "88.95vw"
          }}
        >
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg transition-colors flex items-center justify-center" // removed hover:bg-gray-50
                style={{
                  width: "clamp(2rem, 3vw, 2.5rem)",
                  height: "clamp(2rem, 3vw, 2.5rem)",
                }}
              >
                <Image
                  src="/user.png"
                  alt="User"
                  width={20}
                  height={20}
                  className="object-contain"
                  style={{
                    width: "clamp(16px, 2vw, 20px)",
                    height: "clamp(16px, 2vw, 20px)",
                  }}
                />
              </button>
              
              {/* User Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    {user.email}
                  </div>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                    Your Orders
                  </Link>
                  {user?.email && ["sanskarisamazing@gmail.com", "snp480@gmail.com", "ssp3201@gmail.com", "f20231193@hyderabad.bits-pilani.ac.in"].includes(user.email) && (
                    <Link href="/owner" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                      Owner Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="p-2 rounded-lg transition-colors flex items-center justify-center" // removed hover:bg-gray-50
              style={{
                width: "clamp(2rem, 3vw, 2.5rem)",
                height: "clamp(2rem, 3vw, 2.5rem)",
              }}
            >
              <Image
                src="/user.png"
                alt="User"
                width={20}
                height={20}
                className="object-contain"
                style={{
                  width: "clamp(16px, 2vw, 20px)",
                  height: "clamp(16px, 2vw, 20px)",
                }}
              />
            </Link>
          )}
        </div>

        {/* MOBILE LAYOUT - Fixed Mobile Text Logo */}
        {/* Mobile Logo Container - Centralized approach */}
        <div className="absolute lg:hidden flex items-center top-1/2 -translate-y-1/2 left-4">
          <Link 
            href="/" 
            className="flex items-center space-x-3"
            id="navbar-mobile-logo-link"
          >
            {/* Circle Logo */}
            <div
              className="relative flex items-center justify-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
              }}
            >
              <Image
                src="/circle-logo.png"
                alt="The Loopy Dragon Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Mobile Text Logo - Responsive and optimized */}
            <span
              className={`${arapey.className} select-none`}
              style={{
                fontSize: "clamp(12px, 4vw, 16px)",
                letterSpacing: "clamp(0.08em, 0.15vw, 0.12em)",
                lineHeight: "1.1",
                color: "#000",
                fontWeight: 400,
                whiteSpace: "nowrap",
                textRendering: "optimizeLegibility",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale"
              }}
            >
              THE LOOPY DRAGON
            </span>
          </Link>
        </div>

        {/* Mobile Right Side - Cart and Hamburger Menu */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden flex items-center space-x-2">
          {/* Mobile Cart */}
          <Link 
            href="/cart" 
            className="relative p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-150 flex items-center justify-center touch-manipulation active:scale-95"
            style={{
              minWidth: '2.5rem',
              minHeight: '2.5rem'
            }}
          >
            <Image
              src="/bag.png"
              alt="Cart"
              width={24}
              height={24}
              className="object-contain"
            />
            {Object.keys(cart).length > 0 && (
              <span
                className="absolute bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white"
                style={{
                  top: '-0.375rem',
                  right: '-0.375rem',
                  minWidth: '1.25rem',
                  height: '1.25rem',
                  fontSize: '0.75rem',
                  padding: '0 0.25rem',
                  zIndex: 2
                }}
              >
                {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Menu */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-150 touch-manipulation active:scale-95 flex items-center justify-center"
            style={{
              minWidth: '2.5rem',
              minHeight: '2.5rem'
            }}
            aria-label="Toggle menu"
          >
            <svg 
              className="w-6 h-6 text-gray-700 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{
                transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)'
              }}
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 lg:hidden z-50 animate-fadeIn">
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto">
              <div className="px-4 py-6 space-y-1">
                <div className="space-y-2">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/shop", label: "Shop" },
                    { href: "/collections", label: "Collections" },
                    { href: "/custom-order", label: "Customise" },
                    { href: "/contact", label: "Contact us" },
                    { href: "/wishlist", label: "Wishlist" }
                  ].map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] ${
                        pathname === item.href 
                          ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-semibold border border-purple-200' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {user && (
                    <Link 
                      href="/profile" 
                      className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] ${
                        pathname === '/profile' 
                          ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-semibold border border-purple-200' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Your Orders
                    </Link>
                  )}
                  
                  {user?.email && ["sanskarisamazing@gmail.com", "snp480@gmail.com", "ssp3201@gmail.com", "f20231193@hyderabad.bits-pilani.ac.in"].includes(user.email) && (
                    <Link 
                      href="/owner" 
                      className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] ${
                        pathname === '/owner' 
                          ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-semibold border border-purple-200' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Owner Dashboard
                    </Link>
                  )}
                </div>

                {user ? (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                          <p className="text-xs text-gray-600 truncate max-w-[12.5rem]">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`${montserrat.className} block w-full py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] text-red-600 hover:bg-red-50 hover:text-red-700 text-left`}
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <Link
                      href="/login"
                      className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 text-center`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Login / Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        body {
          background-color: #F5F9FF !important;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-0.625rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        /* Enhanced touch targets for mobile */
        @media (max-width: 1023px) {
          .touch-manipulation {
            touch-action: manipulation;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }
        }

        /* Smooth scrolling for mobile menu */
        @media (max-width: 1023px) {
          .max-h-\[calc\(100vh-5rem\)\] {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .max-h-\[calc\(100vh-5rem\)\]::-webkit-scrollbar {
            display: none;
          }
        }

        /* Ensure proper scaling on ultrawide monitors */
        @media (min-width: 2560px) {
          nav > div {
            max-width: 120rem;
          }
        }

        /* High DPI display adjustments */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          nav {
            backface-visibility: hidden;
            transform: translateZ(0);
          }
        }

        /* Mobile-specific optimizations */
        @media (max-width: 1023px) {
          /* Ensure text doesn't wrap on smaller screens */
          .whitespace-nowrap {
            white-space: nowrap;
          }
          
          /* Better touch targets */
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Prevent text selection on mobile interactive elements */
          button, a {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }

          /* Mobile logo text optimization */
          .mobile-logo-text {
            transform: translateZ(0);
            backface-visibility: hidden;
          }
        }

        /* Very small mobile devices */
        @media (max-width: 360px) {
          /* For very small screens, reduce logo size further */
          .mobile-logo-container {
            transform: scale(0.9);
            transform-origin: left center;
          }
        }

        /* Larger mobile devices and small tablets */
        @media (min-width: 480px) and (max-width: 1023px) {
          /* For larger mobile screens, allow slightly bigger text */
          .mobile-logo-text {
            font-size: clamp(14px, 3.5vw, 18px) !important;
          }
        }
      `}</style>
    </nav>
  );
}