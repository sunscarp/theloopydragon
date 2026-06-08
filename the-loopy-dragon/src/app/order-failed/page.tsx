"use client";
import React from "react";
import Link from "next/link";

export default function OrderFailed() {
  // Responsive check for mobile
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F9FF] dark:from-gray-900 dark:to-gray-800 flex flex-col font-sans scroll-smooth" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Responsive font for header */}
          <style jsx>{`
            .order-failed-header {
              font-family: Montserrat, sans-serif;
              font-size: 40px;
              font-weight: 700;
              color: #B91C1C;
              margin-bottom: 1rem;
              letter-spacing: 0.05em;
              text-transform: none;
              line-height: 1.1;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.75rem;
            }
            @media (max-width: 767px) {
              .order-failed-header {
                font-size: 32px !important;
                letter-spacing: 0.12em !important;
                line-height: 0.95 !important;
                font-weight: 700 !important;
                text-transform: none !important;
              }
            }
            @media (max-width: 480px) {
              .order-failed-header {
                font-size: 28px !important;
                letter-spacing: 0.15em !important;
              }
            }
          `}</style>
          <div className="order-failed-header">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Order Failed
          </div>
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
            We're sorry, but your order could not be processed.
          </p>
        </div>
      </section>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-8 -mt-13">
        <div className="bg-white shadow-lg overflow-hidden" style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }}>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
            {/* Info Section */}
            <div
              className={`bg-[#EFDFFF] p-8 sm:p-12 ${isMobile ? 'w-full' : 'w-full sm:w-[400px]'} max-w-full flex flex-col`}
              style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }}
            >
              <h2 className="text-2xl font-semibold text-black mb-8" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', lineHeight: '1.5' }}>
                Need Help?
              </h2>
              <div className={`space-y-8 w-full ${isMobile ? 'max-w-full' : 'max-w-sm'}`}>
                <div className="flex items-start space-x-4">
                  <div className="w-full">
                    <h3 className="text-base font-medium text-black mb-1" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
                      Contact us via Email
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
            {/* Message Section */}
            <div
              className={`bg-white p-8 sm:p-12 flex flex-col justify-center items-center ${isMobile ? 'w-full' : 'flex-1'}`}
              style={{ borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }}
            >
              <div className="flex flex-col items-center">
                <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h2 className="text-2xl font-semibold text-black mb-4 text-center" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', lineHeight: '1.5' }}>
                  Payment Issue Detected
                </h2>
                <div className="text-base text-gray-700 mb-8 text-center leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.01em' }}>
                  If your payment has gone through but you see this message, please contact us.<br />
                  We will resolve the issue within 1-2 business days.
                </div>
                <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-6'}`}>
                  <Link
                    href="/cart"
                    className="bg-[#D8B6FA] hover:bg-[#C8A6EA] text-black px-6 py-3 font-semibold text-base transition duration-200 flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', borderRadius: 0 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Try Again
                  </Link>
                  <Link
                    href="/"
                    className="bg-[#B7F7D8] hover:bg-[#A0EFC7] text-black px-6 py-3 font-semibold text-base transition duration-200 flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', borderRadius: 0 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}