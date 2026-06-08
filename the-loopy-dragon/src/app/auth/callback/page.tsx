"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";

// Client component to use useSearchParams inside Suspense
function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleAuthCallback() {
      // Handle the OAuth callback
      const { error } = await supabase.auth.getSession();
      if (error) {
        // If error, redirect to home or show error
        router.replace("/?error=auth");
        return;
      }

      // Optionally, handle redirectTo param
      const redirect = searchParams.get("redirect");
      const checkout = searchParams.get("checkout");
      let redirectTo = redirect || "/cart";
      if (checkout === "true") {
        redirectTo += redirectTo.includes("?") ? "&checkout=true" : "?checkout=true";
      }
      router.replace(redirectTo);
    }
    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
