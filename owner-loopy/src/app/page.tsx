"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, LogIn, KeyRound } from "lucide-react";

const PASSWORD = "sneshisan";

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("owner-loopy-auth") === "true") {
      router.replace("/dashboard");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter the password");
      return;
    }

    setSigningIn(true);

    // Simulate a brief delay for UX
    await new Promise((r) => setTimeout(r, 600));

    if (password === PASSWORD) {
      localStorage.setItem("owner-loopy-auth", "true");
      router.replace("/dashboard");
    } else {
      setError("Incorrect password");
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Owner Loopy</h1>
            <p className="text-indigo-300 text-sm">
              Enter the password to access the dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-indigo-400/30 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {signingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          <p className="text-indigo-400/60 text-xs text-center mt-6">
            Authorized owners only
          </p>
        </div>
      </div>
    </div>
  );
}
