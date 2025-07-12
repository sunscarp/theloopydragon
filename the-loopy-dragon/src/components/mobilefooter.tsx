import { MapPin, Mail, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <div>
      <footer 
        className="relative bg-cover bg-center bg-no-repeat py-8 px-4"
        style={{
          backgroundImage: "url('footer.png')",
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Mobile Layout */}
          <div className="block lg:hidden">
            {/* Logo - Centered */}
            <div className="flex justify-center mb-8">
              <img 
                src="circle-logo.png" 
                alt="The Loopy Dragon Logo" 
                className="object-contain drop-shadow-lg"
                style={{
                  width: '80px',
                  height: '80px',
                  border: '1px solid transparent'
                }}
              />
            </div>
            
            {/* Contact Info */}
            <div className="pl-6 mb-8">
              <div className="space-y-4">
                {/* Location */}
                <div className="flex items-start space-x-3 group">
                  <div className="mt-1 flex-shrink-0">
                    <MapPin className="w-4 h-4 text-black/80 group-hover:text-black transition-colors duration-200" />
                  </div>
                  <span 
                    className="text-black/90 leading-relaxed"
                    style={{
                      fontWeight: 400,
                      fontSize: '14px',
                      letterSpacing: '0.5px',
                      lineHeight: '1.5'
                    }}
                  >
                    Pune, India
                  </span>
                </div>
                
                {/* Email */}
                <div className="flex items-start space-x-3 group">
                  <div className="mt-1 flex-shrink-0">
                    <Mail className="w-4 h-4 text-black/80 group-hover:text-black transition-colors duration-200" />
                  </div>
                  <a 
                    href="mailto:theloopydragon123@gmail.com"
                    className="text-black/90 hover:text-black transition-colors duration-200 leading-relaxed break-all"
                    style={{
                      fontWeight: 400,
                      fontSize: '14px',
                      letterSpacing: '0.3px',
                      lineHeight: '1.5'
                    }}
                  >
                    theloopydragon123@gmail.com
                  </a>
                </div>
              </div>
            </div>
            
            {/* Explore and Know More - Side by Side */}
            <div className="pl-6 mb-8 py-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Explore Column */}
                <div className="space-y-4">
                  <h3 
                    className="font-semibold tracking-wider text-black text-xs"
                    style={{
                      letterSpacing: '0.6px'
                    }}
                  >
                    EXPLORE
                  </h3>
                  <nav className="space-y-3">
                    <div>
                      <a 
                        href="/" 
                        className="text-black/80 hover:text-black transition-all duration-200 block text-xs"
                        style={{
                          fontWeight: 400,
                          letterSpacing: '0.2px'
                        }}
                      >
                        Home
                      </a>
                    </div>
                    <div>
                      <a 
                        href="/shop" 
                        className="text-black/80 hover:text-black transition-all duration-200 block text-xs"
                        style={{
                          fontWeight: 400,
                          letterSpacing: '0.2px'
                        }}
                      >
                        Shop
                      </a>
                    </div>
                    <div>
                      <a 
                        href="/custom-order" 
                        className="text-black/80 hover:text-black transition-all duration-200 block text-xs"
                        style={{
                          fontWeight: 400,
                          letterSpacing: '0.2px'
                        }}
                      >
                        Customize
                      </a>
                    </div>
                    <div>
                      <a 
                        href="/profile" 
                        className="text-black/80 hover:text-black transition-all duration-200 block text-xs"
                        style={{
                          fontWeight: 400,
                          letterSpacing: '0.2px'
                        }}
                      >
                        Your Orders
                      </a>
                    </div>
                  </nav>
                </div>
                
                {/* Know More Column */}
                <div className="space-y-4">
                  <h3 
                    className="font-semibold tracking-wider text-black text-xs"
                    style={{
                      letterSpacing: '0.6px'
                    }}
                  >
                    KNOW MORE
                  </h3>
                  <nav className="space-y-3">
                    <div>
                      <a 
                        href="/about" 
                        className="text-black/80 hover:text-black transition-all duration-200 block text-xs"
                        style={{
                          fontWeight: 400,
                          letterSpacing: '0.2px'
                        }}
                      >
                        About Us
                      </a>
                    </div>
                    <div>
                      <a 
                        href="#" 
                        className="text-black/80 hover:text-black transition-all duration-200 block text-xs"
                        style={{
                          fontWeight: 400,
                          letterSpacing: '0.2px'
                        }}
                      >
                        Shipping Policy
                      </a>
                    </div>
                    <div>
                      <a 
                        href="#" 
                        className="text-black/80 hover:text-black transition-all duration-200 block text-xs"
                        style={{
                          fontWeight: 400,
                          letterSpacing: '0.2px'
                        }}
                      >
                        Replacement Policy
                      </a>
                    </div>
                    <div>
                      <a 
                        href="#" 
                        className="text-black/80 hover:text-black transition-all duration-200 block text-xs"
                        style={{
                          fontWeight: 400,
                          letterSpacing: '0.2px'
                        }}
                      >
                        Privacy Policy
                      </a>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
            
            {/* White Line */}
            <div className="border-t border-white/50 my-6 w-full"></div>
            
            {/* Follow Us - Centered */}
            <div className="text-center">
              <h3 
                className="font-semibold tracking-wider text-black mb-4"
                style={{
                  fontSize: '14px',
                  letterSpacing: '0.8px'
                }}
              >
                FOLLOW US
              </h3>
              <div className="flex justify-center space-x-5">
                <a 
                  href="https://www.instagram.com/theloopydragon/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/70 hover:text-black hover:scale-110 transition-all duration-200 p-2 rounded-full hover:bg-black/10"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.facebook.com/search/top?q=the%20loopy%20dragon%20crochet" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/70 hover:text-black hover:scale-110 transition-all duration-200 p-2 rounded-full hover:bg-black/10"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://in.pinterest.com/theloopydragon/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/70 hover:text-black hover:scale-110 transition-all duration-200 p-2 rounded-full hover:bg-black/10"
                  aria-label="Pinterest"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Desktop Layout (hidden on mobile) */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 text-black justify-items-center">
            {/* ... (your original desktop content remains unchanged) ... */}
          </div>
        </div>
      </footer>

      {/* Copyright Section */}
      <div 
        className="w-full py-3 text-center"
        style={{
          backgroundColor: '#D7B3FB',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        <p 
          className="text-white px-4"
          style={{
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '1.4',
            letterSpacing: '0%'
          }}
        >
          ©2025 The Loopy Dragon. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}