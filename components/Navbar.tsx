"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createBrowserClient } from '@/app/utils/supabase/client';
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          AlxPolly
        </Link>
        <div className="space-x-4">
          <Link href="/signup" className="text-white hover:text-gray-300">
            Signup
          </Link>
          <Link href="/login" className="text-white hover:text-gray-300">
            Login
          </Link>
          <Link href="/polls" className="text-white hover:text-gray-300">
            List of Polls
          </Link>
          <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}