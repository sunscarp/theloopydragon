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
          setIconsLeft(rect.right - navRect.left + 40); // Scaled from 50px to 40px (50 * 0.8)
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white h-[80px]">
      <div className="relative h-full max-w-[1920px] mx-auto w-full">
        {/* Logo */}
        <Link 
          href="/" 
          className="absolute flex items-center top-1/2 -translate-y-1/2"
          style={{ 
            left: `${(187 / 1920) * 100}%`
          }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              width: "43.384px", // Scaled from 54.23px (54.23 * 0.8)
              height: "43.384px", // Scaled from 54.23px
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
            className={`${arapey.className} hidden sm:block`}
            style={{
              fontWeight: 400,
              fontSize: "20px", // Scaled from 25px (25 * 0.8)
              letterSpacing: "0.16em", // Scaled from 0.2em (0.2 * 0.8)
              color: "#000000",
              marginLeft: "12.616px", // Scaled from 15.77px (15.77 * 0.8)
              lineHeight: "100%",
              display: "flex",
              alignItems: "center"
            }}
          >
            THE LOOPY DRAGON
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div 
          className="absolute flex items-center"
          style={{ 
            left: `${(884 / 1920) * 100}%`,
            top: "30.4px" // Scaled from 38px (38 * 0.8)
          }}
        >
          <Link 
            href="/" 
            className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
              pathname === '/' ? 'text-gray-900 font-semibold' : ''
            }`}
            style={{
              fontWeight: 400,
              letterSpacing: "0.04em", // Scaled from 0.05em (0.05 * 0.8)
              fontSize: "16px", // Scaled from 20px (20 * 0.8)
              width: "auto",
              height: "19.2px", // Scaled from 24px (24 * 0.8)
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
              letterSpacing: "0.04em", // Scaled from 0.05em
              fontSize: "16px", // Scaled from 20px
              width: "auto",
              height: "19.2px", // Scaled from 24px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "40px" // Scaled from 50px (50 * 0.8)
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
              letterSpacing: "0.04em", // Scaled from 0.05em
              fontSize: "16px", // Scaled from 20px
              width: "auto",
              height: "19.2px", // Scaled from 24px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "40px" // Scaled from 50px
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
              letterSpacing: "0.04em", // Scaled from 0.05em
              fontSize: "16px", // Scaled from 20px
              width: "auto",
              height: "19.2px", // Scaled from 24px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "40px" // Scaled from 50px
            }}
          >
            {pathname === '/custom-order' ? <span className="font-bold">Customise</span> : "Customise"}
          </Link>
          {/* Contact Us reference point */}
          <Link 
            href="/contact" 
            className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
              pathname === '/contact' ? 'text-gray-900 font-semibold' : ''
            }`}
            id="contact-link"
            ref={contactLinkRef}
            style={{
              fontWeight: 400,
              letterSpacing: "0.04em", // Scaled from 0.05em
              fontSize: "16px", // Scaled from 20px
              width: "auto",
              height: "19.2px", // Scaled from 24px
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "40px" // Scaled from 50px
            }}
          >
            {pathname === '/contact' ? <span className="font-bold">Contact us</span> : "Contact us"}
          </Link>
        </div>

        {/* Right Side Icons & Actions - Positioned 40px to the right of Contact Us */}
        {iconsLeft !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 flex items-center"
            style={{
              left: `${iconsLeft}px`
            }}
          >
            <div className="flex items-center">
              {/* Wishlist/Heart Icon */}
              <Link 
                href="/wishlist" 
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                style={{
                  width: "20.8px", // Scaled from 26px (26 * 0.8)
                  height: "20.8px", // Scaled from 26px
                  padding: "0"
                }}
              >
                <Image
                  src="/heart.png"
                  alt="Wishlist"
                  width={20.8} // Scaled from 26
                  height={20.8} // Scaled from 26
                  className="object-contain"
                />
              </Link>

              {/* Cart Icon */}
              <Link 
                href="/cart" 
                className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                style={{ 
                  marginLeft: "24px", // Scaled from 30px (30 * 0.8)
                  width: "20.8px", // Scaled from 26px
                  height: "20.8px", // Scaled from 26px
                  padding: "0"
                }}
              >
                <Image
                  src="/bag.png"
                  alt="Cart"
                  width={20.8} // Scaled from 26
                  height={20.8} // Scaled from 26
                  className="object-contain"
                />
                {Object.keys(cart).length > 0 && (
                  <span className="absolute -top-0.8 -right-0.8 bg-purple-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center font-semibold">
                    {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
                  </span>
                )}
              </Link>

              {/* User Icon */}
              {user ? (
                <div className="relative" style={{ marginLeft: "24px" }}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                    style={{
                      width: "20.8px", // Scaled from 26px
                      height: "20.8px", // Scaled from 26px
                      padding: "0"
                    }}
                  >
                    <Image
                      src="/user.png"
                      alt="User"
                      width={20.8} // Scaled from 26
                      height={20.8} // Scaled from 26
                      className="object-contain"
                    />
                  </button>
                  
                  {/* User Dropdown */}
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1.6 w-38.4 bg-white rounded-lg shadow-lg border border-gray-200 py-1.6 z-50">
                      <div className="px-3.2 py-1.6 text-sm text-gray-500 border-b border-gray-100">
                        {user.email}
                      </div>
                      <Link href="/profile" className="block px-3.2 py-1.6 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                        Your Orders
                      </Link>
                      {user?.email && ["sanskarisamazing@gmail.com", "snp480@gmail.com", "ssp3201@gmail.com", "f20231193@hyderabad.bits-pilani.ac.in"].includes(user.email) && (
                        <Link href="/owner" className="block px-3.2 py-1.6 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
                          Owner Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3.2 py-1.6 text-sm text-red-600 hover:bg-red-50"
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
                    marginLeft: "24px", // Scaled from 30px
                    width: "20.8px", // Scaled from 26px
                    height: "20.8px", // Scaled from 26px
                    padding: "0"
                  }}
                >
                  <Image
                    src="/user.png"
                    alt="User"
                    width={20.8} // Scaled from 26
                    height={20.8} // Scaled from 26
                    className="object-contain"
                  />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="lg:hidden absolute right-3.2 top-1/2 transform -translate-y-1/2 p-1.6 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 py-3.2 px-3.2 lg:hidden z-50">
            <div className="space-y-2.4">
              <Link href="/" className="block py-1.6 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link href="/shop" className="block py-1.6 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Shop
              </Link>
              <Link href="/collections" className="block py-1.6 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Collections
              </Link>
              <Link href="/custom-order" className="block py-1.6 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Customise
              </Link>
              <Link href="/contact" className="block py-1.6 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Contact us
              </Link>
              <Link href="/about" className="block py-1.6 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                About
              </Link>
              <Link href="/profile" className="block py-1.6 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Your Orders
              </Link>
              {user?.email && ["sanskarisamazing@gmail.com", "snp480@gmail.com", "ssp3201@gmail.com", "f20231193@hyderabad.bits-pilani.ac.in"].includes(user.email) && (
                <Link href="/owner" className="block py-1.6 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                  Owner Dashboard
                </Link>
              )}
              {user ? (
                <>
                  <div className="pt-2.4 border-t border-gray-100">
                    <span className="block py-1.6 text-sm text-gray-500">{user.email}</span>
                    <button
                      onClick={handleLogout}
                      className="block py-1.6 text-red-600 hover:text-red-700 font-medium"
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block py-1.6 text-gray-700 hover:text-gray-900 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}