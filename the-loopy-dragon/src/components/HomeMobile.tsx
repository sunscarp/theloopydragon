import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/mobilefooter";

type Product = {
  Product: string;
  Price: number;
  ImageUrl1: string;
};

export default function HomeMobile() {
  // Fetch Top Picks from Supabase
  const [topPicksProducts, setTopPicksProducts] = useState<Product[]>([]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = require('@supabase/supabase-js').createClient(supabaseUrl, supabaseKey);

    async function fetchTopPicks() {
      const { data, error } = await supabase
        .from('Inventory')
        .select('Product, Price, ImageUrl1')
        .in('Product', [
          "Angry Hair Clip",
          "Cat Ears",
          "Sunflower Hair Tie",
          "Rose Hair Tie"
        ]);

      if (!error && data) {
        // Ensure order matches the requested list
        const order = [
          "Angry Hair Clip",
          "Cat Ears",
          "Sunflower Hair Tie",
          "Rose Hair Tie"
        ];
        const sorted = order
          .map(name => data.find((item: any) => item.Product === name))
          .filter((item): item is Product => Boolean(item));
        setTopPicksProducts(sorted);
      }
    }

    fetchTopPicks();
  }, []);

  return (
    <>
      {/* Google Fonts Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex flex-col font-sans">
        {/* Sticky Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
          <Navbar />
        </div>

        {/* Spacer for fixed navbar */}
        <div className="h-16 sm:h-20"></div>

        {/* Mobile Hero Section */}
        <section className="relative w-full overflow-hidden" style={{ margin: 0, padding: 0, border: 'none', outline: 'none' }}>
        {/* Background Image - Mobile optimized */}
        <div 
            className="w-full bg-cover bg-center bg-no-repeat"
            style={{ 
            backgroundImage: 'url(/mobile-hero.png)',
            height: 'clamp(380px, 100vw, 500px)',
            width: '100vw',
            maxWidth: 'none',
            margin: 0,
            padding: 0,
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            marginLeft: 'calc(-50vw + 50%)'
            }}
        >
            {/* Content Container - Left aligned for mobile */}
            <div className="relative h-full flex items-center">
            <div 
                className="flex flex-col justify-center w-full"
                style={{
                padding: '0 20px',
                width: '100%',
                height: 'auto',
                maxWidth: '400px',
                margin: '0' // Changed from '0 auto' to '0' for left alignment
                }}
            >
                {/* Main Heading - Left aligned, line breaks as requested */}
                <h1 
                className="text-black mb-6 leading-none text-left !text-[27.5px] md:!text-[35px] lg:!text-[40px]"
                style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0%',
                    lineHeight: '1.1'
                }}
                >
                SHOP FOR<br />
                CROCHET ITEMS
                </h1>
                                
                {/* Subtitle - Left aligned with specified styling */}
                <p 
                className="text-black mb-8 text-left"
                style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: 'clamp(12.5px, 3vw, 16px)',
                    lineHeight: '22px',
                    marginBottom: '40px'
                }}
                >
                Hey there! Welcome to The<br />
                Loopy Dragon.
                <br /><br />
                We bring you cozy, handmade<br />
                crochet pieces made with love<br />
                and a whole lot of heart!
                </p>
                
                {/* CTA Button - Left aligned instead of center */}
                <div className="flex justify-start"> {/* Changed from justify-center to justify-start */}
                <Link
                    href="/shop"
                    className="inline-flex items-center justify-center bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    style={{
                    width: 'clamp(280px, 85vw, 343px)',
                    height: 'clamp(60px, 18vw, 70px)',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    fontSize: 'clamp(12px, 5vw, 16px)',
                    letterSpacing: '0.05em',
                    borderRadius: 0
                    }}
                >
                    Check us out
                </Link>
                </div>
            </div>
            </div>
        </div>
        </section>

        {/* Top Picks Section - Mobile Layout */}
        <section 
        className="w-full py-12"
        style={{
            backgroundImage: "url('/yes.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
        }}
        >
        <div className="max-w-sm mx-auto px-4">
            {/* Section Header */}
            <div className="mb-8 text-center"> {/* Added text-center here to center all children */}
            <h2 
                className="toppicks"
                style={{
                color: '#000000',
                fontSize: '20px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 'bold',
                lineHeight: '1.2',
                marginBottom: '8px' // Reduced from mb-4 (16px) to 8px
                }}
            >
                Top Picks
            </h2>
            <p 
                className="ourmostlovedhandmadepieces"
                style={{
                color: '#000000',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: '1.2',
                width: '263px',
                margin: '0 auto'
                }}
            >
                Our most loved handmade pieces!
            </p>
            </div>

            {/* Products Grid - 2x2 layout */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {topPicksProducts.map((product, index) => (
                <div key={index} className="flex flex-col items-start">
                  {/* Product Image */}
                  <Link
                    href={`/product/${encodeURIComponent(product.Product)}`}
                    className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    style={{ 
                      textDecoration: 'none', 
                      background: 'transparent', 
                      border: 'none' 
                    }}
                  >
                    {product.ImageUrl1 ? (
                      <img 
                        src={product.ImageUrl1}
                        alt={product.Product}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTA4LjI4NCA3MCA5NS4zNDMgNzAuNzY2IDEwMC4wODkgNzYuMzE4SzEwMC4wODkgMTI4LjMxOEM5NS4zNDMgMTMzLjg3IDEwOC4yODQgMTM1IDEwMCAxMzVTMTA0LjY1NyAxMzMuODcgOTkuOTExIDEyOC4zMThWNzYuMzE4Qzk0LjY1NyA3MC43NjYgOTEuNzE2IDcwIDEwMCA3MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyMCA9MEM4Ni44NjI5IDkwIDYwIDExNi44NjMgNjAgMTUwUzg2Ljg2MjkgMjEwIDEyMCAyMTBTMTgwIDE4My4xMzcgMTgwIDE1MFMxNTMuMTM3IDkwIDEyMCA9MFoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-4xl opacity-30">🧶</span>
                      </div>
                    )}
                  </Link>
                  
                  {/* Product Info */}
                  <div className="mt-3 text-left w-full">
                    <h3 
                    className="text-black mb-1 text-[15px] !text-[15px]" // ← Arbitrary size
                    style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 100,
                        lineHeight: '1.2'
                    }}
                    >
                    {product.Product}
                    </h3>   
                    <p
                      className="font-semibold"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#000'
                      }}
                    >
                      ₹{product.Price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            <div className="flex justify-center">
              <Link
                href="/shop"
                className="group215 bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{
                  width: '343px',
                  height: '70px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  borderStyle: 'hidden',
                  outline: 'none',
                  borderRadius: 0,
                  textDecoration: 'none'
                }}
              >
                <span
                className="viewmore"
                style={{
                    color: '#000000',
                    textAlign: 'center',
                    verticalAlign: 'text-top',
                    fontSize: '16px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 'bold', // Added this line to make text bold
                    lineHeight: 'auto',
                    borderStyle: 'hidden',
                    outline: 'none',
                    width: '169.1013946533203px'
                }}
                >
                View More
                </span>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Mobile-Only Custom Orders Section */}
        {/* Mobile-Only Custom Orders Section */}
        <section 
            className="lg:hidden w-full relative overflow-hidden flex items-center justify-center"
            style={{
                backgroundImage: "url('/mobile-background.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '0'
            }}
        >
            <div className="relative z-10 w-full max-w-md py-8 px-4 text-center">
                <h2 
                    className="text-black mb-2"
                    style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: '30px',
                        lineHeight: '1.2',
                        textShadow: '1px 1px 3px rgba(255,255,255,0.8)'
                    }}
                >
                    Want Something <span style={{ color: '#BD7CFE' }}>Unique</span>?
                </h2>
                
                <p 
                    className="text-black mb-6"
                    style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 600,
                        fontSize: '17px',
                        lineHeight: '1.4',
                        textShadow: '1px 1px 3px rgba(255,255,255,0.8)'
                    }}
                >
                    We Accept Custom Crochet Orders<br />
                </p>
                
                <div className="flex justify-center">
                    <Link
                        href="/custom-order"
                        className="bg-[#D7B3FB] text-black hover:bg-[#C99AF7] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        style={{
                            width: '343px',
                            height: '70px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '0',
                            borderStyle: 'hidden',
                            outline: 'none',
                            textDecoration: 'none'
                        }}
                    >
                        <span
                            style={{
                                color: '#000000',
                                textAlign: 'center',
                                fontSize: '16px',
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 'bold',
                                lineHeight: 'auto',
                                borderStyle: 'hidden',
                                outline: 'none'
                            }}
                        >
                            Customize Now
                        </span>
                    </Link>
                </div>
            </div>
        </section>

        {/* Mobile Why Choose Us Section with Larger Heading */}
<section className="w-full py-10 px-8" style={{ backgroundColor: '#F7F0FE' }}>
  <div className="max-w-md mx-auto">
    {/* Main Heading - Now Bigger */}
    <div className="text-center">
      <h2 
        className="text-black text-left inline-block px-2"
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,  // Made bolder
          fontSize: '38px',  // Increased from 32px
          lineHeight: '1.1', // Tighter line height for larger text
          marginBottom: '28px',
          maxWidth: '280px'
        }}
      >
        Why Choose Us?
      </h2>
    </div>
    
    {/* Features List */}
    <div className="flex flex-col gap-7 pl-4">
      {/* Feature 1 */}
      <div className="text-left pl-2">
        <h3 
          className="text-black"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '1.3',
            marginBottom: '6px'
          }}
        >
          High-Quality Materials
        </h3>
        <p 
          className="text-black"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '1.4'
          }}
        >
          Only the softest, coziest yarns make the cut.
        </p>
      </div>
      
      {/* Feature 2 */}
      <div className="text-left pl-2">
        <h3 
          className="text-black"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '1.3',
            marginBottom: '6px'
          }}
        >
          Handmade with Care
        </h3>
        <p 
          className="text-black"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '1.4'
          }}
        >
          No mass production - just real hands, real skill, real heart.
        </p>
      </div>
      
      {/* Feature 3 */}
      <div className="text-left pl-2">
        <h3 
          className="text-black"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '1.3',
            marginBottom: '6px'
          }}
        >
          Uniquely Designed
        </h3>
        <p 
          className="text-black"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '1.4'
          }}
        >
          Every product is crafted with detail and creativity.
        </p>
      </div>
      
      {/* Feature 4 */}
      <div className="text-left pl-2">
        <h3 
          className="text-black"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '1.3',
            marginBottom: '6px'
          }}
        >
          Long Lasting
        </h3>
        <p 
          className="text-black"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '1.4'
          }}
        >
          Built to last and made to love, over and over again.
        </p>
      </div>
    </div>
  </div>
</section>

        {/* Instagram Section - Mobile Only */}
        <section className="w-full py-8 md:hidden" style={{ backgroundColor: '#EAD4FF' }}>
        <div className="max-w-7xl mx-auto px-3">
            {/* Section Header */}
            <div className="text-center mb-4">
            <h2 
                className="text-black mb-2"
                style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '26px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textTransform: 'capitalize'
                }}
            >
                Follow Us on Instagram
            </h2>
            <p 
                className="text-black mx-auto max-w-xs"
                style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '1.3',
                letterSpacing: '0%'
                }}
            >
                Get behind-the-scenes peeks, cozy crochet inspo, and first dibs on new drops.
            </p>
            </div>

            {/* Instagram Image - Mobile - with increased side padding */}
            <div className="w-full mb-3 px-4"> {/* Increased from px-2 to px-4 */}
            <div className="w-full overflow-hidden rounded-lg shadow-lg mx-auto" style={{ maxWidth: '90%' }}> {/* Added maxWidth to make image smaller */}
                <img 
                src="/insta-mobile.png" 
                alt="The Loopy Dragon on Instagram"
                className="w-full h-auto"
                />
            </div>
            </div>

            {/* Follow Us Button */}
            <div className="flex justify-center">
            <a
                href="https://www.instagram.com/theloopydragon/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{
                width: '343px',
                height: '70px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                borderStyle: 'hidden',
                outline: 'none',
                borderRadius: 0,
                textDecoration: 'none'
                }}
            >
                <span
                className="viewmore"
                style={{
                    color: '#000000', // Changed to black text
                    textAlign: 'center',
                    verticalAlign: 'text-top',
                    fontSize: '16px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 'bold',
                    lineHeight: 'auto',
                    borderStyle: 'hidden',
                    outline: 'none',
                    width: '169.1013946533203px'
                }}
                >
                Follow Us!
                </span>
            </a>
            </div>
        </div>
        </section>

        {/* FAQ Section - Mobile */}
        <FAQSection />

        <Footer />
      </div>
    </>
  );
}

// FAQSection component for mobile FAQ
const FAQSection = () => {
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
      answer: "Yes! Gift wrapping is available as an add-on. Just select the option when you're choosing your product. We'll make sure your order arrives looking extra special and ready to gift!"
    }
  ];

  return (
    <section className="w-full py-6 bg-white px-6">
  {/* Section Header */}
  <div className="text-center mb-4">
    <h2 
      className="text-black mb-6 leading-none !text-[20px] md:!text-[23px] lg:!text-[28px]"
      style={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 600,
        fontSize: '28px',
        lineHeight: '100%',
        letterSpacing: '0%',
        textTransform: 'capitalize'
      }}
    >
      Frequently Asked Questions
    </h2>
  </div>

  {/* FAQ Items */}
  <div className="w-full">
    {faqs.map((faq, idx) => (
      <div className="mb-3" key={idx}>
        <div className="flex justify-between items-center py-2 gap-4 px-3">
          <h3 
            className="text-black mb-0 leading-none text-left !text-[15px] md:!text-[16px] lg:!text-[18px]"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '120%',
            }}
          >
            {faq.question}
          </h3>
          <button
            className="text-black text-xl w-6 h-6 flex items-center justify-center transition-transform duration-300"
            aria-label={openFaq === idx ? "Collapse" : "Expand"}
            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
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
          className="w-full border-t my-1"
          style={{ borderColor: '#EFDEFF' }}
        ></div>
        {openFaq === idx && (
          <div
            className="text-black py-2 pl-3"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            {faq.answer}
          </div>
        )}
      </div>
    ))}
  </div>
</section>
  );
};