"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/mobilefooter";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function TermsAndConditionsPage() {
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
            .terms-header {
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
              .terms-header {
                font-size: 38px !important;
                letter-spacing: 0.12em !important;
                line-height: 0.9 !important;
                font-weight: 900 !important;
                text-transform: none !important;
              }
            }
            @media (max-width: 480px) {
              .terms-header {
                font-size: 32px !important;
                letter-spacing: 0.15em !important;
              }
            }
          `}</style>
          <h1 className="terms-header">
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
              <span style={{ position: 'relative', zIndex: 2 }}>T</span>
            </span>
            <span style={{ position: 'relative', zIndex: 2 }}>erms and Conditions</span>
          </h1>
        </div>
        {/* Add image with transparent background */}
        <div className="flex justify-center my-10" style={{ background: "transparent" }}>
          <Image
            src="/about-us.png"
            alt="Terms and Conditions"
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
        {/* Terms and Conditions Content */}
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
          Welcome to The Loopy Dragon! These Terms and Conditions ("Terms") govern your use of our website and the purchase of our handcrafted crochet products. By accessing our website or making a purchase, you agree to be bound by these Terms.
          <div style={{ marginBottom: "1em" }} />
          <span style={{ fontWeight: 600 }}>Business Information:</span>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>Business Name: The Loopy Dragon</li>
            <li>Location: Pune, Maharashtra, India</li>
            <li>Contact Email: theloopydragon123@gmail.com</li>
          </ul>
          <b>2. Products and Services</b>
          <div style={{ marginBottom: "1em" }} />
          <b>2.1 Product Range</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We specialize in handcrafted crochet items including:</li>
            <li>Accessories</li>
            <li>Toys</li>
            <li>Jewelry</li>
            <li>Magnets</li>
            <li>Hair accessories</li>
            <li>Other</li>
          </ul>
          <b>2.2 Custom Orders</b>
          <div style={{ marginBottom: "0.5em" }} />
          We offer both ready-made products and custom/made-to-order items. Custom orders are subject to additional terms regarding specifications, timelines, and approval processes.
          <div style={{ marginBottom: "0.5em" }} />
          <b>2.3 Product Availability</b>
          <div style={{ marginBottom: "0.5em" }} />
          All products are subject to availability. We reserve the right to discontinue any product at any time without prior notice.
          <div style={{ marginBottom: "2em" }} />
          <b>3. Ordering and Payment</b>
          <div style={{ marginBottom: "1em" }} />
          <b>3.1 Order Process</b>
          <div style={{ marginBottom: "0.5em" }} />
          By placing an order, you are making an offer to purchase products subject to these Terms. All orders are subject to acceptance by The Loopy Dragon.
          <div style={{ marginBottom: "0.5em" }} />
          <b>3.2 Payment</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We accept payments through Razorpay</li>
            <li>Payment must be completed at the time of order placement</li>
            <li>All prices are listed in Indian Rupees (INR)</li>
            <li>We reserve the right to change prices at any time without prior notice</li>
          </ul>
          <b>3.3 Order Confirmation</b>
          <div style={{ marginBottom: "0.5em" }} />
          You will receive an order confirmation via email once your payment is processed successfully.
          <div style={{ marginBottom: "2em" }} />
          <b>4. Shipping and Delivery</b>
          <div style={{ marginBottom: "1em" }} />
          <b>4.1 Processing Time</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Existing products: Maximum 2 weeks processing time</li>
            <li>Custom orders: Processing time will be communicated at the time of order placement</li>
          </ul>
          <b>4.2 Delivery</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Delivery within India: Approximately 1 week after processing</li>
            <li>We ship domestically within India only</li>
            <li>Delivery times are estimates and not guaranteed</li>
          </ul>
          <b>4.3 Shipping Responsibility</b>
          <div style={{ marginBottom: "0.5em" }} />
          Once products are handed over to the shipping carrier, The Loopy Dragon is not responsible for delays, damage, or loss during transit.
          <div style={{ marginBottom: "2em" }} />
          <b>5. Returns, Exchanges, and Refunds</b>
          <div style={{ marginBottom: "1em" }} />
          <b>5.1 No Returns Policy</b>
          <div style={{ marginBottom: "0.5em" }} />
          We do not accept returns, exchanges, or provide refunds for any products once they have been shipped.
          <div style={{ marginBottom: "0.5em" }} />
          <b>5.2 Product Issues</b>
          <div style={{ marginBottom: "0.5em" }} />
          If you receive a damaged or defective product, please contact us immediately at:
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Email: theloopydragon123@gmail.com</li>
            <li>Through our website's Contact Us page</li>
          </ul>
          We will review each case individually and provide appropriate resolution at our discretion.
          <div style={{ marginBottom: "2em" }} />
          <b>6. Product Care Instructions</b>
          <div style={{ marginBottom: "1em" }} />
          <b>6.1 Care Guidelines</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Wash with cold water only</li>
            <li>Do not use harsh detergents or chemicals</li>
            <li>Handle with care to preserve the handcrafted nature of the product</li>
          </ul>
          <b>6.2 No Warranty</b>
          <div style={{ marginBottom: "0.5em" }} />
          Our products are sold "as is" without any warranty, express or implied. We do not guarantee the durability or longevity of products beyond normal wear and tear.
          <div style={{ marginBottom: "2em" }} />
          <b>7. Customer Information and Privacy</b>
          <div style={{ marginBottom: "1em" }} />
          <b>7.1 Information Collection</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Name and contact details</li>
            <li>Shipping address</li>
            <li>Email address</li>
            <li>Payment information (processed securely through Razorpay)</li>
          </ul>
          <b>7.2 Use of Information</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Order processing and fulfillment</li>
            <li>Communication regarding orders</li>
            <li>Delivery coordination</li>
          </ul>
          <b>7.3 Information Protection</b>
          <div style={{ marginBottom: "0.5em" }} />
          We are committed to protecting your personal information and will not share it with third parties except as necessary for order fulfillment and delivery.
          <div style={{ marginBottom: "2em" }} />
          <b>8. Intellectual Property</b>
          <div style={{ marginBottom: "1em" }} />
          <b>8.1 Product Designs</b>
          <div style={{ marginBottom: "0.5em" }} />
          All product designs, patterns, and creative works are the intellectual property of The Loopy Dragon. Customers may not reproduce, copy, or create derivative works based on our designs for commercial purposes.
          <div style={{ marginBottom: "0.5em" }} />
          <b>8.2 Website Content</b>
          <div style={{ marginBottom: "0.5em" }} />
          All content on our website, including images, text, and design elements, is protected by copyright and belongs to The Loopy Dragon.
          <div style={{ marginBottom: "2em" }} />
          <b>9. Limitation of Liability</b>
          <div style={{ marginBottom: "1em" }} />
          <b>9.1 Liability Limits</b>
          <div style={{ marginBottom: "0.5em" }} />
          The Loopy Dragon's liability for any claim related to products or services shall not exceed the amount paid for the specific product in question.
          <div style={{ marginBottom: "0.5em" }} />
          <b>9.2 Exclusions</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Indirect, incidental, or consequential damages</li>
            <li>Loss of profits or business interruption</li>
            <li>Damages arising from misuse of products</li>
            <li>Delays in shipping or delivery</li>
          </ul>
          <div style={{ marginBottom: "2em" }} />
          <b>10. Customer Eligibility</b>
          <div style={{ marginBottom: "1em" }} />
          <b>10.1 Age Requirements</b>
          <div style={{ marginBottom: "0.5em" }} />
          There are no age restrictions for purchasing our products. Any person capable of making a purchase is welcome to buy from us.
          <div style={{ marginBottom: "0.5em" }} />
          <b>10.2 Legal Capacity</b>
          <div style={{ marginBottom: "0.5em" }} />
          By making a purchase, you represent that you have the legal capacity to enter into this agreement.
          <div style={{ marginBottom: "2em" }} />
          <b>11. Dispute Resolution</b>
          <div style={{ marginBottom: "1em" }} />
          <b>11.1 Governing Law</b>
          <div style={{ marginBottom: "0.5em" }} />
          These Terms are governed by the laws of India and the jurisdiction of Pune, Maharashtra.
          <div style={{ marginBottom: "0.5em" }} />
          <b>11.2 Contact for Disputes</b>
          <div style={{ marginBottom: "0.5em" }} />
          For any disputes or concerns, please contact us first at theloopydragon123@gmail.com. We will make every effort to resolve issues amicably.
          <div style={{ marginBottom: "2em" }} />
          <b>12. Modifications to Terms</b>
          <div style={{ marginBottom: "1em" }} />
          <b>12.1 Right to Modify</b>
          <div style={{ marginBottom: "0.5em" }} />
          The Loopy Dragon reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website.
          <div style={{ marginBottom: "0.5em" }} />
          <b>12.2 Notification</b>
          <div style={{ marginBottom: "0.5em" }} />
          We will make reasonable efforts to notify customers of significant changes to these Terms.
          <div style={{ marginBottom: "2em" }} />
          <b>13. Severability</b>
          <div style={{ marginBottom: "1em" }} />
          If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will continue to be valid and enforceable.
          <div style={{ marginBottom: "2em" }} />
          <b>14. Contact Information</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>Email: theloopydragon123@gmail.com</li>
            <li>Contact Us Page: Available on our website</li>
          </ul>
          <b>15. Acceptance</b>
          <div style={{ marginBottom: "1.5em" }} />
          By using our website and/or making a purchase, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          <div style={{ marginBottom: "2em" }} />
          Thank you for choosing The Loopy Dragon for your handcrafted crochet needs!
        </div>
      </section>
      {/* Conditional Footer rendering */}
      {isMobile ? <MobileFooter /> : <Footer />}
    </div>
  );
}
