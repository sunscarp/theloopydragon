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
          setIconsLeft(rect.right - navRect.left + 50); // 50px to the right of Contact us
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white h-[100px]">
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
              width: "54.23px",
              height: "54.23px",
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
              fontSize: "25px",
              letterSpacing: "0.2em",
              color: "#000000",
              marginLeft: "15.77px",
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
            top: "38px"
          }}
        >
          <Link 
            href="/" 
            className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
              pathname === '/' ? 'text-gray-900 font-semibold' : ''
            }`}
            style={{
              fontWeight: 400,
              letterSpacing: "0.05em",
              fontSize: "20px",
              width: "auto",
              height: "24px",
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
              letterSpacing: "0.05em",
              fontSize: "20px",
              width: "auto",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "50px"
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
              letterSpacing: "0.05em",
              fontSize: "20px",
              width: "auto",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "50px"
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
              letterSpacing: "0.05em",
              fontSize: "20px",
              width: "auto",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "50px"
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
              letterSpacing: "0.05em",
              fontSize: "20px",
              width: "auto",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "50px"
            }}
          >
            {pathname === '/contact' ? <span className="font-bold">Contact us</span> : "Contact us"}
          </Link>
        </div>

        {/* Right Side Icons & Actions - Positioned 50px to the right of Contact Us */}
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
                  width: "26px",
                  height: "26px",
                  padding: "0"
                }}
              >
                <Image
                  src="/heart.png"
                  alt="Wishlist"
                  width={26}
                  height={26}
                  className="object-contain"
                />
              </Link>

              {/* Cart Icon */}
              <Link 
                href="/cart" 
                className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                style={{ 
                  marginLeft: "30px",
                  width: "26px",
                  height: "26px",
                  padding: "0"
                }}
              >
                <Image
                  src="/bag.png"
                  alt="Cart"
                  width={26}
                  height={26}
                  className="object-contain"
                />
                {Object.keys(cart).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-semibold">
                    {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
                  </span>
                )}
              </Link>

              {/* User Icon */}
              {user ? (
                <div className="relative" style={{ marginLeft: "30px" }}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                    style={{
                      width: "26px",
                      height: "26px",
                      padding: "0"
                    }}
                  >
                    <Image
                      src="/user.png"
                      alt="User"
                      width={26}
                      height={26}
                      className="object-contain"
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
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
                  style={{ 
                    marginLeft: "30px",
                    width: "26px",
                    height: "26px",
                    padding: "0"
                  }}
                >
                  <Image
                    src="/user.png"
                    alt="User"
                    width={26}
                    height={26}
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
          className="lg:hidden absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 py-4 px-4 lg:hidden z-50">
            <div className="space-y-3">
              <Link href="/" className="block py-2 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link href="/shop" className="block py-2 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Shop
              </Link>
              <Link href="/collections" className="block py-2 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Collections
              </Link>
              <Link href="/custom-order" className="block py-2 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Customise
              </Link>
              <Link href="/contact" className="block py-2 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Contact us
              </Link>
              <Link href="/about" className="block py-2 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                About
              </Link>
              <Link href="/profile" className="block py-2 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                Your Orders
              </Link>
              {user?.email && ["sanskarisamazing@gmail.com", "snp480@gmail.com", "ssp3201@gmail.com", "f20231193@hyderabad.bits-pilani.ac.in"].includes(user.email) && (
                <Link href="/owner" className="block py-2 text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMenuOpen(false)}>
                  Owner Dashboard
                </Link>
              )}
              {user ? (
                <>
                  <div className="pt-3 border-t border-gray-100">
                    <span className="block py-2 text-sm text-gray-500">{user.email}</span>
                    <button
                      onClick={handleLogout}
                      className="block py-2 text-red-600 hover:text-red-700 font-medium"
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block py-2 text-gray-700 hover:text-gray-900 font-medium"
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