"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Arapey, Montserrat } from "next/font/google";
import { Store, LogIn, Percent, Zap, Shield, Heart, Users, DollarSign, ChevronDown, BadgeDollarSign, TrendingUp, BadgeCheck, CheckCircle, Wallet } from "lucide-react";

const arapey = Arapey({ subsets: ["latin"], weight: "400" });
const montserrat = Montserrat({ subsets: ["latin"] });

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
      question: "How do I start selling my items?",
      answer: "Simply reach out to us through our contact channels. Once we review your portfolio and approve your application, we'll set up your seller account and you can start listing immediately."
    },
    {
      question: "What are the fees involved?",
      answer: "We charge low commission on sales. The only fee involved is a flat 2% Razorpay transaction fee which goes directly to the payment processor. Platform fees are at our discretion and will be communicated in advance."
    },
    {
      question: "When and how do I get paid?",
      answer: "Payouts are processed via UPI once an order is marked as completed. You can track your pending and cleared balances in your seller dashboard and request withdrawals."
    },
    {
      question: "Can I sell custom/made-to-order items?",
      answer: "Yes! You can list items as 'Made to Order' and specify the production time in the product description. This is a great way to manage your workload."
    },
    {
      question: "How will customers find my products?",
      answer: "Your products appear in our main marketplace and category searches. Each seller gets a dedicated storefront page at /sellers/[your-shop-name]."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-blue">
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
    <div className="min-h-screen bg-surface-blue font-body-md text-on-surface">
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-surface-bright/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Store className="w-5 h-5 text-deep-navy" />
            <div className="flex flex-col">
              <span className={`${arapey.className} text-deep-navy leading-none`} style={{ fontSize: 'clamp(14px, 1.1vw, 18px)', letterSpacing: '0.2em' }}>
                THE LOOPY DRAGON
              </span>
              <span className="text-[10px] text-on-surface-variant tracking-wider font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Seller Portal
              </span>
            </div>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2 bg-deep-navy hover:bg-secondary text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16"></div>

      {/* Original Hero Section */}
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
                List your handmade pieces and start selling!
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
                Low Commission
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
                Low Commission
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
      <section className="py-16 md:py-20 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-deep-navy font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(24px, 2.5vw, 32px)' }}>
              How It Works
            </h2>
            <p className="text-on-surface-variant" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 1.2vw, 18px)' }}>
              Get started in just a few simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, step: "1", title: "Reach Out", desc: "Contact us via email, WhatsApp, or Instagram with your portfolio." },
              { icon: Users, step: "2", title: "Get Approved", desc: "Our team will review your work within 24–36 hours for quality check." },
              { icon: Store, step: "3", title: "List Products", desc: "Get full dashboard access to upload items and manage inventory." },
              { icon: DollarSign, step: "4", title: "Get Paid", desc: "Receive UPI payouts directly after a small 2% Razorpay fee." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-lavender-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-deep-navy" />
                </div>
                <h3 className="font-semibold text-deep-navy mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(16px, 1.3vw, 20px)' }}>
                  {item.step}. {item.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-[240px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/support"
              className="inline-flex items-center justify-center bg-deep-navy text-white hover:bg-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
              style={{
                padding: 'clamp(14px, 1.2vw, 18px) clamp(32px, 3vw, 48px)',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 'clamp(14px, 1vw, 18px)',
                borderRadius: '9999px',
              }}
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Why Sell With Us Section */}
      <section className="py-16 md:py-20 bg-surface-blue" id="why-sell">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: BadgeDollarSign, title: "Low Commission", desc: "We believe in fair pricing with transparent fees." },
                { icon: Store, title: "Dedicated Storefront", desc: "Get a professional page to showcase all your crochet creations in one place." },
                { icon: TrendingUp, title: "Easy Dashboard", desc: "Track orders, manage stock, and view earnings with our intuitive seller portal." },
                { icon: BadgeCheck, title: "Fast Approval", desc: "No long waiting lists. Start selling your first piece in under 48 hours." },
              ].map((item, i) => (
                <div key={i} className={`bg-white/70 backdrop-blur-md border border-white/30 p-6 rounded-2xl ${i % 2 === 1 ? 'sm:translate-y-8' : ''}`}>
                  <item.icon className="w-7 h-7 text-deep-navy mb-3" />
                  <h4 className="font-semibold text-deep-navy mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(15px, 1.2vw, 18px)' }}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-lavender-accent/20 rounded-full blur-3xl -z-10"></div>
              <h2 className="text-deep-navy font-bold mb-6" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(22px, 2.2vw, 32px)' }}>
                Empowering Individual Artists to Scale Their Craft.
              </h2>
              <p className="text-on-surface-variant mb-6 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 1.1vw, 18px)' }}>
                The Loopy Dragon was built by makers, for makers. We understand the hours of love that go into every stitch, and we believe you should keep the value of that work. Our platform provides the professional infrastructure you need without the hefty corporate fees.
              </p>
              <ul className="space-y-3">
                {[
                  "No Hidden Listing Fees",
                  "Secure Gateway Integration",
                  "Marketing Support for Top Sellers",
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-status-success flex-shrink-0" />
                    <span className="font-medium text-deep-navy" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 1.1vw, 17px)' }}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-deep-navy font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(24px, 2.5vw, 32px)' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-on-surface-variant" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 1.2vw, 18px)' }}>
              Everything you need to know about starting your journey with us.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-outline-variant/30 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-surface-blue transition-colors cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="font-medium text-deep-navy pr-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(13px, 1.1vw, 16px)' }}>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-on-surface-variant transition-transform duration-300 flex-shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-on-surface-variant text-sm leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-deep-navy rounded-[2rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-lavender-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <h2 className="text-white font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(20px, 2.5vw, 32px)' }}>
                Connect With Us
              </h2>
              <p className="text-primary-fixed-dim mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 1.2vw, 18px)' }}>
                Have questions or ready to join? Reach out to us and we'll help you get started.
              </p>
              <Link
                href="/support"
                className="inline-flex items-center justify-center bg-white text-deep-navy font-semibold hover:bg-lavender-accent transition-all transform hover:-translate-y-1 shadow-lg"
                style={{
                  padding: 'clamp(14px, 1.5vw, 20px) clamp(32px, 4vw, 60px)',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 'clamp(14px, 1.1vw, 18px)',
                  borderRadius: '1rem',
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
