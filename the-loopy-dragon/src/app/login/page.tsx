"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";

function LoginClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    const checkout = searchParams.get("checkout");

    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

    // Set redirect URL - default to cart page
    let redirectTo = `${siteUrl}/cart`;
    if (redirect) {
      redirectTo = `${siteUrl}${redirect}`;
    }
    // Add checkout parameter if needed
    if (checkout === "true") {
      redirectTo += redirectTo.includes("?") ? "&checkout=true" : "?checkout=true";
    }

    console.log("OAuth redirectTo:", redirectTo);

    // Use PKCE flow for better security and compatibility
    supabase.auth
      .signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          skipBrowserRedirect: false,
        },
      })
      .catch((error) => {
        console.error("OAuth error:", error);
        // Fallback redirect to home if OAuth fails
        window.location.href = "/";
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Redirecting to Google Sign In...</p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F9FF] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}