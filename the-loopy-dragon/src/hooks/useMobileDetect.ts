import { useEffect, useState } from 'react';

export default function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const windowWidth = window.innerWidth;

      // Common mobile devices (but not tablets)
      const isMobileUserAgent = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Check for tablets (Samsung tablets, iPad, iPad Mini, etc.)
      const isTablet = 
        /(ipad|tablet|playbook|silk)|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|(kindle)|(samsung.*tablet)|(sm-t)/i.test(userAgent);
      
      // Consider it mobile if:
      // 1. It's a mobile user agent (and not a tablet), OR
      // 2. Screen width is < 768px (and not a tablet)
      setIsMobile((isMobileUserAgent || windowWidth < 768) && !isTablet);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
}