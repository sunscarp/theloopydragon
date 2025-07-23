export type DragonOffer = {
  id: string;
  type: 'discount' | 'free_product';
  title: string;
  description: string;
  value: number; // percentage for discounts, product_id for free products
  code?: string; // discount code
  minOrderValue?: number; // minimum order value for discount
  productId?: number; // for free products
  weight: number; // probability weight
  isFirstTime?: boolean; // special handling for first time offers
};

const DRAGON_OFFERS: DragonOffer[] = [
  {
    id: 'discount_10',
    type: 'discount',
    title: '10% Off Your Order!',
    description: 'Get 10% off your entire order',
    value: 10,
    code: 'DRAGON10',
    weight: 15
  },
  {
    id: 'discount_20',
    type: 'discount',
    title: '20% Off Your Order!',
    description: 'Get 20% off your entire order',
    value: 20,
    code: 'DRAGON20',
    weight: 10
  },
  {
    id: 'free_keychain',
    type: 'free_product',
    title: 'Free Random Crochet Keychain!',
    description: 'Add a random crochet keychain to your cart for free',
    value: 0,
    productId: 999001, // Special product ID for random keychain
    weight: 10
  },
  {
    id: 'free_magnet',
    type: 'free_product',
    title: 'Free Random Crochet Magnet!',
    description: 'Add a random crochet magnet to your cart for free',
    value: 0,
    productId: 999002, // Special product ID for random magnet
    weight: 10
  },
  {
    id: 'free_bookmark',
    type: 'free_product',
    title: 'Free Bookmark!',
    description: 'Add a beautiful bookmark to your cart for free',
    value: 0,
    productId: 999003, // Special product ID for bookmark
    weight: 15
  },
  {
    id: 'free_sticker_pack',
    type: 'free_product',
    title: 'Free Small Sticker Pack!',
    description: 'Add a small sticker pack to your cart for free',
    value: 0,
    productId: 999004, // Special product ID for sticker pack
    weight: 15
  },
  {
    id: 'discount_100',
    type: 'discount',
    title: '₹100 Off Orders Above ₹550!',
    description: 'Get ₹100 off when you spend ₹550 or more',
    value: 100,
    code: 'DRAGON100',
    minOrderValue: 550,
    weight: 20
  },
  {
    id: 'rare_dragon_50',
    type: 'discount',
    title: '🌟 RARE DRAGON SPECIAL! 50% OFF! 🌟',
    description: 'The legendary rare dragon grants you 50% off your entire order!',
    value: 50,
    code: 'RAREDRAGON50',
    weight: 0 // Special handling, not part of normal random selection
  },
  {
    id: 'try_again_first',
    type: 'discount',
    title: 'Oops! Try Again',
    description: 'The dragon got away! Try catching it again for another chance',
    value: 0,
    weight: 100, // changed from 70 to 40
    isFirstTime: true
  },
  {
    id: 'try_again_repeat',
    type: 'discount',
    title: 'Oops! Try Again',
    description: 'The dragon got away! Try catching it again for another chance',
    value: 0,
    weight: 40, // changed from 25 to 40
    isFirstTime: false
  }
];

// Special offer products that don't exist in inventory
export const SPECIAL_OFFER_PRODUCTS = {
  999001: {
    id: 999001,
    Product: 'Random Crochet Keychain (Fire Offer)',
    Price: 0,
    Quantity: 999,
    ImageUrl1: '/offer-keychain.png',
    Tag: 'Fire Offer',
    isSpecialOffer: true
  },
  999002: {
    id: 999002,
    Product: 'Random Crochet Magnet (Fire Offer)',
    Price: 0,
    Quantity: 999,
    ImageUrl1: '/offer-magnet.png',
    Tag: 'Fire Offer',
    isSpecialOffer: true
  },
  999003: {
    id: 999003,
    Product: 'Bookmark (Fire Offer)',
    Price: 0,
    Quantity: 999,
    ImageUrl1: '/offer-bookmark.png',
    Tag: 'Fire Offer',
    isSpecialOffer: true
  },
  999004: {
    id: 999004,
    Product: 'Small Sticker Pack (Fire Offer)',
    Price: 0,
    Quantity: 999,
    ImageUrl1: '/offer-stickers.png',
    Tag: 'Fire Offer',
    isSpecialOffer: true
  }
};

export function getRandomDragonOffer(): DragonOffer {
  // Check if this is the user's first dragon catch
  const isFirstTime = typeof window !== 'undefined' ? 
    !localStorage.getItem('dragonCaughtBefore') : true;
  
  // Filter offers based on first time status
  let availableOffers = DRAGON_OFFERS.filter(offer => {
    if (offer.id.includes('try_again')) {
      return offer.isFirstTime === isFirstTime;
    }
    return true;
  });
  
  // Calculate total weight
  const totalWeight = availableOffers.reduce((sum, offer) => sum + offer.weight, 0);
  
  // Generate random number
  let random = Math.random() * totalWeight;
  
  // Select offer based on weight
  for (const offer of availableOffers) {
    random -= offer.weight;
    if (random <= 0) {
      // Mark that user has caught dragon before
      if (typeof window !== 'undefined') {
        localStorage.setItem('dragonCaughtBefore', 'true');
      }
      return offer;
    }
  }
  
  // Fallback to first offer
  return availableOffers[0];
}

export function applyOfferToCart(offer: DragonOffer) {
  if (typeof window === 'undefined') return;
  
  try {
    // Store the active offer
    localStorage.setItem('activeDragonOffer', JSON.stringify(offer));
    
    // Dispatch event so cart can react
    window.dispatchEvent(new CustomEvent('dragonOfferApplied', { detail: offer }));
  } catch (error) {
    console.error('Failed to apply dragon offer:', error);
  }
}

export function getActiveDragonOffer(): DragonOffer | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('activeDragonOffer');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get active dragon offer:', error);
    return null;
  }
}

export function clearActiveDragonOffer() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('activeDragonOffer');
    window.dispatchEvent(new CustomEvent('dragonOfferCleared'));
  } catch (error) {
    console.error('Failed to clear dragon offer:', error);
  }
}

export function calculateDiscountAmount(offer: DragonOffer, subtotal: number): number {
  if (offer.type !== 'discount') return 0;
  
  // Check minimum order value
  if (offer.minOrderValue && subtotal < offer.minOrderValue) {
    return 0;
  }
  
  // Calculate discount
  if (offer.id === 'discount_100') {
    return Math.min(100, subtotal); // Cap at order total
  } else {
    return (subtotal * offer.value) / 100;
  }
}

export function calculateBuyXGetYDiscount(cartItems: any[]): number {
  // For buy 3 get 1 free, need at least 3 items to get 1 free
  if (cartItems.length >= 3) {
    // Get all items with their individual prices (including addons)
    const itemPrices = cartItems
      .map(item => {
        const basePrice = item.Price || 0;
        const addonPrice = item.addonUnitPrice || 0;
        return basePrice + addonPrice;
      })
      .sort((a, b) => a - b); // Sort from cheapest to most expensive
    
    // Calculate how many free items they get (1 free for every 3 paid)
    const freeItemsCount = Math.floor(cartItems.length / 3);
    
    // Give them the cheapest items for free
    let totalDiscount = 0;
    for (let i = 0; i < freeItemsCount; i++) {
      totalDiscount += itemPrices[i];
    }
    
    return totalDiscount;
  }
  return 0;
}

// New function to get items that should be marked as free for buy x get y
export function getBuyXGetYFreeItems(cartItems: any[]): string[] {
  if (cartItems.length < 3) return [];
  
  // Sort items by price (including addons) to identify cheapest
  const sortedItems = cartItems
    .map(item => ({
      cartKey: item.cartKey,
      price: (item.Price || 0) + (item.addonUnitPrice || 0)
    }))
    .sort((a, b) => a.price - b.price);
  
  const freeItemsCount = Math.floor(cartItems.length / 3);
  
  // Return cart keys of items that should be free
  return sortedItems.slice(0, freeItemsCount).map(item => item.cartKey);
}

// No changes needed here, logic is enforced in CartContext
