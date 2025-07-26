"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/mobilefooter";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ShippingPolicyPage() {
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
            .shipping-header {
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
              .shipping-header {
                font-size: 38px !important;
                letter-spacing: 0.12em !important;
                line-height: 0.9 !important;
                font-weight: 900 !important;
                text-transform: none !important;
              }
            }
            @media (max-width: 480px) {
              .shipping-header {
                font-size: 32px !important;
                letter-spacing: 0.15em !important;
              }
            }
          `}</style>
          <h1 className="shipping-header">
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
              <span style={{ position: 'relative', zIndex: 2 }}>S</span>
            </span>
            <span style={{ position: 'relative', zIndex: 2 }}>hipping Policy</span>
          </h1>
        </div>
        {/* Add shipping-policy image with transparent background */}
        <div className="flex justify-center my-10" style={{ background: "transparent" }}>
          <Image
            src="/about-us.png"
            alt="Shipping Policy"
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
        {/* Shipping Policy Content */}
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
          <b>1. Overview</b>
          <div style={{ marginBottom: "1.5em" }} />
          At The Loopy Dragon, we are committed to delivering your handcrafted crochet items safely and efficiently. This Shipping Policy outlines our shipping practices, timelines, and responsibilities.
          <div style={{ marginBottom: "2em" }} />
          <b>2. Shipping Coverage</b>
          <div style={{ marginBottom: "1em" }} />
          <b>2.1 Domestic Shipping Only</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We ship exclusively within India</li>
            <li>We deliver to all locations where our shipping partner Delhivery provides service</li>
            <li>Coverage includes both urban and rural areas as per Delhivery's network</li>
          </ul>
          <b>2.2 Shipping Address</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We ship to any address provided by the customer</li>
            <li>We accept deliveries to residential addresses, offices, and PO Boxes</li>
            <li>Please ensure your shipping address is complete and accurate</li>
            <li>Address changes after order confirmation may not be possible once shipped</li>
          </ul>
          <b>3. Shipping Costs</b>
          <div style={{ marginBottom: "1em" }} />
          <b>3.1 Customer Responsibility</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Shipping charges are borne by the customer</li>
            <li>Shipping costs are calculated as a flat rate based on your delivery location</li>
            <li>All shipping charges will be displayed at checkout before payment</li>
          </ul>
          <b>3.2 No Free Shipping</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We do not offer free shipping on any orders</li>
            <li>Shipping charges are separate from product costs</li>
          </ul>
          <b>4. Shipping Service</b>
          <div style={{ marginBottom: "1em" }} />
          <b>4.1 Shipping Partner</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We exclusively use Delhivery as our logistics partner</li>
            <li>All shipments are handled through Delhivery's network</li>
          </ul>
          <b>4.2 Service Type</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We offer standard shipping only</li>
            <li>No express or priority shipping options available</li>
          </ul>
          <b>5. Processing and Delivery Timeline</b>
          <div style={{ marginBottom: "1em" }} />
          <b>5.1 Processing Time</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Existing products: Maximum 2 weeks processing time</li>
            <li>Custom/made-to-order items: Processing time communicated at order placement</li>
            <li>Orders are processed in the sequence they are received</li>
          </ul>
          <b>5.2 Delivery Timeline</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Standard delivery: Approximately 1 week after dispatch</li>
            <li>Delivery time may vary based on your location and Delhivery's service schedule</li>
            <li>Remote or rural areas may experience slightly longer delivery times</li>
          </ul>
          <b>5.3 Timeline Disclaimer</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>All delivery timelines are estimates provided by Delhivery</li>
            <li>Actual delivery times may vary due to factors beyond our control</li>
            <li>We are not responsible for delays caused by the shipping carrier</li>
          </ul>
          <b>6. Order Tracking</b>
          <div style={{ marginBottom: "1em" }} />
          <b>6.1 Tracking Information</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Once your order is dispatched, you will receive tracking information</li>
            <li>Tracking details are available in the "Your Orders" section of our website</li>
            <li>You can monitor your shipment's progress through the provided tracking link</li>
          </ul>
          <b>6.2 Order Updates</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>You will receive notifications at key shipping milestones</li>
            <li>Track your package directly through Delhivery's system using the provided tracking number</li>
          </ul>
          <b>7. Packaging</b>
          <div style={{ marginBottom: "1em" }} />
          <b>7.1 Standard Packaging</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>All items are carefully packed in sturdy cardboard boxes</li>
            <li>We ensure secure packaging to protect your handcrafted items during transit</li>
          </ul>
          <b>7.2 Special Packaging</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Fragile items: Extra protection with bubble wrap for delicate items like jewelry and toys</li>
            <li>Gift option: We offer gift wrapping service - select "wrap as gift" during checkout</li>
          </ul>
          <b>7.3 Packaging Materials</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We use appropriate packaging materials to ensure product safety</li>
            <li>Environmental considerations are taken into account where possible</li>
          </ul>
          <b>8. Delivery Process</b>
          <div style={{ marginBottom: "1em" }} />
          <b>8.1 Delivery Attempt</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Delhivery will attempt delivery to the provided address</li>
            <li>No signature required for delivery</li>
            <li>Package inspection upon delivery is not mandatory</li>
          </ul>
          <b>8.2 Delivery Responsibility</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>Once the package is handed over to Delhivery, it is their responsibility</li>
            <li>We are not liable for delays, damage, or loss during transit</li>
            <li>Any delivery-related issues should be resolved directly with Delhivery</li>
          </ul>
          <b>8.3 Failed Delivery</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>If delivery fails, Delhivery will follow their standard retry process</li>
            <li>Additional delivery attempts are subject to Delhivery's policies</li>
            <li>Customers may need to coordinate directly with Delhivery for successful delivery</li>
          </ul>
          <b>9. Shipping Restrictions</b>
          <div style={{ marginBottom: "1em" }} />
          <b>9.1 Product Restrictions</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We ship all products in our catalog without restrictions</li>
            <li>No special handling requirements for any specific items</li>
          </ul>
          <b>9.2 Address Restrictions</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We deliver to any address within Delhivery's service network</li>
            <li>International shipping is not available</li>
          </ul>
          <b>10. Shipping Issues and Resolution</b>
          <div style={{ marginBottom: "1em" }} />
          <b>10.1 Our Responsibility</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We are responsible for proper packaging and handing over to Delhivery</li>
            <li>Once dispatched, shipping-related issues are handled by Delhivery</li>
          </ul>
          <b>10.2 Lost or Damaged Packages</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>For lost, damaged, or delayed shipments, customers should contact Delhivery directly</li>
            <li>We will provide necessary order details to assist in resolution</li>
            <li>Replacement or refund decisions are made case-by-case</li>
          </ul>
          <b>10.3 Incorrect Address</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We are not responsible for deliveries to incorrect addresses provided by customers</li>
            <li>Address verification is the customer's responsibility</li>
          </ul>
          <b>11. Peak Season and Delays</b>
          <div style={{ marginBottom: "1em" }} />
          <b>11.1 Festival Seasons</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>During festival seasons and peak periods, deliveries may experience delays</li>
            <li>We will communicate any expected delays through our website or customer notifications</li>
          </ul>
          <b>11.2 Force Majeure</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We are not liable for shipping delays due to natural disasters, strikes, or other circumstances beyond our control</li>
          </ul>
          <b>12. Contact for Shipping Queries</b>
          <div style={{ marginBottom: "1em" }} />
          <b>12.1 Pre-Dispatch Queries</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>For questions about processing or dispatch status:</li>
            <li>Email: theloopydragon123@gmail.com</li>
            <li>Website: Contact Us page</li>
          </ul>
          <b>12.2 Post-Dispatch Queries</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>For tracking and delivery issues:</li>
            <li>Use the tracking information provided</li>
            <li>Contact Delhivery customer service directly</li>
            <li>We can assist with order details if needed</li>
          </ul>
          <b>13. Policy Updates</b>
          <div style={{ marginBottom: "1em" }} />
          <b>13.1 Changes to Shipping Policy</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "1em" }}>
            <li>We reserve the right to update this shipping policy</li>
            <li>Changes will be effective immediately upon posting on our website</li>
            <li>Customers will be notified of significant changes</li>
          </ul>
          <b>13.2 Shipping Partner Changes</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>We may change shipping partners based on service quality and coverage</li>
            <li>Customers will be informed of any changes that affect their orders</li>
          </ul>
          <b>14. Important Notes</b>
          <ul style={{ marginLeft: "1.5em", marginBottom: "2em" }}>
            <li>Order Accuracy: Please double-check your shipping address before confirming your order</li>
            <li>Communication: Keep your contact information updated for smooth delivery coordination</li>
            <li>Patience: Handcrafted items take time - we appreciate your understanding of our processing timelines</li>
          </ul>
          <div style={{ marginBottom: "2em" }} />
          Thank you for choosing The Loopy Dragon. We're committed to getting your handcrafted crochet items to you safely!
        </div>
      </section>
      {/* Conditional Footer rendering */}
      {isMobile ? <MobileFooter /> : <Footer />}
    </div>
  );
}
