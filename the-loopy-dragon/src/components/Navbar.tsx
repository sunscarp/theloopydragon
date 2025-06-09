"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

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

  const goToCart = () => {
    router.push("/cart");
  };

  return (
    <nav className="mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
          🧶 The Loopy Dragon
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-8">
          <Link href="/" className="hover:text-green-700 dark:hover:text-green-300">Home</Link>
          <Link href="/collections" className="hover:text-green-700 dark:hover:text-green-300">Collections</Link>
          <Link href="/custom-order" className="hover:text-green-700 dark:hover:text-green-300">Custom Order</Link>
          <Link href="/about" className="hover:text-green-700 dark:hover:text-green-300">About</Link>
          <Link href="/contact" className="hover:text-green-700 dark:hover:text-green-300">Contact</Link>
          <Link href="/profile" className="hover:text-green-700 dark:hover:text-green-300">Your Orders</Link>
          {/* Owner Dashboard Link - Only show for authorized email */}
          {user?.email && ["sanskarisamazing@gmail.com", "snp480@gmail.com", "ssp3201@gmail.com", "f20231193@hyderabad.bits-pilani.ac.in"].includes(user.email) && (
            <Link href="/owner" className="hover:text-green-700 dark:hover:text-green-300">Owner Dashboard</Link>
          )}
          {/* Cart Icon */}
          <Link href="/cart" className="relative">
            <Image
              src="/cart.png"
              alt="Cart"
              width={28}
              height={28}
              className="inline-block align-middle"
              priority={false}
            />
            {Object.keys(cart).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
              </span>
            )}
          </Link>
          {user ? (
            <>
              {/* <span className="text-xs text-gray-500 dark:text-gray-300 px-2">{user.email}</span> */}
              <button
                onClick={handleLogout}
                className="hover:text-red-600 dark:hover:text-red-400 transition"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-full text-sm transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden items-center gap-4">
          {/* Cart Icon */}
          <Link href="/cart" className="relative">
            <Image
              src="/cart.png"
              alt="Cart"
              width={28}
              height={28}
              className="inline-block align-middle"
              priority={false}
            />
            {Object.keys(cart).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {Object.values(cart).reduce((a: number, b: number) => a + b, 0)}
              </span>
            )}
          </Link>
          {/* Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 dark:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t dark:border-gray-700 py-2 px-4 sm:hidden z-50">
            <Link href="/" className="block py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/collections" className="block py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400" onClick={() => setMenuOpen(false)}>Collections</Link>
            <Link href="/custom-order" className="block py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400" onClick={() => setMenuOpen(false)}>Custom Order</Link>
            <Link href="/about" className="block py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/contact" className="block py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/profile" className="block py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400" onClick={() => setMenuOpen(false)}>Your Orders</Link>
            {user?.email && ["sanskarisamazing@gmail.com", "snp480@gmail.com", "ssp3201@gmail.com", "f20231193@hyderabad.bits-pilani.ac.in"].includes(user.email) && (
              <Link href="/owner" className="block py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400" onClick={() => setMenuOpen(false)}>Owner Dashboard</Link>
            )}
            {user ? (
              <>
                <span className="py-2 px-2 text-xs text-gray-500 dark:text-gray-300">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="py-2 px-2 rounded text-left hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
