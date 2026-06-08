"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, LogIn, Percent, Zap, Shield, Heart, Users, DollarSign } from "lucide-react";

export default function SellerLandingPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqs = [
    {
      question: "How do I start selling on The Loopy Dragon?",
      answer: "Simply reach out to us via email, WhatsApp, or Instagram with your shop name and a few photos of your work. We'll review and get back to you within 24–36 hours."
    },
    {
      question: "Is there any commission fee?",
      answer: "No! We charge 0% commission. The only deduction is a 2% Razorpay processing fee on each transaction. You keep the rest."
    },
    {
      question: "How and when do I get paid?",
      answer: "Payouts are processed via UPI directly to your account. You can request a payout from your seller dashboard, and it will be transferred after the 2% Razorpay fee is deducted."
    },
    {
      question: "Can I list custom or made-to-order items?",
      answer: "Yes! You can list both ready-to-ship items and custom-made products. Just set the appropriate details in your product listing."
    },
    {
      question: "How do customers find my products?",
      answer: "Your products are listed on The Loopy Dragon's main website alongside our own inventory. Each seller gets a dedicated storefront page at /sellers/[your-shop-name]."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Store className="w-6 h-6 text-violet-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col font-sans">
        {/* Navbar */}
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
            : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2">
              <Store className="w-6 h-6 text-purple-700" />
              <span className="font-semibold text-gray-900 text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Seller Portal
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-16 sm:h-20"></div>

        {/* Hero Section */}
        <section className="relative w-full overflow-hidden">
          <div
            className="w-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/flower-image.png)',
              height: 'clamp(400px, 32.5vw, 624px)',
              minHeight: '400px',
              width: '100vw',
              marginLeft: 'calc(-50vw + 50%)',
            }}
          >
            <div className="relative h-full flex items-center">
              <div
                className="flex flex-col justify-center px-4 sm:px-0"
                style={{
                  marginLeft: 'clamp(20px, 9.74vw, 187px)',
                  width: 'clamp(280px, 31.875vw, 612px)',
                  height: 'clamp(350px, 22.24vw, 427px)'
                }}
              >
                <h1
                  className="text-black mb-4 sm:mb-6 leading-none tracking-wider"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(24px, 3.125vw, 60px)',
                    letterSpacing: '0.05em'
                  }}
                >
                  SELL YOUR CROCHET <br />CREATIONS
                </h1>

                <p
                  className="text-black mb-6 sm:mb-8"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(14px, 1.25vw, 24px)',
                    lineHeight: '1.875',
                    letterSpacing: '0.05em'
                  }}
                >
                  Join The Loopy Dragon marketplace. <br />
                  List your handmade pieces and sell with 0% commission!
                </p>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{
                    width: 'clamp(200px, 14.9vw, 286px)',
                    height: 'clamp(60px, 4.69vw, 90px)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(14px, 1.04vw, 20px)',
                    letterSpacing: '0.05em',
                    borderRadius: 0
                  }}
                >
                  Start Selling
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-3.5 bg-white">
          <div className="relative w-full">
            <div className="hidden sm:flex items-center justify-between w-full px-4">
              <div className="flex flex-col items-center" style={{ marginLeft: 'clamp(20px, 12.8vw, 246px)' }}>
                <div className="w-12 h-12 sm:w-[50px] sm:h-[50px] flex items-center justify-center mb-4">
                  <Percent className="w-full h-full text-purple-600" style={{ width: 'clamp(25px, 2.6vw, 50px)', height: 'clamp(25px, 2.6vw, 50px)' }} />
                </div>
                <p className="text-black text-center" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.04vw, 20px)', lineHeight: '100%', letterSpacing: '0.05em' }}>
                  0% Commission
                </p>
              </div>

              <div className="w-px bg-gray-300" style={{ height: 'clamp(60px, 4vw, 90px)', minHeight: '60px' }}></div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-[60px] sm:h-[60px] flex items-center justify-center mb-4">
                  <Zap className="w-full h-full text-purple-600" style={{ width: 'clamp(30px, 3.125vw, 60px)', height: 'clamp(30px, 3.125vw, 60px)' }} />
                </div>
                <p className="text-black text-center" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.04vw, 20px)', lineHeight: '100%', letterSpacing: '0.05em' }}>
                  Quick Setup
                </p>
              </div>

              <div className="w-px bg-gray-300" style={{ height: 'clamp(60px, 4vw, 90px)', minHeight: '60px' }}></div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-[48px] sm:h-[48px] flex items-center justify-center mb-4">
                  <Shield className="w-full h-full text-purple-600" style={{ width: 'clamp(24px, 2.5vw, 48px)', height: 'clamp(24px, 2.5vw, 48px)' }} />
                </div>
                <p className="text-black text-center" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.04vw, 20px)', lineHeight: '100%', letterSpacing: '0.05em' }}>
                  Secure Payouts
                </p>
              </div>

              <div className="w-px bg-gray-300" style={{ height: 'clamp(60px, 4vw, 90px)', minHeight: '60px' }}></div>

              <div className="flex flex-col items-center" style={{ marginRight: 'clamp(20px, 12.8vw, 246px)' }}>
                <div className="w-12 h-12 sm:w-[56px] sm:h-[56px] flex items-center justify-center mb-4">
                  <Heart className="w-full h-full text-purple-600" style={{ width: 'clamp(28px, 2.92vw, 56px)', height: 'clamp(28px, 2.92vw, 56px)' }} />
                </div>
                <p className="text-black text-center" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.04vw, 20px)', lineHeight: '100%', letterSpacing: '0.05em' }}>
                  Dedicated Support
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Features */}
          <div className="block sm:hidden px-6">
            <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
              <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 to-pink-50 py-4 px-4 rounded-2xl shadow-sm">
                <Percent className="w-8 h-8 text-purple-600 mb-3" />
                <p className="text-gray-800 text-center text-xs font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                  0% Commission
                </p>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-purple-50 py-4 px-4 rounded-2xl shadow-sm">
                <Zap className="w-8 h-8 text-purple-600 mb-3" />
                <p className="text-gray-800 text-center text-xs font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                  Quick Setup
                </p>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-blue-50 py-4 px-4 rounded-2xl shadow-sm">
                <Shield className="w-8 h-8 text-purple-600 mb-3" />
                <p className="text-gray-800 text-center text-xs font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                  Secure Payouts
                </p>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-br from-orange-50 to-pink-50 py-4 px-4 rounded-2xl shadow-sm">
                <Heart className="w-8 h-8 text-purple-600 mb-3" />
                <p className="text-gray-800 text-center text-xs font-medium" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                  Dedicated Support
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-16 lg:py-20" style={{ backgroundImage: "url('/yes.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 'clamp(28px, 3.75vw, 36px)', lineHeight: '100%', letterSpacing: '0%' }}>
                How It Works
              </h2>
              <p className="text-black" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '100%', letterSpacing: '0%' }}>
                Get started in just a few simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { icon: Heart, label: "Reach Out", desc: "Contact us via email, WhatsApp, or Instagram with your shop name and photos." },
                { icon: Users, label: "Get Approved", desc: "We review your application within 24–36 hours and activate your account." },
                { icon: Store, label: "List Products", desc: "Access your dashboard to list products, track orders, and manage sales." },
                { icon: DollarSign, label: "Get Paid", desc: "Earnings are paid out to your UPI after deducting only the 2% Razorpay fee." },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-start">
                  <div className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" style={{ background: 'transparent' }}>
                    <div className="w-full h-full flex items-center justify-center bg-purple-50">
                      <item.icon className="w-20 h-20 sm:w-28 sm:h-28 text-purple-700" />
                    </div>
                  </div>
                  <div className="mt-3 text-left w-full">
                    <h3 className="text-black mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: 'clamp(14px, 1.2vw, 18px)', lineHeight: '1.2' }}>
                      {item.label}
                    </h3>
                    <p className="text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1vw, 14px)', lineHeight: '1.4' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{
                  width: 'clamp(240px, 14.9vw, 286px)',
                  height: 'clamp(70px, 4.69vw, 90px)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(16px, 1.04vw, 20px)',
                  letterSpacing: '0.05em',
                  borderRadius: 0
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20" style={{ backgroundColor: '#F7F0FE' }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <h2 className="text-black text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: '100%', letterSpacing: '0%' }}>
              Why Sell With Us?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
              <div className="text-left px-2 sm:px-4">
                <h3 className="text-black mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '1.2' }}>
                  0% Commission
                </h3>
                <p className="text-black text-left" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(14px, 1.8vw, 16px)', lineHeight: '1.4', maxWidth: '280px' }}>
                  Keep every rupee you earn. Only a 2% Razorpay processing fee is deducted from each transaction.
                </p>
              </div>
              <div className="text-left px-2 sm:px-4">
                <h3 className="text-black mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '1.2' }}>
                  Dedicated Storefront
                </h3>
                <p className="text-black text-left" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(14px, 1.8vw, 16px)', lineHeight: '1.4', maxWidth: '280px' }}>
                  Get your own page at /sellers/your-shop-name with your banner, logo, and products.
                </p>
              </div>
              <div className="text-left px-2 sm:px-4">
                <h3 className="text-black mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '1.2' }}>
                  Easy Dashboard
                </h3>
                <p className="text-black text-left" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(14px, 1.8vw, 16px)', lineHeight: '1.4', maxWidth: '280px' }}>
                  Manage products, track orders, view earnings, and request payouts — all from one place.
                </p>
              </div>
              <div className="text-left px-2 sm:px-4">
                <h3 className="text-black mb-3 sm:mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: 'clamp(18px, 2.5vw, 24px)', lineHeight: '1.2' }}>
                  Fast Approval
                </h3>
                <p className="text-black text-left" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(14px, 1.8vw, 16px)', lineHeight: '1.4', maxWidth: '280px' }}>
                  Get your seller account activated within 24–36 hours of reaching out.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-6">
              <h2 className="text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 650, fontSize: 'clamp(20px, 2.5vw, 28px)', lineHeight: '100%', letterSpacing: '0%', textTransform: 'capitalize' }}>
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-5xl mx-auto">
              {faqs.map((faq, idx) => (
                <div className="mb-4" key={idx}>
                  <button
                    className="flex justify-between items-center py-2 w-full gap-6 bg-transparent border-none outline-none text-left"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ cursor: "pointer" }}
                  >
                    <h3 className="text-black flex-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 550, fontSize: 'clamp(13px, 1.4vw, 16px)', lineHeight: '120%' }}>
                      {faq.question}
                    </h3>
                    <span
                      className="block transition-transform duration-300 text-black text-xl w-6 h-6 flex items-center justify-center"
                      style={{ transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                      +
                    </span>
                  </button>
                  <div className="w-full border-t my-3" style={{ borderColor: '#EFDEFF', height: '2px' }}></div>
                  {openFaq === idx && (
                    <>
                      <div className="text-black py-2 pl-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.2vw, 15px)', lineHeight: '1.5' }}>
                        {faq.answer}
                      </div>
                      <div className="w-full border-t my-3" style={{ borderColor: '#EFDEFF', height: '2px' }}></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Home
              </Link>
              <Link href="/support" className="text-gray-500 hover:text-gray-700 text-sm transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Support
              </Link>
              <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm transition-colors" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Sign In
              </Link>
            </div>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              The Loopy Dragon — Seller Portal
            </p>
            <p className="text-gray-400 text-xs mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              &copy; {new Date().getFullYear()} The Loopy Dragon. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
