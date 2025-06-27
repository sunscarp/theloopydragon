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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  const cartItemCount = Object.values(cart).reduce((a: number, b: number) => a + b, 0);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100"
      style={{ 
        background: "#F5F9FF",
        boxShadow: "0 0 0 0 #F5F9FF"
      }}
    >
      <div 
        className="h-20 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8" 
        style={{ background: "#F5F9FF" }}
      >
        {/* DESKTOP LAYOUT (lg and above) */}
        <div className="hidden lg:grid items-center h-full gap-4" style={{ gridTemplateColumns: '1fr 3fr 0.8fr' }}>
          {/* Left Section: Logo + Brand Name */}
          <div className="flex items-center justify-start pl-8 xl:pl-12 2xl:pl-16">
            <Link 
              href="/" 
              className="flex items-center"
              id="navbar-logo-link"
            >
              <div
                className="relative flex items-center justify-center mr-3"
                style={{
                  width: "clamp(52px, 2.5vw, 44px)",
                  height: "clamp(32px, 2.5vw, 44px)",
                  minWidth: "32px",
                  minHeight: "32px",
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
              <span
                className={`${arapey.className}`}
                style={{
                  fontSize: "clamp(16px, 1.3vw, 20px)",
                  letterSpacing: "clamp(0.09em, 0.13vw, 0.16em)",
                  lineHeight: "100%",
                  color: "#000",
                  fontWeight: 400,
                  whiteSpace: "nowrap"
                }}
              >
                THE LOOPY DRAGON
              </span>
            </Link>
          </div>

          {/* Center/Right Section: Navigation Links - Moved close to icons */}
          <div className="flex items-center justify-end pr-4">
            <div className="flex items-center space-x-6 xl:space-x-8">
              {[
                { href: "/", label: "Home" },
                { href: "/shop", label: "Shop" },
                { href: "/custom-order", label: "Customise" },
                { href: "/profile", label: "Your Orders" },
                { href: "/contact", label: "Contact us" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${montserrat.className} text-gray-700 transition-colors hover:text-gray-900 whitespace-nowrap`}
                  style={{
                    fontSize: "clamp(0.875rem, 1.1vw, 1rem)",
                    letterSpacing: "0.04em",
                    fontWeight: pathname === item.href ? 600 : 400,
                    color: pathname === item.href ? "#111" : undefined,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: Icons */}
          <div className="flex items-center justify-start space-x-2 pl-2">
            {/* Cart Icon */}
            <Link 
              href="/cart" 
              className="relative p-2 rounded-lg transition-colors flex items-center justify-center"
              style={{
                width: "clamp(2rem, 2.5vw, 2.5rem)",
                height: "clamp(2rem, 2.5vw, 2.5rem)"
              }}
            >
              <Image
                src="/bag.png"
                alt="Cart"
                width={20}
                height={20}
                className="object-contain"
                style={{
                  width: "clamp(18px, 1.8vw, 20px)",
                  height: "clamp(18px, 1.8vw, 20px)",
                }}
              />
              {cartItemCount > 0 && (
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
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Icon */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-lg transition-colors flex items-center justify-center"
                    style={{
                      width: "clamp(2rem, 2.5vw, 2.5rem)",
                      height: "clamp(2rem, 2.5vw, 2.5rem)",
                    }}
                  >
                    <Image
                      src="/user.png"
                      alt="User"
                      width={20}
                      height={20}
                      className="object-contain"
                      style={{
                        width: "clamp(18px, 1.8vw, 20px)",
                        height: "clamp(18px, 1.8vw, 20px)",
                      }}
                    />
                  </button>
                  
                  {/* User Dropdown */}
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100 truncate">
                        {user.email}
                      </div>
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" 
                        onClick={() => setMenuOpen(false)}
                      >
                        Your Orders
                      </Link>
                      {user?.email && ["sanskarisamazing@gmail.com", "snp480@gmail.com", "ssp3201@gmail.com", "f20231193@hyderabad.bits-pilani.ac.in"].includes(user.email) && (
                        <Link 
                          href="/owner" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" 
                          onClick={() => setMenuOpen(false)}
                        >
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
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="p-2 rounded-lg transition-colors flex items-center justify-center"
                  style={{
                    width: "clamp(2rem, 2.5vw, 2.5rem)",
                    height: "clamp(2rem, 2.5vw, 2.5rem)",
                  }}
                >
                  <Image
                    src="/user.png"
                    alt="User"
                    width={20}
                    height={20}
                    className="object-contain"
                    style={{
                      width: "clamp(18px, 1.8vw, 20px)",
                      height: "clamp(18px, 1.8vw, 20px)",
                    }}
                  />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* TABLET LAYOUT (md to lg) */}
        <div className="hidden md:flex lg:hidden items-center justify-between h-full px-2">
          {/* Left: Logo + Brand - Moved further inward */}
          <div className="flex items-center flex-shrink-0 pl-6">
            <Link 
              href="/" 
              className="flex items-center"
              id="navbar-tablet-logo-link"
            >
              <div
                className="relative flex items-center justify-center mr-3"
                style={{
                  width: "38px",
                  height: "38px",
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
              <span
                className={`${arapey.className} select-none`}
                style={{
                  fontSize: "18px",
                  letterSpacing: "0.12em",
                  lineHeight: "1.1",
                  color: "#000",
                  fontWeight: 400,
                  whiteSpace: "nowrap"
                }}
              >
                THE LOOPY DRAGON
              </span>
            </Link>
          </div>

          {/* Right: Icons + Menu - Moved further inward */}
          <div className="flex items-center space-x-3 pr-6">
            {/* Cart Icon */}
            <Link 
              href="/cart" 
              className="relative p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-150 flex items-center justify-center"
              style={{
                minWidth: '2.5rem',
                minHeight: '2.5rem'
              }}
            >
              <Image
                src="/bag.png"
                alt="Cart"
                width={22}
                height={22}
                className="object-contain"
              />
              {cartItemCount > 0 && (
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
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Hamburger Menu */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-150 flex items-center justify-center"
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
        </div>

        {/* MOBILE LAYOUT (below md) */}
        <div className="flex md:hidden items-center justify-between h-full px-1 sm:px-2">
          {/* Left: Logo + Brand - Moved further inward */}
          <div className="flex items-center flex-shrink-0 pl-4 sm:pl-6">
            <Link 
              href="/" 
              className="flex items-center"
              id="navbar-mobile-logo-link"
            >
              <div
                className="relative flex items-center justify-center mr-2.5 sm:mr-3"
                style={{
                  width: "clamp(32px, 8vw, 38px)",
                  height: "clamp(32px, 8vw, 38px)",
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
              <span
                className={`${arapey.className} select-none`}
                style={{
                  fontSize: "clamp(13px, 4.5vw, 18px)",
                  letterSpacing: "clamp(0.08em, 0.15vw, 0.12em)",
                  lineHeight: "1.1",
                  color: "#000",
                  fontWeight: 400,
                  whiteSpace: "nowrap"
                }}
              >
                THE LOOPY DRAGON
              </span>
            </Link>
          </div>

          {/* Right: Cart + Menu - Moved further inward */}
          <div className="flex items-center space-x-1 sm:space-x-2 pr-4 sm:pr-6">
            {/* Mobile Cart */}
            <Link 
              href="/cart" 
              className="relative p-2 sm:p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-150 flex items-center justify-center touch-manipulation active:scale-95"
              style={{
                minWidth: '2.25rem',
                minHeight: '2.25rem'
              }}
            >
              <Image
                src="/bag.png"
                alt="Cart"
                width={22}
                height={22}
                className="object-contain"
                style={{
                  width: "clamp(20px, 5vw, 24px)",
                  height: "clamp(20px, 5vw, 24px)"
                }}
              />
              {cartItemCount > 0 && (
                <span
                  className="absolute bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white"
                  style={{
                    top: '-0.25rem',
                    right: '-0.25rem',
                    minWidth: '1.125rem',
                    height: '1.125rem',
                    fontSize: '0.7rem',
                    padding: '0 0.2rem',
                    zIndex: 2
                  }}
                >
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Menu */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="p-2 sm:p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-150 touch-manipulation active:scale-95 flex items-center justify-center"
              style={{
                minWidth: '2.25rem',
                minHeight: '2.25rem'
              }}
              aria-label="Toggle menu"
            >
              <svg 
                className="text-gray-700 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  width: "clamp(22px, 5vw, 26px)",
                  height: "clamp(22px, 5vw, 26px)",
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
        </div>

        {/* Mobile/Tablet Menu Dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 lg:hidden z-50 animate-fadeIn">
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto">
              <div className="px-4 py-6 space-y-1">
                <div className="space-y-2">
                  {/*
                    Removed wishlist from mobile/tablet menu
                  */}
                  {[
                    { href: "/", label: "Home" },
                    { href: "/shop", label: "Shop" },
                    { href: "/custom-order", label: "Customise" },
                    { href: "/profile", label: "Your Orders" },
                    { href: "/contact", label: "Contact us" }
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
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
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

        /* iPad specific optimizations */
        @media (min-width: 768px) and (max-width: 1024px) {
          /* iPad Portrait and Landscape */
          .hidden.md\\:flex.lg\\:hidden {
            padding: 0 1rem;
          }
        }

        /* iPad Pro specific optimizations */
        @media (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
          /* iPad Pro Landscape - ensure desktop layout works properly */
          .hidden.lg\\:grid {
            padding: 0 2rem;
          }
        }

        /* Mobile landscape optimizations */
        @media (max-height: 500px) and (orientation: landscape) {
          /* Mobile landscape - reduce padding */
          .flex.md\\:hidden {
            padding: 0 0.75rem;
          }
          
          .h-20 {
            height: 4rem !important;
          }
        }

        /* Very small mobile devices */
        @media (max-width: 360px) {
          /* Ensure content fits on very small screens */
          .flex.items-center:first-child {
            transform: scale(0.95);
            transform-origin: left center;
          }
        }

        /* Large mobile devices and small tablets */
        @media (min-width: 480px) and (max-width: 767px) {
          /* Allow slightly bigger elements on larger mobile screens */
          .flex.md\\:hidden .space-x-1 {
            gap: 0.5rem;
          }
        }

        /* Desktop optimizations */
        @media (min-width: 1280px) {
          /* Ensure proper spacing on large desktops */
          .hidden.lg\\:grid .space-x-6 {
            gap: 2rem;
          }
        }

        /* Ultra-wide desktop optimizations */
        @media (min-width: 1920px) {
          /* Prevent elements from becoming too large on big screens */
          .max-w-screen-2xl {
            padding-left: 3rem;
            padding-right: 3rem;
          }
        }

        /* Orientation change handling */
        @media (orientation: portrait) {
          /* Portrait specific adjustments */
          .md\\:flex.lg\\:hidden .flex.items-center.space-x-3 {
            gap: 0.75rem;
          }
        }

        @media (orientation: landscape) {
          /* Landscape specific adjustments */
          .md\\:flex.lg\\:hidden .flex.items-center.space-x-3 {
            gap: 1rem;
          }
        }

        /* Additional adjustments for better spacing */
        @media (min-width: 1024px) and (max-width: 1279px) {
          /* Adjust for smaller desktop screens */
          .pl-8 {
            padding-left: 1.5rem;
          }
        }

        @media (min-width: 1280px) {
          /* Larger desktop screens */
          .xl\\:pl-12 {
            padding-left: 2rem;
          }
        }
      `}</style>
    </nav>
  );
}