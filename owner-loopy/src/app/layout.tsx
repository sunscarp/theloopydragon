"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  ClipboardList,
  Gamepad2,
  DollarSign,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Store,
  ThumbsDown,
} from "lucide-react";
import "./globals.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/products", label: "Products", icon: Package },
  { href: "/sellers", label: "Sellers", icon: Users },
  { href: "/payouts", label: "Payouts", icon: DollarSign },
  { href: "/custom-orders", label: "Custom Orders", icon: ClipboardList },
  { href: "/rejected-orders", label: "Rejected Orders", icon: ThumbsDown },
  { href: "/dragon-game", label: "Dragon Game", icon: Gamepad2 },
];

function Sidebar({
  pathname,
  collapsed,
  onToggle,
}: {
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("owner-loopy-auth");
    router.push("/");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 bg-gradient-to-b from-indigo-950 to-purple-950 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-indigo-800/50">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Store className="w-6 h-6 text-purple-300" />
              <span className="font-bold text-white text-lg">Owner Loopy</span>
            </Link>
          )}
          <button
            onClick={onToggle}
            className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-indigo-800/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-purple-600/20 text-purple-200 border border-purple-500/30"
                    : "text-indigo-300 hover:bg-indigo-800/40 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-16 ml-2 px-2 py-1 bg-indigo-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-indigo-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-indigo-300 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Login page doesn't need the auth guard
    if (pathname === "/") {
      setLoading(false);
      return;
    }

    if (localStorage.getItem("owner-loopy-auth") !== "true") {
      router.push("/");
      return;
    }

    setLoading(false);
  }, [router, pathname]);

  if (loading) {
    return (
      <html lang="en">
        <head>
          <title>Owner Dashboard - The Loopy Dragon</title>
        </head>
        <body className="bg-slate-50">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 text-sm">Loading dashboard...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Owner Dashboard - The Loopy Dragon</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              background: "#1e1b4b",
              color: "#e2e8f0",
              fontSize: "14px",
            },
          }}
        />
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              pathname={pathname || ""}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Mobile Sidebar */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="absolute top-0 left-0 h-full w-64 bg-gradient-to-b from-indigo-950 to-purple-950 shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-indigo-800/50">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Store className="w-6 h-6 text-purple-300" />
                    <span className="font-bold text-white text-lg">Owner Loopy</span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-indigo-800/50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="py-4 space-y-1 px-2">
                  {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || pathname?.startsWith(href + "/");
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-purple-600/20 text-purple-200 border border-purple-500/30"
                            : "text-indigo-300 hover:bg-indigo-800/40 hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-2 border-t border-indigo-800/50">
                  <button
                    onClick={() => {
                      localStorage.removeItem("owner-loopy-auth");
                      router.push("/");
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-indigo-300 hover:bg-red-600/20 hover:text-red-300 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="font-semibold text-slate-800">Owner Loopy</span>
              <button
                onClick={() => {
                  localStorage.removeItem("owner-loopy-auth");
                  router.push("/");
                }}
                className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <main className="p-4 md:p-6 lg:p-8">
              <div className="animate-fade-in">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
