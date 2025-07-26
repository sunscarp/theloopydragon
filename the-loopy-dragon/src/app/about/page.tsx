"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/mobilefooter";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function About() {
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
        {/* ABOUT header with decorative circles */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '2.5rem' }}>
          <style jsx>{`
            .about-header {
              font-family: Montserrat, sans-serif;
              font-size: 50px;
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
              .about-header {
                font-size: 48px !important;
                letter-spacing: 0.12em !important;
                line-height: 0.9 !important;
                font-weight: 900 !important;
                text-transform: none !important;
              }
            }
            
            @media (max-width: 480px) {
              .about-header {
                font-size: 44px !important;
                letter-spacing: 0.15em !important;
              }
            }
          `}</style>
          
          <h1 className="about-header">
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
              <span style={{ position: 'relative', zIndex: 2 }}>A</span>
            </span>
            <span style={{ position: 'relative', zIndex: 2 }}>BOUT&nbsp;US</span>
          </h1>
        </div>

        {/* Add about-us.png image with transparent background */}
        <div className="flex justify-center my-10" style={{ background: "transparent" }}>
          <Image
            src="/about-us.png"
            alt="About Us"
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
        {/* Meet The Loopy Dragon Team */}
        <div className="mt-8 mb-4" style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? "22px" : "28px",
          color: "#22223B",
          letterSpacing: "0.02em",
          textAlign: "center"
        }}>
          Meet The Loopy Dragon Team
        </div>
        {/* Team Description */}
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
          We're a small team of makers who crochet every single piece ourselves, and lots of love go into everything we create. From plushies and bookmarks to cute clips and custom pieces, we're all about turning cozy yarn into things that make you (and us!) smile.
          <br /><br />
          <span style={{ fontWeight: 600 }}>Why we do this:</span>
          <br />
          Because we love making stuff that sparks joy; whether it's a bunny plushie you hug on bad days, a fox bookmark for your current read, or a custom keychain that's so you.
          <br /><br />
          <span style={{ fontWeight: 600 }}>What makes us different:</span>
          <ul style={{
            marginTop: "0.5em",
            marginBottom: "0.5em",
            paddingLeft: "1.5em",
            listStyleType: "disc"
          }}>
            <li style={{ marginBottom: "0.5em" }}>Handmade from scratch by us: no factories, just our hooks, yarn, and creativity.</li>
            <li style={{ marginBottom: "0.5em" }}>We use quality yarns: acrylic, cotton (baby-safe!), and velvet for that extra plush vibe.</li>
            <li style={{ marginBottom: "0.5em" }}>Custom orders? Always! Slide into our DMs or use the customize option, your ideas keep us inspired.</li>
            <li style={{ marginBottom: "0.5em" }}>Every piece is unique, because that's what handmade is all about.</li>
          </ul>
          <br />
          <span>Thanks for being here, cheering us on, and supporting small creators.</span>
          <br />
          <span>Stay loopy, stay cozy!</span>
          <br />
          {"— Team Loopy Dragon"}
        </div>
      </section>

      {/* Conditional Footer rendering */}
      {isMobile ? <MobileFooter /> : <Footer />}
    </div>
  );
}