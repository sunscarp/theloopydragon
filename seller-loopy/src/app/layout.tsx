"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Arapey, Montserrat } from "next/font/google";
import {
  Store, LogOut, Package, ShoppingBag, LayoutDashboard, Settings, Wallet,
  Menu, X, HelpCircle, Receipt,
} from "lucide-react";
import Link from "next/link";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const arapey = Arapey({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-arapey",
});

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-violet-500 to-purple-500" },
  { href: "/dashboard/products", label: "Products", icon: Package, color: "from-blue-500 to-cyan-500" },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag, color: "from-emerald-500 to-teal-500" },
  { href: "/dashboard/transactions", label: "Transactions", icon: Wallet, color: "from-green-500 to-emerald-500" },
  { href: "/dashboard/financials", label: "Financials", icon: Receipt, color: "from-teal-500 to-emerald-500" },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle, color: "from-purple-500 to-pink-500" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, color: "from-amber-500 to-orange-500" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/", "/login", "/support"];

  useEffect(() => {
    if (publicPaths.includes(pathname)) {
      setLoading(false);
      return;
    }
    const stored = localStorage.getItem("seller-loopy-auth");
    if (!stored) {
      router.push("/");
      return;
    }
    try {
      setSeller(JSON.parse(stored));
    } catch {
      localStorage.removeItem("seller-loopy-auth");
      router.push("/");
      return;
    }
    setLoading(false);
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("seller-loopy-auth");
    router.push("/");
  };

  if (loading) {
    return (
      <html lang="en">
        <head>
          <title>Seller Dashboard - The Loopy Dragon</title>
        </head>
        <body className={`${montserrat.variable} ${arapey.variable} bg-[#F5F9FF]`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Store className="w-6 h-6 text-violet-400" />
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (publicPaths.includes(pathname)) {
    return (
      <html lang="en">
        <head>
          <title>Seller Dashboard - The Loopy Dragon</title>
        </head>
        <body className="bg-[#F5F9FF]" style={{ fontFamily: "'Montserrat', sans-serif" }}>{children}</body>
      </html>
    );
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  return (
    <html lang="en">
      <head>
        <title>Seller Dashboard - The Loopy Dragon</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
        <body className={`${montserrat.variable} ${arapey.variable} bg-[#F5F9FF] antialiased`}>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            background: "#ffffff",
            color: "#374151",
            fontSize: "14px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          },
        }} />

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-[#22223B]/5 transform transition-all duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:flex lg:flex-col`}>
          <div className="flex flex-col h-full p-4 gap-2">
            {/* Sidebar header */}
            <div className="mb-8 px-2">
              <Link href="/dashboard">
                <h1 className="text-lg font-bold text-[#22223B]">Seller Portal</h1>
                <p className="text-xs text-[#47464d] font-semibold">Verified Merchant</p>
              </Link>
              <button onClick={() => setSidebarOpen(false)}
                className="lg:hidden absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 flex-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm text-[#47464d] hover:bg-[#eff4ff] transition-all rounded-lg ${
                    isActive(href) ? "bg-[#e6eeff] text-[#22223B] font-semibold" : ""
                  }`}>
                  <Icon className={`w-5 h-5 ${isActive(href) ? "text-[#22223B]" : "text-[#47464d]"}`} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto pt-4 border-t border-[#22223B]/5 flex flex-col gap-1">
              {seller && (
                <div className="px-3 py-3">
                  <p className="text-sm font-semibold text-[#22223B] truncate">{seller.shop_name}</p>
                  <p className="text-xs text-[#47464d] truncate">{seller.email}</p>
                </div>
              )}
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-sm text-[#47464d] hover:bg-[#eff4ff] transition-all rounded-lg">
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64 min-h-screen flex flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#22223B]/5 shadow-sm">
            <div className="flex items-center justify-between px-4 md:px-8 h-16">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-[#22223B] hover:bg-[#eff4ff] rounded-lg transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="font-[Arapey] text-[#22223B]" style={{ fontSize: "clamp(18px, 1.3vw, 22px)", letterSpacing: "0.2em", lineHeight: "100%" }}>THE LOOPY DRAGON</h1>
              </div>
              <div className="flex items-center gap-4" />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
