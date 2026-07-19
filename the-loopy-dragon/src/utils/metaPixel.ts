export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type FbqFunction = {
  (...args: any[]): void;
  callMethod?: (...args: any[]) => void;
  queue: any[];
  push: any;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq: FbqFunction;
    _fbq?: FbqFunction;
  }
}

export const initMetaPixel = () => {
  if (!META_PIXEL_ID || META_PIXEL_ID === 'YOUR_PIXEL_ID_HERE') return;

  if (typeof window === 'undefined') return;

  if (window._fbq) return;

  const f: any = function () {
    f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments);
  };
  window.fbq = f;
  if (!window._fbq) window._fbq = f;
  f.push = f;
  f.loaded = true;
  f.version = '2.0';
  f.queue = [];

  const t = document.createElement('script');
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(t);

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
};

export const trackPageView = (url?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const trackViewContent = (contentName: string, contentId?: string, value?: number, currency = 'INR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_ids: contentId ? [contentId] : undefined,
      value: value,
      currency: currency,
    });
  }
};

export const trackAddToCart = (contentName: string, contentId: string, value: number, quantity = 1, currency = 'INR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: contentName,
      content_ids: [contentId],
      value: value,
      currency: currency,
      num_items: quantity,
    });
  }
};

export const trackInitiateCheckout = (value: number, numItems: number, currency = 'INR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      num_items: numItems,
      currency: currency,
    });
  }
};

export const trackPurchase = (value: number, contentIds: string[], numItems: number, currency = 'INR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      content_ids: contentIds,
      num_items: numItems,
      currency: currency,
    });
  }
};

export const trackSearch = (searchString: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchString,
    });
  }
};

export const trackCustomEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
};
