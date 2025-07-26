"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/mobilefooter";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function PrivacyPolicyPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F9FF] flex flex-col font-sans scroll-smooth">
      {/* Sticky Navbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? 'bg-white/95 shadow-xl backdrop-blur-md py-2 px-4 sm:px-6'
            : 'bg-transparent py-4 px-6 sm:px-8'
        }`}
      >
        <Navbar />
      </div>
      {/* Spacer to prevent content overlap */}
      <div className="h-16 sm:h-20"></div>
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
        {/* Header with decorative circles */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '2.5rem' }}>
          <style jsx>{`
            .privacy-header {
              font-family: Montserrat, sans-serif;
              font-size: 44px;
              font-weight: 900;
              color: #22223B;
              margin-bottom: 0.5rem;
              letter-spacing: 0.05em;
              position: relative;
              z-index: 2;
              display: inline-block;
              text-transform: none;
              line-height: 1.1;
            }
            @media (max-width: 767px) {
              .privacy-header {
                font-size: 38px !important;
                letter-spacing: 0.12em !important;
                line-height: 0.9 !important;
                font-weight: 900 !important;
                text-transform: none !important;
              }
            }
            @media (max-width: 480px) {
              .privacy-header {
                font-size: 32px !important;
                letter-spacing: 0.15em !important;
              }
            }
          `}</style>
          <h1 className="privacy-header">
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span
                style={{
                  position: 'absolute',
                  left: isMobile ? '-12px' : '-16px',
                  top: isMobile ? '2px' : '10px',
                  width: isMobile ? '36px' : '48px',
                  height: isMobile ? '36px' : '48px',
                  background: '#EFDFFF',
                  borderRadius: '50%',
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              />
              <span style={{ position: 'relative', zIndex: 2 }}>P</span>
            </span>
            <span style={{ position: 'relative', zIndex: 2 }}>rivacy Policy</span>
          </h1>
        </div>
        {/* Add image with transparent background */}
        <div className="flex justify-center my-10" style={{ background: "transparent" }}>
          <Image
            src="/about-us.png"
            alt="Privacy Policy"
            width={isMobile ? 380 : 600}
            height={isMobile ? 260 : 400}
            style={{
              borderRadius: 0,
              objectFit: "contain",
              background: "transparent"
            }}
            priority
          />
        </div>
        {/* Privacy Policy Content */}
        <div className="max-w-3xl mx-auto" style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 400,
          fontSize: isMobile ? "14px" : "17px",
          color: "#22223B",
          letterSpacing: "0.01em",
          lineHeight: "1.7",
          marginBottom: "2.5rem",
          textAlign: "left"
        }}>
          <div style={{ fontWeight: 700, fontSize: isMobile ? "18px" : "22px", marginBottom: "1.2em" }}>
            The Loopy Dragon
          </div>
          <div style={{ fontWeight: 500, fontSize: isMobile ? "13px" : "15px", marginBottom: "2em" }}>
            Last Updated: 25th July 2025
          </div>
          <b>1. Introduction</b>
          <div style={{ marginBottom: "1.5em" }} />
          At The Loopy Dragon, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website and purchase our handcrafted crochet products.
          <div style={{ marginBottom: "1em" }} />
          <span style={{ fontWeight: 600 }}>Contact Information:</span>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>Business Name: The Loopy Dragon</li>
            <li>Location: Pune, Maharashtra, India</li>
            <li>Email: theloopydragon123@gmail.com</li>
          </ul>
          <b>2. Information We Collect</b>
          <div style={{ marginBottom: "1em" }} />
          <b>2.1 Personal Information</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Name (as provided through Google Login)</li>
            <li>Email address (from your Google account)</li>
            <li>Phone number (for delivery coordination)</li>
            <li>Shipping address (for order fulfillment)</li>
            <li>Payment information (processed securely through Razorpay)</li>
          </ul>
          <b>2.2 Account Information</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We use Google Login exclusively for account creation</li>
            <li>Your Google account information is used only for authentication purposes</li>
            <li>We do not collect birthdates or age-related information</li>
          </ul>
          <b>2.3 Order Information</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Purchase history and order details</li>
            <li>Product preferences and selections</li>
            <li>Custom order specifications (if applicable)</li>
          </ul>
          <b>2.4 Technical Information</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>Basic website usage patterns for internal analytics</li>
            <li>No cookies or tracking technologies are used on our website</li>
            <li>No behavioral tracking or user profiling</li>
          </ul>
          <b>3. How We Use Your Information</b>
          <div style={{ marginBottom: "1em" }} />
          <b>3.1 Primary Uses</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Order processing and fulfillment</li>
            <li>Communication regarding your orders</li>
            <li>Delivery coordination with shipping partners</li>
            <li>Customer service and support</li>
            <li>Internal business analytics and insights</li>
          </ul>
          <b>3.2 What We DON'T Do</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>Send marketing emails or newsletters</li>
            <li>Share your data with third parties (except as noted below)</li>
            <li>Use your data for advertising or promotional purposes</li>
            <li>Personalize your shopping experience based on past purchases</li>
            <li>Track your browsing behavior across our website</li>
          </ul>
          <b>4. Information Sharing and Disclosure</b>
          <div style={{ marginBottom: "1em" }} />
          <b>4.1 Limited Sharing</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We share your information only when necessary for order fulfillment:</li>
            <li>Razorpay: Payment processing (they handle payment data securely)</li>
            <li>Delhivery: Shipping and delivery (name, phone, address only)</li>
          </ul>
          <b>4.2 No Third-Party Sharing</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We do not sell, rent, or share your personal information with any other third parties</li>
            <li>We do not use social media plugins or external tracking tools</li>
            <li>We do not share data with marketing companies or advertisers</li>
          </ul>
          <b>4.3 Legal Compliance</b>
          <div style={{ marginBottom: "0.5em" }} />
          We may disclose information if required by law or to protect our legal rights, but only to the extent necessary.
          <div style={{ marginBottom: "2em" }} />
          <b>5. Data Storage and Security</b>
          <div style={{ marginBottom: "1em" }} />
          <b>5.1 Storage Location</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>All customer data is stored securely on Supabase cloud infrastructure</li>
            <li>Data is stored within secure, industry-standard data centers</li>
          </ul>
          <b>5.2 Security Measures</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Your data is completely secured using industry-standard encryption</li>
            <li>Access to customer data is restricted to authorized personnel only</li>
            <li>We implement appropriate technical and organizational measures to protect your information</li>
          </ul>
          <b>5.3 Payment Security</b>
          <div style={{ marginBottom: "0.5em" }} />
          Payment information is processed and stored by Razorpay, not on our systems
          <br />
          We comply with applicable security standards for payment processing
          <div style={{ marginBottom: "2em" }} />
          <b>6. Data Retention</b>
          <div style={{ marginBottom: "1em" }} />
          <b>6.1 Retention Period</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Customer data is automatically deleted after 1 month from the date of last interaction</li>
            <li>This includes personal information, order history, and account details</li>
            <li>We maintain this policy to minimize data storage and protect your privacy</li>
          </ul>
          <b>6.2 Exceptions</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>Data may be retained longer if required for legal compliance or dispute resolution</li>
            <li>Anonymous analytics data may be retained for business insights</li>
          </ul>
          <b>7. Your Rights and Choices</b>
          <div style={{ marginBottom: "1em" }} />
          <b>7.1 Account Management</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Accounts are created exclusively through Google Login</li>
            <li>You cannot directly update your information through our website</li>
            <li>For any changes, please contact us at theloopydragon123@gmail.com</li>
          </ul>
          <b>7.2 Data Deletion</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>If you want to delete your data before the automatic 1-month deletion, contact us at theloopydragon123@gmail.com</li>
            <li>We will process deletion requests promptly</li>
            <li>Some information may need to be retained for legal or business purposes</li>
          </ul>
          <b>7.3 Data Export</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>You have the right to request a copy of your personal data</li>
            <li>Contact us at theloopydragon123@gmail.com to request data export</li>
            <li>We will provide your data in a readable format within a reasonable timeframe</li>
          </ul>
          <b>7.4 Communication Preferences</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We do not send marketing emails or newsletters</li>
            <li>You will only receive essential order-related communications</li>
          </ul>
          <b>8. Children's Privacy</b>
          <div style={{ marginBottom: "1em" }} />
          <b>8.1 No Age Restrictions</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We do not impose age restrictions on purchases</li>
            <li>We do not knowingly collect additional information from minors</li>
            <li>Parental supervision is recommended for purchases by minors</li>
          </ul>
          <b>9. Google Login Integration</b>
          <div style={{ marginBottom: "1em" }} />
          <b>9.1 Authentication Only</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Google Login is used solely for account authentication</li>
            <li>We access only basic profile information (name and email)</li>
            <li>We do not access other Google services or data</li>
          </ul>
          <b>9.2 Google's Privacy Policy</b>
          <div style={{ marginBottom: "0.5em" }} />
          Google's privacy practices are governed by their own privacy policy
          <br />
          We recommend reviewing Google's privacy policy for their data handling practices
          <div style={{ marginBottom: "2em" }} />
          <b>10. Analytics and Business Intelligence</b>
          <div style={{ marginBottom: "1em" }} />
          <b>10.1 Internal Analytics</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We use customer data for internal business analytics and insights</li>
            <li>This helps us understand business performance and customer preferences</li>
            <li>All analytics are conducted internally without external tools</li>
          </ul>
          <b>10.2 No External Tracking</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We do not use Google Analytics, Facebook Pixel, or similar tracking tools</li>
            <li>No third-party analytics services are used on our website</li>
            <li>No behavioral tracking or user profiling is performed</li>
          </ul>
          <b>11. Website Technology</b>
          <div style={{ marginBottom: "1em" }} />
          <b>11.1 No Cookies</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Our website does not use cookies for tracking or personalization</li>
            <li>Basic technical cookies may be used for website functionality only</li>
          </ul>
          <b>11.2 No Third-Party Tools</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We do not use chatbots or external customer service tools</li>
            <li>No social media plugins or external widgets are embedded</li>
            <li>No third-party scripts that collect user data</li>
          </ul>
          <b>12. Changes to This Privacy Policy</b>
          <div style={{ marginBottom: "1em" }} />
          <b>12.1 Policy Updates</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We may update this privacy policy from time to time</li>
            <li>Changes will be posted on this page with an updated date</li>
            <li>Significant changes will be communicated through appropriate channels</li>
          </ul>
          <b>12.2 Continued Use</b>
          <div style={{ marginBottom: "0.5em" }} />
          Your continued use of our website after policy changes constitutes acceptance of the updated policy
          <div style={{ marginBottom: "2em" }} />
          <b>13. Contact Us</b>
          <div style={{ marginBottom: "1em" }} />
          <b>13.1 Privacy Questions</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>For any questions about this privacy policy or your personal data:</li>
            <li>Email: theloopydragon123@gmail.com</li>
            <li>Subject Line: Please include "Privacy Policy" in your subject line</li>
          </ul>
          <b>13.2 Data Requests</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>For data deletion, export, or other privacy-related requests:</li>
            <li>Email: theloopydragon123@gmail.com</li>
            <li>Response Time: We will respond to requests within 7 business days</li>
          </ul>
          <b>14. Governing Law</b>
          <div style={{ marginBottom: "1em" }} />
          This privacy policy is governed by the laws of India and the jurisdiction of Pune, Maharashtra.
          <div style={{ marginBottom: "2em" }} />
          <b>15. Consent</b>
          <div style={{ marginBottom: "1.5em" }} />
          By using our website and creating an account, you consent to the collection and use of your information as described in this privacy policy.
          <div style={{ marginBottom: "2em" }} />
          Your privacy is important to us. Thank you for trusting The Loopy Dragon with your personal information.
        </div>
      </section>
      {/* Conditional Footer rendering */}
      {isMobile ? <MobileFooter /> : <Footer />}
    </div>
  );
}
