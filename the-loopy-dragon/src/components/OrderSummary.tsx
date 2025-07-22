"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";

interface OrderSummaryProps {
  cart: { [cartKey: string]: number };
  products: any[];
  cartAddons: any;
  subtotal: number;
  shippingCost: number;
  total: number;
}

export default function OrderSummary({ cart, products, cartAddons, subtotal, shippingCost, total }: OrderSummaryProps) {
  const { getProductIdFromCartKey } = useCart();

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
      
      <div className="space-y-4 mb-6">
        {Object.entries(cart).map(([cartKey, qty]) => {
          const productId = getProductIdFromCartKey(cartKey);
          const product = products.find(p => p.id === productId);
          const addons = cartAddons[cartKey] || {};
          
          if (!product) return null;
          
          const addonUnitPrice = 
            (addons.keyChain ? 10 : 0) +
            (addons.giftWrap ? 10 : 0) +
            (addons.carMirror ? 50 : 0);
          
          const basePrice = product.Price; // Use actual base product price
          const itemTotal = (basePrice + addonUnitPrice) * qty;
          
          return (
            <div key={cartKey} className="flex justify-between text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {product.Product} × {qty}
                </span>
                {(addons.keyChain || addons.giftWrap || addons.carMirror || addons.customMessage) && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <div>
                      Product Price: ₹{basePrice.toFixed(2)}
                      {addonUnitPrice > 0 && <span className="ml-1 text-purple-600">(+ Addons: ₹{addonUnitPrice})</span>}
                    </div>
                    {addons.keyChain && <span className="mr-1">+ Keychain</span>}
                    {addons.giftWrap && <span className="mr-1">+ Gift Wrap</span>}
                    {addons.carMirror && <span>+ Car Mirror</span>}
                    {addons.customMessage && (
                      <div className="italic truncate max-w-[200px]">
                        Message: "{addons.customMessage}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-gray-900 dark:text-gray-100">₹{itemTotal.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className={`${shippingCost === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'} font-medium`}>
            {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between">
          <span className="font-medium text-gray-900 dark:text-white">Total</span>
          <span className="font-bold text-gray-900 dark:text-white">₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}