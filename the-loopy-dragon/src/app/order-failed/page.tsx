"use client";
import Link from "next/link";

export default function OrderFailed() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-red-700 dark:text-red-400 text-center">Order Failed</h2>
        <div className="mb-4 text-gray-700 dark:text-gray-200 text-center">
          If order has failed but your payment has gone through, please contact at <b>xyz@gmail.com</b>.<br />
          We will resolve it in 1-2 business days.
        </div>
        <div className="flex justify-center">
          <Link href="/cart" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
