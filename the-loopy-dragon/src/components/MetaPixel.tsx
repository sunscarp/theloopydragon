"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initMetaPixel, trackPageView, META_PIXEL_ID } from "@/utils/metaPixel";

export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    initMetaPixel();
  }, []);

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  if (!META_PIXEL_ID || META_PIXEL_ID === 'YOUR_PIXEL_ID_HERE') return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
