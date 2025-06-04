import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="w-full bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-green-700 dark:text-green-400">
            The Loopy Dragon
          </span>
          <ul className="flex gap-6 text-gray-700 dark:text-gray-200 text-sm font-medium">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/collections">Collections</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto py-16 px-4 flex-1">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          About Us
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The Loopy Dragon is a small, passionate team of dragon lovers dedicated
          to bringing a touch of whimsy and magic to your everyday life. Our
          products are designed with care and creativity, perfect for gifts or
          treating yourself!
        </p>
      </main>
      <footer className="bg-white dark:bg-gray-800 py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} The Loopy Dragon
      </footer>
    </div>
  );
}
