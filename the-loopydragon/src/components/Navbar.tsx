import Link from "next/link";
import { useRouter } from "next/router";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { pathname } = useRouter();
  const { cart } = useCart();

  return (
    <nav className="w-full bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between px-4 py-2">
        <Link href="/" className="text-xl font-bold text-green-700 dark:text-green-400 hover:text-green-600 transition-colors">
          The Loopy Dragon
        </Link>
        <ul className="flex items-center gap-4 text-gray-700 dark:text-gray-200 text-sm font-medium">
          {[
            { href: "/", label: "Home" },
            { href: "/collections", label: "Collections" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
            { href: "/custom-order", label: "Custom Order" },
            { href: "/profile", label: "Your Orders" },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`hover:text-green-600 transition-colors ${pathname === href ? "text-green-600 font-semibold" : ""}`}>
                {label}
              </Link>
            </li>
          ))}
          {/* ...existing user/login/cart code... */}
        </ul>
      </div>
    </nav>
  );
}