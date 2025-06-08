"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      
      if (!currentUser || currentUser.email !== "sanskarisamazing@gmail.com") {
        router.push("/");
        return;
      }
      
      setUser(currentUser);
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/owner" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                Dashboard
              </Link>
              <Link href="/owner/orders" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                Orders
              </Link>
              <Link href="/owner/custom-order" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                Custom Orders
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="p-4">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
