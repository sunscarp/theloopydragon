"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Arapey, Montserrat } from "next/font/google";
import {
  Store, LogIn, Percent, Zap, Shield, Heart, Users, DollarSign,
  ChevronDown, BadgeDollarSign, TrendingUp, BadgeCheck, CheckCircle,
  Wallet, BarChart3, ShoppingBag, Image, Search, Globe,
  Gift,
  Package, CreditCard, Smartphone
} from "lucide-react";

import Footer from "@/components/Footer";

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
      answer: "Simply sign up through our seller portal and reach out to us. Once we review your portfolio and approve your application, we'll set up your seller account and you can start listing immediately. The entire process typically takes 24–36 hours from application to approval."
    },
    {
      question: "What are the fees involved?",
      answer: "We charge low commission on sales. The only fee that's always deducted is a flat 2% Razorpay transaction fee which goes directly to the payment processor. Platform commission rates are communicated clearly when you're onboarded. There are no hidden fees, no monthly subscription charges, and no listing fees."
    },
    {
      question: "When and how do I get paid?",
      answer: "Payouts are processed via UPI once an order is marked as completed. You can track your pending and cleared balances in your seller dashboard. Withdrawals can be requested anytime, and payouts are typically processed within 5–7 business days. All payments are handled securely through Razorpay."
    },
    {
      question: "What kind of dashboard do I get access to?",
      answer: "You get a full-featured seller dashboard with sections for: Inventory Management (add/edit products, track stock), Order Management (view/fulfill orders, print labels), Financials (track earnings, view transaction history, request payouts), Store Settings (customize your storefront, set policies), and Support (contact us directly)."
    },
    {
      question: "How will customers find my products?",
      answer: "Your products appear in our main marketplace at theloopydragon.in/shop with category-based browsing and search. Each seller gets a dedicated storefront page at /sellers/[your-shop-name] that you can customize with your logo, banner, and store policies. We also feature top sellers on our social media channels."
    },
    {
      question: "Can I customize my storefront?",
      answer: "Absolutely! You can upload your store logo and banner image, set your URL slug (e.g., theloopydragon.in/sellers/your-shop-name), configure return/exchange policies, enable free delivery, and manage your product listings — all from your seller dashboard settings."
    },
    {
      question: "What if an order gets returned or refunded?",
      answer: "You control your return and exchange policies. When a customer requests a return or exchange, it comes to you for manual approval. The platform facilitates communication, but you have the final say. We recommend setting clear policies upfront to manage expectations."
    },
    {
      question: "Is there marketing support for sellers?",
      answer: "Yes! We actively promote top-selling and high-quality products through our social media channels (Instagram, etc.). Sellers with great products, clear photos, and consistent fulfillment get featured. We also run periodic promotions and discounts to drive traffic to the marketplace."
    },
    {
      question: "What kind of products can I sell?",
      answer: "The Loopy Dragon specializes in handmade crochet creations and related crafts. This includes but isn't limited to: plushies, keychains, hair accessories (scrunchies, claw clips, hair ties, etc.), flowers, jewellery, home decor, and character items. All items must be handmade or curated by you."
    }
  ];

  // FAQ item removed: "Can I list custom or made-to-order items?"

  const dashboardFeatures = [
    { icon: Package, title: "Inventory Management", desc: "Add, edit, and manage your product listings with bulk upload support. Track stock levels, set prices, and update product photos anytime." },
    { icon: ShoppingBag, title: "Order Management", desc: "View incoming orders, update fulfillment status, and manage shipping. See order history and customer details all in one place." },
    { icon: Wallet, title: "Financial Tracking", desc: "Monitor your earnings, view transaction history, track payouts, and request withdrawals. Complete transparency on every rupee earned." },
    { icon: BarChart3, title: "Sales Analytics", desc: "Track your store's performance with insights on top-selling products, revenue trends, and customer engagement metrics." },
    { icon: Image, title: "Store Customization", desc: "Personalize your storefront with your logo, banner, and slug. Set your policies, delivery options, and store description." },
    { icon: CreditCard, title: "Secure Payouts", desc: "Get paid directly to your UPI account via Razorpay. All transactions are encrypted and secure. No minimum payout threshold." },
  ];

  const platformBenefits = [
    {
      icon: Store,
      title: "Your Own Storefront",
      desc: "Every seller gets a dedicated, customizable page at theloopydragon.in/sellers/your-shop-name with your logo, banner, and all your products beautifully displayed.",
      highlight: "Free dedicated page"
    },
    {
      icon: Search,
      title: "Marketplace Visibility",
      desc: "Your products appear in our main shop alongside category filters, search, and browse features — putting your creations in front of thousands of monthly visitors.",
      highlight: "Thousands of visitors"
    },
    {
      icon: Zap,
      title: "Quick & Easy Setup",
      desc: "From application to your first listing in under 48 hours. Our streamlined onboarding process means you spend less time setting up and more time creating.",
      highlight: "Under 48 hours"
    },
    {
      icon: Globe,
      title: "All-India Shipping",
      desc: "Sell to customers across India. We integrate with major courier services and you control your shipping zones, rates, and delivery timelines.",
      highlight: "Pan-India reach"
    },
    {
      icon: Smartphone,
      title: "Mobile-Optimized",
      desc: "Both your storefront and the main shop are fully responsive and mobile-optimized. Customers can browse and buy from their phones seamlessly.",
      highlight: "Mobile-friendly"
    },
    {
      icon: Gift,
      title: "Promotional Features",
      desc: "Get featured in our social media campaigns, seasonal promotions, and special collections. Top-performing sellers get extra visibility.",
      highlight: "Marketing support"
    },
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

      <div className="h-16"></div>

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
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
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
                SELL YOUR HANDMADE <br />CREATIONS
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
                href="/support"
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


      {/* Platform Benefits Deep Dive */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-deep-navy font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(24px, 2.5vw, 32px)' }}>
              Everything You Get as a Seller
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 1.2vw, 18px)' }}>
              A complete toolkit to start, manage, and grow your handmade business — all from one dashboard.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformBenefits.map((benefit, i) => (
              <div key={i} className="bg-surface-blue/60 border border-purple-100/50 rounded-2xl p-6 sm:p-8">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-5">
                  <benefit.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-deep-navy font-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(16px, 1.2vw, 19px)' }}>
                  {benefit.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {benefit.desc}
                </p>
                <span className="inline-block text-xs font-semibold text-black bg-white border border-gray-200 px-3 py-1 rounded-full">
                  {benefit.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 bg-white" id="how-it-works">
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
              { icon: Heart, step: "1", title: "Reach Out", desc: "Contact us via email, WhatsApp, or Instagram with your portfolio of work and tell us about your craft." },
              { icon: Users, step: "2", title: "Get Approved", desc: "Our team will review your work within 24–36 hours. We look for quality, originality, and craftsmanship." },
              { icon: Store, step: "3", title: "List Products", desc: "Get full dashboard access to upload items with photos, descriptions, and pricing. Manage inventory in real-time." },
              { icon: DollarSign, step: "4", title: "Start Earning", desc: "Receive orders, fulfill them, and get paid directly to your UPI account. Track everything from your dashboard." },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-lavender-accent flex items-center justify-center mb-5">
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

      {/* Seller Dashboard Features */}
      <section className="py-12 md:py-16 bg-surface-blue" id="dashboard-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-deep-navy font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(24px, 2.5vw, 32px)' }}>
              Your Seller Dashboard
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 1.2vw, 18px)' }}>
              A powerful yet easy-to-use dashboard gives you everything you need to run your store.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dashboardFeatures.map((feature, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md border border-white/30 p-6 rounded-2xl hover:shadow-md transition-all duration-300">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-5.5 h-5.5 text-deep-navy" />
                </div>
                <h4 className="font-semibold text-deep-navy mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(15px, 1.2vw, 18px)' }}>
                  {feature.title}
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sell With Us */}
      <section className="py-12 md:py-16 bg-white" id="why-sell">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: BadgeDollarSign, title: "Low Commission", desc: "We believe in fair pricing with transparent fees. No hidden charges, no surprise deductions." },
                { icon: Store, title: "Dedicated Storefront", desc: "Get a professional page at your own URL to showcase all your crochet creations in one place." },
                { icon: TrendingUp, title: "Easy Dashboard", desc: "Track orders, manage stock, and view earnings with our intuitive seller portal. Real-time updates." },
                { icon: BadgeCheck, title: "Fast Approval", desc: "No long waiting lists or complicated processes. Start selling your first piece in under 48 hours." },
              ].map((item, i) => (
                <div key={i} className={`bg-[#e8edf5] backdrop-blur-md border border-purple-100/30 p-6 rounded-2xl ${i % 2 === 1 ? 'sm:translate-y-8' : ''}`}>
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
                  "No Hidden Listing Fees — list as many products as you want",
                  "Secure Payment Gateway Integration via Razorpay",
                  "Marketing Support & Social Media Features for Top Sellers",
                  "Real-Time Dashboard Analytics for Informed Decisions",
                  "Dedicated Seller Support Team Available via Chat & Email",
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

      {/* Pricing Section */}
      <section className="py-12 md:py-16 bg-surface-blue" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-deep-navy font-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(24px, 2.5vw, 32px)' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(14px, 1.2vw, 18px)' }}>
              No subscriptions. No monthly fees. You only pay when you make a sale.
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-purple-100 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-deep-navy text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>No Listing Fees</h3>
                <p className="text-sm text-on-surface-variant mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  List unlimited products. No upfront cost. No monthly subscription.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-purple-100 shadow-sm relative">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Percent className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-deep-navy text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>2% Transaction Fee</h3>
                <p className="text-sm text-on-surface-variant mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Only the Razorpay payment gateway fee. Goes directly to the processor.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-purple-100 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-deep-navy text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>UPI Payouts</h3>
                <p className="text-sm text-on-surface-variant mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Get paid directly to your UPI account. No payout thresholds.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <p className="text-on-surface-variant text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Platform commission rates are communicated during onboarding and are subject to change with prior notice.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-white" id="faq">
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



      <Footer />
    </div>
  );
}
