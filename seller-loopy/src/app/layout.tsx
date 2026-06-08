"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import {
  Store, LogOut, Package, ShoppingBag, LayoutDashboard, Settings, Wallet,
  Menu, X,
} from "lucide-react";
import Link from "next/link";
import "./globals.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-violet-500 to-purple-500" },
  { href: "/dashboard/products", label: "Products", icon: Package, color: "from-blue-500 to-cyan-500" },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag, color: "from-emerald-500 to-teal-500" },
  { href: "/dashboard/transactions", label: "Transactions", icon: Wallet, color: "from-green-500 to-emerald-500" },
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
        <body className="bg-[#F5F9FF]">
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
        <body className="bg-[#F5F9FF]">{children}</body>
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
      <body className="bg-[#F5F9FF] antialiased">
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
        <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-all duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar header */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-lg tracking-tight">Seller Dashboard</span>
                    <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">The Loopy Dragon</p>
                  </div>
                </Link>
                <button onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(({ href, label, icon: Icon, color }) => (
                <Link key={href} href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive(href)
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                  }`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm ${
                    isActive(href) ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                  } transition-opacity`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span>{label}</span>
                  {isActive(href) && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Seller info + logout */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {seller?.shop_name?.[0] || "S"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{seller?.shop_name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{seller?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-72 min-h-screen flex flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
            <div className="flex items-center justify-between px-4 md:px-6 h-16">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {NAV_ITEMS.find(i => isActive(i.href))?.label || "Dashboard"}
                  </h2>
                  <p className="text-[11px] text-gray-500">Welcome back, {seller?.shop_name}</p>
                </div>
              </div>
              <div />
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
