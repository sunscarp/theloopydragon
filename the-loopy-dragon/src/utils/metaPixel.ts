export const META_PIXEL_ID = "886084574557055";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const trackPageView = () => {
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
