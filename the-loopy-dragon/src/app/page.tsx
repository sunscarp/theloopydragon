"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabase";

type ProductRow = {
  id: number;
  Product: string;
  Quantity: number;
  Price: number;
};

export const metadata = {
  title: "The Loopy Dragon",
  description:
    "Buy unique, fun, and magical dragon-themed merchandise. Browse our featured products and collections at The Loopy Dragon.",
};

export default function Home() {
  const [cart, setCart] = useState<{ [id: number]: number }>({});
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("Inventory")
        .select("id, Product, Quantity, Price");
      if (error) {
        setProducts([]);
        let msg = "Failed to fetch products: " + error.message;
        if (
          error.message.includes('relation "public.Inventory" does not exist') ||
          error.message.includes('relation "Inventory" does not exist')
        ) {
          msg +=
            "\n\nThis means your Supabase table 'Inventory' does not exist or is not public.\n" +
            "Please:\n" +
            "1. Go to your Supabase dashboard.\n" +
            "2. Ensure there is a table named 'Inventory' (case-sensitive).\n" +
            "3. The table should have columns: id, Product, Quantity, Price.\n" +
            "4. Make sure Row Level Security (RLS) is disabled or a public select policy is enabled.";
        }
        setErrorMsg(msg);
        console.error("Supabase error:", error);
      } else if (data) {
        setProducts(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("products", JSON.stringify(data));
        }
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // On mount, always load cart from localStorage and listen for changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch {}
      }
      // Listen for cart changes from other tabs/pages
      const handleStorage = (e: StorageEvent) => {
        if (e.key === "cart") {
          try {
            setCart(e.newValue ? JSON.parse(e.newValue) : {});
          } catch {
            setCart({});
          }
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = (id: number) => {
    const productToAdd = products.find((p) => p.id === id);
    if (!productToAdd) return;

    setCart((prev) => {
      const updated = {
        ...prev,
        [id]: (prev[id] || 0) + 1,
      };
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const goToCart = () => {
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans scroll-smooth">
      {/* Navbar */}
      <nav className="w-full bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-xl font-bold text-green-700 dark:text-green-400 mb-3 sm:mb-0">
            The Loopy Dragon
          </span>
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-gray-700 dark:text-gray-200 text-sm font-medium items-center">
            <li>
              <Link
                href="/about"
                className="hover:text-green-600 transition"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/collections"
                className="hover:text-green-600 transition"
              >
                Collections
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-green-600 transition"
              >
                Contact Us
              </Link>
            </li>
            {user ? (
              <>
                <li className="text-sm text-gray-600">{user.email}</li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="hover:text-green-600 transition"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" className="hover:text-green-600 transition">
                  Login
                </Link>
              </li>
            )}
            <li>
              <button
                onClick={goToCart}
                className="relative flex items-center hover:text-green-600 transition bg-transparent border-none outline-none"
                style={{ background: "none" }}
              >
                <span className="material-symbols-outlined align-middle">
                  shopping_cart
                </span>
                <span className="ml-1">Cart</span>
                {Object.keys(cart).length > 0 && (
                  <span className="ml-1 bg-green-600 text-white rounded-full px-2 text-xs">
                    {Object.values(cart).reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 py-8 sm:py-16 px-4 flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-green-900 dark:text-green-100 mb-4 text-center">
          Dragon-Themed Merchandise & Gifts
        </h1>
        <p className="text-lg text-green-800 dark:text-green-200 mb-6 text-center max-w-xl">
          Discover unique, fun, and magical dragon-themed merchandise for everyone!
        </p>
        <Link
          href="/collections"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold shadow transition"
        >
          View Collections
        </Link>
      </section>

      {/* Product Grid */}
      <section className="max-w-5xl mx-auto py-8 sm:py-16 px-4" id="products">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">
          Featured Products
        </h2>
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        ) : errorMsg ? (
          <div className="text-red-500 whitespace-pre-line">{errorMsg}</div>
        ) : products.length === 0 ? (
          <div className="text-red-500">
            No products found.<br />
            Please check your Supabase table name and columns.<br />
            <span className="text-xs">
              If you just created the table, make sure it has at least one row of data.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-center justify-center overflow-hidden">
                  <span className="text-4xl" role="img" aria-label={product.Product}>
                    🐉
                  </span>
                </div>
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {product.Product}
                </div>
                <div className="text-gray-600 dark:text-gray-300 mb-2">
                  ₹{product.Price.toFixed(2)}
                </div>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition"
                  onClick={() => addToCart(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} The Loopy Dragon &mdash; All rights
        reserved.
      </footer>
    </div>
  );
}
