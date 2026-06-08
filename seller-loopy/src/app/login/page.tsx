"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, LogIn, KeyRound, Mail, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("seller-loopy-auth");
    if (stored) {
      try {
        const seller = JSON.parse(stored);
        if (seller && seller.id) {
          router.replace("/dashboard");
          return;
        }
      } catch {}
    }
    setLoading(false);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }
    setSigningIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("seller-loopy-auth", JSON.stringify(data.seller));
        router.replace("/dashboard");
      } else {
        setError(data.error || "Login failed");
        setSigningIn(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="w-16 h-16 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all";

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
        {/* Simple Navbar */}
        <div className="bg-white/95 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Store className="w-6 h-6 text-purple-700" />
              <span className="font-semibold text-gray-900 text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Seller Portal
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200 shadow-lg shadow-purple-500/10">
              <div className="text-center mb-8">
                <div className="relative inline-flex mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Seller Login</h2>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif' }}>Sign in to manage your store</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                    <input type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seller@example.com"
                      className={inputClass}
                      autoFocus />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                    <input type={showPassword ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={signingIn}
                  className="relative w-full flex items-center justify-center gap-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {signingIn ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
                  ) : (
                    <><LogIn className="w-5 h-5" /> Sign In</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              The Loopy Dragon — Seller Portal
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
