"use client";
import Link from "next/link";

export default function OrderFailed() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-10 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center">
            Order Failed
          </h2>
        </div>
        <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-8 text-center leading-relaxed">
          We're sorry, but your order could not be processed. If your payment has gone through, please contact us at <a href="mailto:theloopydragon123@gmail.com" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">xyz@gmail.com</a>.<br />
          We will resolve the issue within 1-2 business days.
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/cart"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base sm:text-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Try Again
          </Link>
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-base sm:text-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}