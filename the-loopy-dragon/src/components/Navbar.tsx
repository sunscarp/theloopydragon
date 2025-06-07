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
    <nav className="w-full bg-white dark:bg-gray-900 shadow-md z-30 relative">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-green-700 dark:text-green-300">
          The Loopy Dragon
        </Link>
        {/* Hamburger for mobile */}
        <button
          className="sm:hidden flex items-center px-3 py-2 rounded text-green-700 dark:text-green-300 focus:outline-none"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="text-2xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
        {/* Desktop nav links */}
        <div className="hidden sm:flex gap-4 items-center">
          <Link href="/" className="hover:text-green-700 dark:hover:text-green-300">Home</Link>
          <Link href="/collections" className="hover:text-green-700 dark:hover:text-green-300">Collections</Link>
          <Link href="/custom-order" className="hover:text-green-700 dark:hover:text-green-300">Custom Order</Link>
          <Link href="/about" className="hover:text-green-700 dark:hover:text-green-300">About</Link>
          <Link href="/contact" className="hover:text-green-700 dark:hover:text-green-300">Contact</Link>
          <Link href="/profile" className="hover:text-green-700 dark:hover:text-green-300">Your Orders</Link>
          {user ? (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-300 px-2">{user.email}</span>
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
          <Link
            href="/cart"
            className="relative flex items-center hover:text-green-600 transition-colors bg-transparent border-none outline-none group"
            aria-label="Cart"
          >
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
        </div>
      </div>
      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg z-40 animate-fade-in">
          <div className="flex flex-col py-2 px-4 gap-2">
            <Link href="/" className="py-2 px-2 rounded hover:bg-green-100 dark:hover:bg-green-900" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/collections" className="py-2 px-2 rounded hover:bg-green-100 dark:hover:bg-green-900" onClick={() => setMenuOpen(false)}>Collections</Link>
            <Link href="/custom-order" className="py-2 px-2 rounded hover:bg-green-100 dark:hover:bg-green-900" onClick={() => setMenuOpen(false)}>Custom Order</Link>
            <Link href="/about" className="py-2 px-2 rounded hover:bg-green-100 dark:hover:bg-green-900" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/contact" className="py-2 px-2 rounded hover:bg-green-100 dark:hover:bg-green-900" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/profile" className="py-2 px-2 rounded hover:bg-green-100 dark:hover:bg-green-900" onClick={() => setMenuOpen(false)}>Your Orders</Link>
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
                className="py-2 px-2 rounded hover:bg-green-100 dark:hover:bg-green-900"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
            <Link href="/cart" className="py-2 px-2 rounded hover:bg-green-100 dark:hover:bg-green-900" onClick={() => setMenuOpen(false)}>Cart</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
