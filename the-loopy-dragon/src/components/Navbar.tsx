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
  const contactLinkRef = useRef<HTMLAnchorElement>(null);
  const [iconsLeft, setIconsLeft] = useState<number | null>(null);

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
    // Calculate the left position of the icons relative to the navbar
    function updateIconsLeft() {
      if (contactLinkRef.current) {
        const rect = contactLinkRef.current.getBoundingClientRect();
        const navRect = contactLinkRef.current.closest("nav")?.getBoundingClientRect();
        if (navRect) {
          setIconsLeft(rect.right - navRect.left + 2.5 * 16); // 2.5rem (40px at base font size)
        }
      }
    }
    updateIconsLeft();
    window.addEventListener("resize", updateIconsLeft);
    return () => window.removeEventListener("resize", updateIconsLeft);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  const goToCart = () => {
    router.push("/cart");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white h-[5rem]">
      <div className="relative h-full max-w-screen-2xl mx-auto w-full px-4 lg:px-6">
        {/* Logo */}
        <Link 
          href="/" 
          className="absolute flex items-center top-1/2 -translate-y-1/2"
          style={{ 
            left: "9.74%" // (187 / 1920) * 100%
          }}
          id="navbar-logo-link"
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              width: "2.71rem", // Scaled from 43.384px
              height: "2.71rem",
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
            className={`${arapey.className} hidden sm:block ml-3 text-black`}
            style={{
              fontWeight: 400,
              fontSize: "1.25rem", // 20px
              letterSpacing: "0.16em",
              lineHeight: "100%",
              display: "flex",
              alignItems: "center"
            }}
          >
            <span className="block md:hidden" style={{ fontSize: "0.875rem" }}>
              THE LOOPY DRAGON
            </span>
            <span className="hidden md:block">
              THE LOOPY DRAGON
            </span>
          </span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <div 
          className="absolute hidden lg:flex items-center space-x-10"
          style={{ 
            left: "46%", // Adjusted from (884 / 1920) * 100% for better centering
            top: "1.9rem" // 30.4px
          }}
        >
          <Link 
            href="/" 
            className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
              pathname === '/' ? 'text-gray-900 font-semibold' : ''
            }`}
            style={{
              fontWeight: 400,
              letterSpacing: "0.04em",
              fontSize: "1rem",
              height: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {pathname === '/' ? <span className="font-bold">Home</span> : "Home"}
          </Link>
          <Link 
            href="/shop" 
            className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
              pathname === '/shop' ? 'text-gray-900 font-semibold' : ''
            }`}
            style={{
              fontWeight: 400,
              letterSpacing: "0.04em",
              fontSize: "1rem",
              height: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {pathname === '/shop' ? <span className="font-bold">Shop</span> : "Shop"}
          </Link>
          <Link 
            href="/collections" 
            className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
              pathname === '/collections' ? 'text-gray-900 font-semibold' : ''
            }`}
            style={{
              fontWeight: 400,
              letterSpacing: "0.04em",
              fontSize: "1rem",
              height: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {pathname === '/collections' ? <span className="font-bold">Collections</span> : "Collections"}
          </Link>
          <Link 
            href="/custom-order" 
            className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
              pathname === '/custom-order' ? 'text-gray-900 font-semibold' : ''
            }`}
            style={{
              fontWeight: 400,
              letterSpacing: "0.04em",
              fontSize: "1rem",
              height: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {pathname === '/custom-order' ? <span className="font-bold">Customise</span> : "Customise"}
          </Link>
          <Link 
            href="/contact" 
            className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
              pathname === '/contact' ? 'text-gray-900 font-semibold' : ''
            }`}
            id="contact-link"
            ref={contactLinkRef}
            style={{
              fontWeight: 400,
              letterSpacing: "0.04em",
              fontSize: "1rem",
              height: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {pathname === '/contact' ? <span className="font-bold">Contact us</span> : "Contact us"}
          </Link>
        </div>

        {/* Desktop Right Side Icons & Actions */}
        {iconsLeft !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 hidden lg:flex items-center"
            style={{
              left: `${iconsLeft}px`
            }}
          >
            <div className="flex items-center space-x-6">
              {/* Wishlist/Heart Icon */}
              <Link 
                href="/wishlist" 
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                style={{
                  width: "1.3rem",
                  height: "1.3rem",
                  padding: "0"
                }}
              >
                <Image
                  src="/heart.png"
                  alt="Wishlist"
                  width={20.8}
                  height={20.8}
                  className="object-contain"
                />
              </Link>

              {/* Cart Icon */}
              <Link 
                href="/cart" 
                className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                style={{ 
                  width: "1.3rem",
                  height: "1.3rem",
                  padding: "0"
                }}
              >
                <Image
                  src="/bag.png"
                  alt="Cart"
                  width={20.8}
                  height={20.8}
                  className="object-contain"
                />
                {Object.keys(cart).length > 0 && (
                  <span
                    className="absolute bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg border-2 border-white"
                    style={{
                      top: '-0.625rem',
                      right: '-0.625rem',
                      minWidth: '1.25rem',
                      height: '1.25rem',
                      padding: '0 0.3125rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0.125rem 0.5rem 0 rgba(80,0,80,0.10)',
                      zIndex: 2
                    }}
                  >
                    {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
                  </span>
                )}
              </Link>

              {/* User Icon */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                    style={{
                      width: "1.3rem",
                      height: "1.3rem",
                      padding: "0"
                    }}
                  >
                    <Image
                      src="/user.png"
                      alt="User"
                      width={20.8}
                      height={20.8}
                      className="object-contain"
                    />
                  </button>
                  
                  {/* User Dropdown */}
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-0.1rem w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-0.4rem z-50">
                      <div className="px-0.8rem py-0.4rem text-sm text-gray-500 border-b border-gray-100">
                        {user.email}
                      </div>
                      <Link href="/profile" className="block px-0.8rem py-0.4rem text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        Your Orders
                      </Link>
                      {user?.email && ["sanskarisamazing@gmail.com", "snp480@gmail.com", "ssp3201@gmail.com", "f20231193@hyderabad.bits-pilani.ac.in"].includes(user.email) && (
                        <Link href="/owner" className="block px-0.8rem py-0.4rem text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          Owner Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-0.8rem py-0.4rem text-sm text-red-600 hover:bg-red-50"
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
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                  style={{ 
                    width: "1.3rem",
                    height: "1.3rem",
                    padding: "0"
                  }}
                >
                  <Image
                    src="/user.png"
                    alt="User"
                    width={20.8}
                    height={20.8}
                    className="object-contain"
                  />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Mobile Right Side - Cart and Menu Button */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 lg:hidden flex items-center space-x-3 sm:space-x-4">
          <Link 
            href="/cart" 
            className="relative p-3 hover:bg-gray-50 rounded-xl transition-all duration-150 flex items-center justify-center touch-manipulation active:scale-95"
            style={{
              minWidth: '2.75rem',
              minHeight: '2.75rem'
            }}
          >
            <Image
              src="/bag.png"
              alt="Cart"
              width={32}
              height={32}
              className="object-contain w-7 h-7 sm:w-8 sm:h-8"
            />
            {Object.keys(cart).length > 0 && (
              <span
                className="absolute bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-xs sm:text-sm flex items-center justify-center font-bold shadow-lg border-2 border-white"
                style={{
                  top: '-0.625rem',
                  right: '-0.625rem',
                  minWidth: '1.375rem',
                  height: '1.375rem',
                  padding: '0 0.375rem',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0.125rem 0.5rem 0 rgba(80,0,80,0.10)',
                  zIndex: 2
                }}
              >
                {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
              </span>
            )}
          </Link>

          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-3 hover:bg-gray-50 rounded-xl transition-all duration-150 touch-manipulation active:scale-95 flex items-center justify-center"
            style={{
              minWidth: '2.75rem',
              minHeight: '2.75rem'
            }}
            aria-label="Toggle menu"
          >
            <svg 
              className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700 transition-transform duration-200" 
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
              <div className="px-4 sm:px-6 py-6 space-y-1">
                <div className="space-y-2">
                  <Link 
                    href="/" 
                    className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] ${
                      pathname === '/' 
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-semibold border border-purple-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                     Home
                  </Link>
                  <Link 
                    href="/shop" 
                    className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] ${
                      pathname === '/shop' 
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-semibold border border-purple-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                     Shop
                  </Link>
                  <Link 
                    href="/collections" 
                    className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] ${
                      pathname === '/collections' 
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-semibold border border-purple-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                     Collections
                  </Link>
                  <Link 
                    href="/custom-order" 
                    className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] ${
                      pathname === '/custom-order' 
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-semibold border border-purple-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                     Customise
                  </Link>
                  <Link 
                    href="/contact" 
                    className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] ${
                      pathname === '/contact' 
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-semibold border border-purple-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                     Contact us
                  </Link>
                  <Link 
                    href="/wishlist" 
                    className={`${montserrat.className} block py-3 px-4 rounded-xl transition-all duration-150 font-medium text-base touch-manipulation active:scale-[0.98] ${
                      pathname === '/wishlist' 
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-semibold border border-purple-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                     Wishlist
                  </Link>
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
                          <p className="text-xs text-gray-600 truncate max-w-[200px]">{user.email}</p>
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

        @media (max-width: 1023px) {
          #navbar-logo-link {
            left: 7% !important;
          }
        }
        
        @media (max-width: 640px) {
          .relative.flex.items-center.justify-center {
            width: 2rem !important;
            height: 2rem !important;
          }
          
          #navbar-logo-link span {
            font-size: 1rem !important;
            letter-spacing: 0.13em !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1023px) {
          .relative.flex.items-center.justify-center {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }
          
          #navbar-logo-link span {
            font-size: 1rem !important;
            letter-spacing: 0.14em !important;
          }
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

        /* Ensure consistent spacing on larger screens */
        @media (min-width: 1280px) {
          .space-x-10 > :not(:last-child) {
            margin-right: 2.5rem; /* Replaces fixed 40px */
          }
        }
      `}</style>
    </nav>
  );
}