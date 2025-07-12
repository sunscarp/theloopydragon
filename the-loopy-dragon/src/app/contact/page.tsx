"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/mobilefooter";
import { useState, useEffect } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle scroll effect for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // FAQ Dropdown State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Can I customize my crochet item?",
      answer: "Yes! We'd love to make something just for you. Head over to our Customise page to get started. Share your ideas with us and we will make sure to bring your vision to life!"
    },
    {
      question: "What materials do you use for your crochet items?",
      answer: "We use a variety of yarns including acrylic, cotton, and velvet to create our pieces. The specific material used is always listed in the product description. If you have a preference, feel free to request a different yarn type — we're happy to customize it for you!"
    },
    {
      question: "How long will it take to receive my order?",
      answer: "We usually take around 1–2 weeks to prepare and ship your order, making sure every detail is just right! Custom pieces or larger quantity orders may take a little longer, but don't worry, we'll keep you in the loop throughout the process."
    },
    {
      question: "How do I care for my crochet items?",
      answer: "To keep your crochet pieces looking their best, we recommend gentle hand washing with mild soap and water at room temperature. Lay flat to dry to maintain their shape. Avoid wringing, harsh detergents, or machine washing."
    },
    {
      question: "Do you offer gift wrapping or packaging?",
      answer: "Yes! Gift wrapping is available as an add-on. Just select the option when you're choosing your product.  We'll make sure your order arrives looking extra special and ready to gift!"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F9FF] dark:from-gray-900 dark:to-gray-800 flex flex-col font-sans scroll-smooth">
      {/* Sticky Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-md py-2 px-4 sm:px-6'
            : 'bg-transparent py-4 px-6 sm:px-8'
        }`}
      >
        <Navbar />
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-16 sm:h-20"></div>

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: 700,
            color: '#22223B',
            marginBottom: '1rem',
            letterSpacing: '0.05em'
          }}>
            CONTACT US
          </h2>
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
            Have question or want to connect with us?
          </p>
        </div>
      </section>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-8 -mt-13">
        <div className="bg-white shadow-lg overflow-hidden">
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
            {/* Contact Information - Mobile: Full Width, Desktop: Left side */}
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
              </div>
            </div>
            
            {/* Contact Form - Mobile: Full Width, Desktop: Right side */}
            <div className={`bg-white p-8 sm:p-12 ${isMobile ? 'pb-8' : 'pb-0'} flex flex-col justify-start ${isMobile ? 'w-full' : 'flex-1'}`}>
              <h2 className="text-2xl font-semibold text-black mb-8 text-left" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', lineHeight: '1.5' }}>
                Drop us a Message
              </h2>
              <div className={`space-y-6 ${isMobile ? 'pb-8' : 'pb-0'}`}>
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
                    className={`${isMobile ? 'w-full' : 'w-full md:w-[calc(50%-0.5rem)]'} px-6 py-3 bg-[#D8B6FA] hover:bg-[#C8A6EA] text-black font-semibold text-base transition duration-200 border-0`}
                    disabled={status === "sending"}
                    onClick={handleSubmit}
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif', 
                      letterSpacing: '0.02em',
                      borderRadius: '0'
                    }}
                  >
                    {status === "sending" ? "Sending..." : "Submit"}
                  </button>
                  {status === "sent" && (
                    <p 
                      className={`text-sm text-green-600 ${isMobile ? 'text-center' : 'md:self-center'}`}
                      style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
                    >
                      Message sent successfully
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Frequently Asked Questions Section */}
      <section className="w-full py-8 bg-[#F5F9FF]">
        <div className={`${isMobile ? 'max-w-full' : 'max-w-6xl'} mx-auto px-4`}>
          {/* Section Header */}
          <div className="text-center mb-6">
            <h2 
              className="text-black mb-2"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 650,
                fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : 'clamp(20px, 2.5vw, 28px)',
                lineHeight: '100%',
                letterSpacing: '0%',
                textTransform: 'capitalize'
              }}
            >
              Frequently Asked Questions
            </h2>
          </div>

          {/* FAQ Items */}
          <div className={`${isMobile ? 'max-w-full' : 'max-w-5xl'} mx-auto`}>
            {faqs.map((faq, idx) => (
              <div className="mb-4" key={idx}>
                <div className={`flex justify-between items-center py-2 ${isMobile ? 'gap-4' : 'gap-6'}`}>
                  <h3 
                    className="text-black flex-1"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 550,
                      fontSize: isMobile ? 'clamp(12px, 3.5vw, 15px)' : 'clamp(13px, 1.4vw, 16px)',
                      lineHeight: '120%',
                      fontStyle: 'normal',
                      fontStretch: 'normal',
                      textRendering: 'optimizeLegibility',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale'
                    }}
                  >
                    {faq.question}
                  </h3>
                  <button
                    className="text-black text-xl w-6 h-6 flex items-center justify-center transition-transform duration-300 flex-shrink-0"
                    aria-label={openFaq === idx ? "Collapse" : "Expand"}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ color: 'black' }}
                  >
                    <span 
                      className="block transition-transform duration-300"
                      style={{ transform: openFaq === idx ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                      +
                    </span>
                  </button>
                </div>
                <div 
                  className="w-full border-t my-3" 
                  style={{ borderColor: '#EFDEFF', height: '2px', width: '100%' }} 
                ></div>
                {/* Dropdown answer */}
                {openFaq === idx && (
                  <div
                    className={`text-black py-2 ${isMobile ? 'pl-1' : 'pl-2'}`}
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 400,
                      fontSize: isMobile ? 'clamp(11px, 3vw, 14px)' : 'clamp(12px, 1.2vw, 15px)',
                      lineHeight: '1.5',
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <br></br>
      
      {/* Conditional Footer rendering */}
      {isMobile ? <MobileFooter /> : <Footer />}
    </div>
  );
}