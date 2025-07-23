"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";
import { SPECIAL_OFFER_PRODUCTS, type DragonOffer } from "@/utils/dragonOffers";

interface OrderSummaryProps {
  cart: { [cartKey: string]: number };
  products: any[];
  cartAddons: any;
  subtotal: number;
  shippingCost: number;
  total: number;
  activeDragonOffer?: DragonOffer | null;
  dragonDiscount?: number;
  buyXGetYDiscount?: number;
}

export default function OrderSummary({ 
  cart, 
  products, 
  cartAddons, 
  subtotal, 
  shippingCost, 
  total,
  activeDragonOffer,
  dragonDiscount = 0,
  buyXGetYDiscount = 0
}: OrderSummaryProps) {
  const { getProductIdFromCartKey } = useCart();

  // Calculate the subtotal after dragon discounts
  const totalDragonDiscount = dragonDiscount + buyXGetYDiscount;
  const subtotalAfterDiscount = subtotal - totalDragonDiscount;
  const finalTotal = subtotalAfterDiscount + shippingCost;

  const cartItems = Object.entries(cart).map(([cartKey, qty]) => {
    const productId = getProductIdFromCartKey(cartKey);
    
    // Check if it's a special offer product
    const specialOffer = SPECIAL_OFFER_PRODUCTS[productId as keyof typeof SPECIAL_OFFER_PRODUCTS];
    let product;
    
    if (specialOffer) {
      product = specialOffer;
    } else {
      product = products.find((p) => p.id === productId);
    }
    
    if (!product) return null;
    
    const addons = cartAddons[cartKey] || {};
    const addonUnitPrice =
      (addons.keyChain ? 10 : 0) +
      (addons.giftWrap ? 10 : 0) +
      (addons.carMirror ? 50 : 0);
    
    return {
      ...product,
      cartKey,
      quantity: qty,
      addons,
      addonUnitPrice,
      totalPrice: (product.Price + addonUnitPrice) * qty,
    };
  }).filter(Boolean);

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h3>
      
      {/* Cart Items */}
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.cartKey} className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.Product}
                </span>
                {item.isSpecialOffer && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    FREE
                  </span>
                )}
              </div>
              {item.addons && (Object.values(item.addons).some(Boolean) || item.addons.customMessage) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item.addons.keyChain && <span className="mr-2">+ Keychain</span>}
                  {item.addons.giftWrap && <span className="mr-2">+ Gift Wrap</span>}
                  {item.addons.carMirror && <span className="mr-2">+ Car Mirror</span>}
                  {item.addons.customMessage && <span>+ Custom Message</span>}
                </div>
              )}
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Qty: {item.quantity} × ₹{(item.Price + item.addonUnitPrice).toFixed(2)}
              </div>
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              ₹{item.totalPrice.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <hr className="border-gray-300 dark:border-gray-600" />
      
      {/* Summary */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
        </div>
        
        {/* Dragon Offer Discounts */}
        {activeDragonOffer && dragonDiscount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>🐉 {activeDragonOffer.title}</span>
            <span>-₹{dragonDiscount.toFixed(2)}</span>
          </div>
        )}
        
        {activeDragonOffer && buyXGetYDiscount > 0 && (
          <div className="flex flex-col text-green-600 dark:text-green-400">
            <div className="flex justify-between">
              <span>🐉 Buy 3 Get 1 Free</span>
              <span>-₹{buyXGetYDiscount.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cheapest items made free
            </div>
          </div>
        )}

        {/* Free Product Items Notice */}
        {cartItems.some((item) => item.isSpecialOffer) && (
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
            <div className="text-xs text-green-700 dark:text-green-300">
              🎁 {cartItems.filter((item) => item.isSpecialOffer).length} free dragon offer item(s) included
            </div>
          </div>
        )}
        
        {/* Show subtotal after discount if there was a discount */}
        {totalDragonDiscount > 0 && (
          <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2">
            <span className="text-gray-600 dark:text-gray-300">Subtotal after discount</span>
            <span className="font-medium text-gray-900 dark:text-white">₹{subtotalAfterDiscount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Shipping</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
          </span>
        </div>
        
        <hr className="border-gray-300 dark:border-gray-600" />
        
        <div className="flex justify-between text-lg font-bold">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-gray-900 dark:text-white">₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}