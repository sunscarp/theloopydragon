"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white"
      style={{ height: "5rem" /* 100px * 0.8 / 16 = 5rem */ }}
    >
      <div className="max-w-screen-2xl mx-auto w-full h-full px-[1.6rem]">
        <div className="flex items-center justify-between h-full">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div
                className="relative flex-shrink-0"
                style={{
                  width: "2.72rem", // 54px * 0.8 / 16 = 2.72rem
                  height: "2.72rem",
                }}
              >
                <Image
                  src="/circle-logo.png"
                  alt="The Loopy Dragon Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="2.72rem"
                />
              </div>
              <span
                className={`${arapey.className} hidden sm:block`}
                style={{
                  fontWeight: 400,
                  fontSize: "1.25rem", // 25px * 0.8 / 16 = 1.25rem
                  letterSpacing: "0.16em", // 0.2em * 0.8
                  color: "#000000",
                  marginLeft: "0.79rem", // 15.77px * 0.8 / 16 = 0.79rem
                  lineHeight: "100%",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                THE LOOPY DRAGON
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center" style={{ gap: "2.5rem" /* 50px * 0.8 / 16 = 2.5rem */ }}>
            <Link
              href="/"
              className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
                pathname === "/" ? "text-gray-900 font-semibold" : ""
              }`}
              style={{
                fontWeight: 400,
                letterSpacing: "0.04em", // 0.05em * 0.8
                fontSize: "1rem", // 20px * 0.8 / 16 = 1rem
                height: "1.2rem", // 24px * 0.8 / 16 = 1.2rem
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {pathname === "/" ? <span className="font-bold">Home</span> : "Home"}
            </Link>
            <Link
              href="/shop"
              className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
                pathname === "/shop" ? "text-gray-900 font-semibold" : ""
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
              {pathname === "/shop" ? <span className="font-bold">Shop</span> : "Shop"}
            </Link>
            <Link
              href="/collections"
              className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
                pathname === "/collections" ? "text-gray-900 font-semibold" : ""
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
              {pathname === "/collections" ? <span className="font-bold">Collections</span> : "Collections"}
            </Link>
            <Link
              href="/custom-order"
              className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
                pathname === "/custom-order" ? "text-gray-900 font-semibold" : ""
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
              {pathname === "/custom-order" ? <span className="font-bold">Customise</span> : "Customise"}
            </Link>
            <Link
              href="/contact"
              className={`${montserrat.className} text-gray-700 transition-colors hover:text-[#888888] ${
                pathname === "/contact" ? "text-gray-900 font-semibold" : ""
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
              {pathname === "/contact" ? <span className="font-bold">Contact us</span> : "Contact us"}
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center" style={{ gap: "1.5rem" /* 30px * 0.8 / 16 = 1.5rem */ }}>
            <Link
              href="/wishlist"
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
              style={{
                width: "1.3rem", // 26px * 0.8 / 16 = 1.3rem
                height: "1.3rem",
                padding: "0"
              }}
            >
              <Image
                src="/heart.png"
                alt="Wishlist"
                width={21}
                height={21}
                className="object-contain"
                style={{ width: "1.3rem", height: "1.3rem" }}
              />
            </Link>
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
                width={21}
                height={21}
                className="object-contain"
                style={{ width: "1.3rem", height: "1.3rem" }}
              />
              {Object.keys(cart).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center font-semibold" style={{ fontSize: "0.75rem" }}>
                  {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
                </span>
              )}
            </Link>
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
                    width={21}
                    height={21}
                    className="object-contain"
                    style={{ width: "1.3rem", height: "1.3rem" }}
                  />
                </button>
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
                  width: "1.3rem",
                  height: "1.3rem",
                  padding: "0"
                }}
              >
                <Image
                  src="/user.png"
                  alt="User"
                  width={21}
                  height={21}
                  className="object-contain"
                  style={{ width: "1.3rem", height: "1.3rem" }}
                />
              </Link>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
              style={{
                width: "2rem", // 32px * 0.8 / 16 = 1.6rem, but a bit larger for touch
                height: "2rem"
              }}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
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