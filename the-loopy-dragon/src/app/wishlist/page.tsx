"use client";
import Footer from "@/components/Footer";

export default function WishlistPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="flex-1 flex items-center justify-center">
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 24,
            color: "#888",
            fontWeight: 500,
          }}
        >
          Wishlist coming soon
        </span>
      </div>
      <Footer />
    </div>
  );
}