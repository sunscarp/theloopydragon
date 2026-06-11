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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F9FF]">
        <div className="w-14 h-14 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-white border border-[#D1D5DB] text-[#22223B] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#D7B3FB] focus:border-[#D7B3FB] transition-all font-mono";

  return (
    <div className="min-h-screen bg-[#F5F9FF] flex flex-col">
      {/* Simple Navbar */}
      <div className="bg-white border-b border-[#22223B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#22223B]" />
            <span className="font-semibold text-[#22223B] text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Seller Portal
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#47464d] hover:text-[#22223B] text-sm transition-colors"
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
          <div className="bg-white rounded-xl p-8 md:p-10 border border-[#22223B]/5 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-[#e6eeff] flex items-center justify-center mx-auto mb-5">
                <Store className="w-7 h-7 text-[#22223B]" />
              </div>
              <h2 className="text-xl font-bold text-[#22223B] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Seller Login</h2>
              <p className="text-sm text-[#47464d]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Sign in to manage your store</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#47464d] mb-1.5 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Email</label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seller@example.com"
                  className={inputClass}
                  autoFocus />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#47464d] mb-1.5 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 pr-11 py-3 bg-white border border-[#D1D5DB] text-[#22223B] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#D7B3FB] focus:border-[#D7B3FB] transition-all font-mono" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={signingIn}
                className="w-full flex items-center justify-center gap-2.5 bg-[#22223B] hover:bg-[#22223B]/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <footer className="bg-white border-t border-[#22223B]/10 py-6">
        <div className="text-center">
          <p className="text-[#47464d] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            The Loopy Dragon &mdash; Seller Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
