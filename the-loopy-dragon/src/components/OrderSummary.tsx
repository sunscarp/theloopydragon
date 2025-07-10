import React from "react";

type Addons = {
  keyChain?: boolean;
  giftWrap?: boolean;
  carMirror?: boolean;
  customMessage?: string;
};

type Product = {
  id: number;
  Product: string;
  Price: number;
};

type OrderSummaryProps = {
  cart: { [id: string]: number };
  products: Product[];
  cartAddons: { [id: string]: Addons };
  subtotal: number;
  shippingCost: number;
  total: number;
};

export default function OrderSummary({
  cart,
  products,
  cartAddons,
  subtotal,
  shippingCost,
  total,
}: OrderSummaryProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
      {Object.entries(cart).map(([id, qty]) => {
        const product = products.find((p) => p.id === Number(id));
        if (!product) return null;
        const addons = cartAddons[id] || {};
        const addonUnitPrice =
          (addons.keyChain ? 10 : 0) +
          (addons.giftWrap ? 10 : 0) +
          (addons.carMirror ? 50 : 0);
        const totalPrice = (product.Price + addonUnitPrice) * qty;
        return (
          <div key={id} className="mb-2">
            <div className="font-medium text-gray-900 dark:text-white">
              {product.Product} <span className="text-xs text-gray-500">x{qty}</span>
            </div>
            {(addons.keyChain || addons.giftWrap || addons.carMirror || addons.customMessage) && (
              <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {addons.keyChain && <span className="mr-2">+ Keychain <span className="text-[10px]">(+₹10)</span></span>}
                {addons.giftWrap && <span className="mr-2">+ Gift Wrap <span className="text-[10px]">(+₹10)</span></span>}
                {addons.carMirror && <span className="mr-2">+ Car mirror accessory <span className="text-[10px]">(+₹50)</span></span>}
                {addons.customMessage && (
                  <div>
                    <span className="italic">Message:</span> {addons.customMessage}
                  </div>
                )}
              </div>
            )}
            <div className="text-xs text-gray-400">
              ₹{product.Price.toFixed(2)} each
              {addonUnitPrice > 0 && (
                <span className="ml-2 text-purple-500">+ Addons ₹{addonUnitPrice} each</span>
              )}
              <span className="ml-2 text-gray-500">Item total: ₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-300">Subtotal</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-300">Shipping</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {subtotal > 1000 ? (
            <span className="text-green-600">Free Shipping</span>
          ) : shippingCost > 0 ? (
            `₹${shippingCost.toFixed(2)}`
          ) : (
            'Enter pincode'
          )}
        </span>
      </div>
      <hr className="border-gray-200 dark:border-gray-600" />
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
}
