"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

type CollectionProduct = {
  id: number;
  Product: string;
  price: number;
};

type SupabaseCollectionRow = {
  id: number;
  Inventory: {
    Product: string;
    Price: number;
  }[];
};

export default function Collections() {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<{ [id: number]: number }>({});
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Auth check effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch {}
      }
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
    async function fetchCollections() {
      setLoading(true);
      const { data, error } = await supabase
        .from('Collections')
        .select(`
          id,
          Inventory:Inventory!Collections_id_fkey (
            Product,
            Price
          )
        `);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        // Inventory is an array, so use the first element
        const formattedData = data.map((item: any) => ({
          id: item.id,
          Product: item.Inventory && item.Inventory[0]?.Product,
          price: item.Inventory && item.Inventory[0]?.Price
        }));
        setProducts(formattedData);
      }
      setLoading(false);
    }

    fetchCollections();
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

  const goToCart = () => {
    router.push("/cart");
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-300">Loading collections...</div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-red-500">Error: {error}</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="w-full bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-xl font-bold text-green-700 dark:text-green-400 mb-3 sm:mb-0">
            The Loopy Dragon
          </span>
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-gray-700 dark:text-gray-200 text-sm font-medium items-center">
            <li key="home"><Link href="/">Home</Link></li>
            <li key="about"><Link href="/about">About Us</Link></li>
            <li key="contact"><Link href="/contact">Contact Us</Link></li>
            {user ? (
              <>
                <li key="email" className="text-sm text-gray-600">{user.email}</li>
                <li key="logout">
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="hover:text-green-600 transition"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li key="login">
                <Link href="/login" className="hover:text-green-600 transition">
                  Login
                </Link>
              </li>
            )}
            <li key="cart">
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
      <main className="max-w-5xl mx-auto py-8 sm:py-16 px-4 flex-1">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">
          Our Collections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
                <span className="text-4xl">🐉</span>
              </div>
              <div className="font-medium text-gray-800 dark:text-gray-100">
                {product.Product}
              </div>
              <div className="text-gray-600 dark:text-gray-300 mb-2">
                ₹{product.price.toFixed(2)}
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
      </main>
      <footer className="bg-white dark:bg-gray-800 py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} The Loopy Dragon
      </footer>
    </div>
  );
}
