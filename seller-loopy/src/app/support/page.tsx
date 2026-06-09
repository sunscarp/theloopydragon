"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, ArrowLeft, Loader2 } from "lucide-react";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const faqs = [
    {
      question: "How do I start selling on The Loopy Dragon?",
      answer: "Simply reach out to us via email, WhatsApp, or Instagram with your shop name and a few photos of your work. We'll review and get back to you within 24–36 hours."
    },
    {
      question: "What fees apply to my sales?",
      answer: "A 2% Razorpay payment processing fee is deducted from each transaction. Platform fees are at our discretion and will be communicated in advance."
    },
    {
      question: "How and when do I get paid?",
      answer: "Payouts are sent via UPI directly to your registered UPI ID. The platform processes payouts manually — once transferred, your orders will show as 'Paid' in your transaction history. A 2% Razorpay processing fee is deducted from each sale."
    },
    {
      question: "Can I list custom or made-to-order items?",
      answer: "Yes! You can list both ready-to-ship items and custom-made products. Just set the appropriate details in your product listing."
    },
    {
      question: "How do customers find my products?",
      answer: "Your products are listed on The Loopy Dragon's main website alongside our own inventory. Each seller gets a dedicated storefront page at /sellers/your-shop-name."
    }
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

        .contact-header {
          font-family: Montserrat, sans-serif;
          font-size: 40px;
          font-weight: 700;
          color: #22223B;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
          text-transform: none;
          line-height: 1.1;
        }
        @media (max-width: 767px) {
          .contact-header {
            font-size: 32px !important;
            letter-spacing: 0.12em !important;
            line-height: 0.95 !important;
            font-weight: 700 !important;
            text-transform: none !important;
          }
        }
        @media (max-width: 480px) {
          .contact-header {
            font-size: 28px !important;
            letter-spacing: 0.15em !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#F5F9FF] flex flex-col font-sans scroll-smooth">
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

        {/* Header */}
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 className="contact-header">SELLER SUPPORT</h2>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 400,
              color: '#22223B',
              maxWidth: '100%',
              margin: '0 auto',
              lineHeight: '1.2',
              letterSpacing: '0.03em',
              padding: isMobile ? '0 1rem' : '0'
            }}>
              Have a question or need help with your seller account?
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-8">
          <div className="bg-white shadow-lg overflow-hidden">
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
              {/* Contact Information */}
              <div className={`bg-[#EFDFFF] p-8 sm:p-12 ${isMobile ? 'w-full' : 'w-full sm:w-[400px]'} max-w-full flex flex-col`}>
                <h2 className="text-2xl font-semibold text-black mb-8" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', lineHeight: '1.5' }}>
                  Contact Information
                </h2>
                <div className={`space-y-8 w-full ${isMobile ? 'max-w-full' : 'max-w-sm'}`}>
                  <div className="flex items-start space-x-4">
                    <div className="w-full">
                      <h3 className="text-base font-medium text-black mb-1" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Send an email
                      </h3>
                      <a
                        href="mailto:theloopydragon123@gmail.com"
                        className="text-black hover:text-gray-700 font-semibold text-sm hover:underline break-all"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      >
                        theloopydragon123@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-full">
                      <h3 className="text-base font-medium text-black mb-1" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        DM on Instagram
                      </h3>
                      <a
                        href="https://instagram.com/theloopydragon"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-gray-700 font-semibold text-sm hover:underline"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      >
                        @theloopydragon
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-full">
                      <h3 className="text-base font-medium text-black mb-1" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Call or WhatsApp
                      </h3>
                      <a
                        href="https://wa.me/919307502865"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-green-800 font-semibold text-sm hover:underline"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', display: 'inline-block' }}
                      >
                        +91 9307502865
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className={`bg-white p-8 sm:p-12 ${isMobile ? 'pb-8' : 'pb-0'} flex flex-col justify-start ${isMobile ? 'w-full' : 'flex-1'}`}>
                <h2 className="text-2xl font-semibold text-black mb-8 text-left" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', lineHeight: '1.5' }}>
                  Drop us a Message
                </h2>
                <form onSubmit={handleSubmit} className={`space-y-6 ${isMobile ? 'pb-8' : 'pb-0'}`}>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Full Name"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Your email ID (to contact if needed)
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter a valid email ID"
                        style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={isMobile ? 4 : 5}
                      className="w-full px-4 py-3 border border-gray-300 bg-[#F5F9FF] text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Type in your message"
                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                    />
                  </div>
                  <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-col md:flex-row md:items-center gap-4'}`}>
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className={`${isMobile ? 'w-full' : 'w-full md:w-[calc(50%-0.5rem)]'} px-6 py-3 bg-[#D8B6FA] hover:bg-[#C8A6EA] text-black font-semibold text-base transition duration-200 border-0 flex items-center justify-center gap-2`}
                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', borderRadius: '0' }}
                    >
                      {status === "sending" ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                      ) : "Submit"}
                    </button>
                    {status === "sent" && (
                      <p className={`text-sm text-green-600 ${isMobile ? 'text-center' : 'md:self-center'}`} style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Message sent successfully
                      </p>
                    )}
                    {status === "error" && (
                      <p className={`text-sm text-red-600 ${isMobile ? 'text-center' : 'md:self-center'}`} style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                        Something went wrong. Please try again.
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

        {/* FAQ Section */}
        <section className="w-full py-8 bg-[#F5F9FF]">
          <div className={`${isMobile ? 'max-w-full' : 'max-w-6xl'} mx-auto px-4`}>
            <div className="text-center mb-6">
              <h2 className="text-black mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 650, fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : 'clamp(20px, 2.5vw, 28px)', lineHeight: '100%', letterSpacing: '0%', textTransform: 'capitalize' }}>
                Frequently Asked Questions
              </h2>
            </div>

            <div className={`${isMobile ? 'max-w-full' : 'max-w-5xl'} mx-auto`}>
              {faqs.map((faq, idx) => (
                <div className="mb-4" key={idx}>
                  <button
                    className={`flex justify-between items-center py-2 w-full ${isMobile ? 'gap-4' : 'gap-6'} bg-transparent border-none outline-none text-left`}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ cursor: "pointer", width: "100%" }}
                  >
                    <h3 className="text-black flex-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 550, fontSize: isMobile ? 'clamp(12px, 3.5vw, 15px)' : 'clamp(13px, 1.4vw, 16px)', lineHeight: '120%' }}>
                      {faq.question}
                    </h3>
                    <span
                      className="block transition-transform duration-300 text-black text-xl w-6 h-6 flex items-center justify-center"
                      style={{ transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                      +
                    </span>
                  </button>
                  <div className="w-full border-t my-3" style={{ borderColor: '#EFDEFF', height: '2px', width: '100%' }}></div>
                  {openFaq === idx && (
                    <>
                      <div className={`text-black py-2 ${isMobile ? 'pl-1' : 'pl-2'}`} style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: isMobile ? '14.5px' : '16px', lineHeight: '1.5', letterSpacing: '0.01em' }}>
                        {faq.answer}
                      </div>
                      <div className="w-full border-t my-3" style={{ borderColor: '#EFDEFF', height: '2px', width: '100%' }}></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <br />

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
