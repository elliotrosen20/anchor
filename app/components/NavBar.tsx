'use client';

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/public/logo.svg";

export default function NavBar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (isHomePage && !user) {
    return (
      <nav className="absolute top-0 right-0 p-4 z-10">
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-blue-600 hover:text-blue-800">
            About
          </Link>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Login
          </Link>
          <Link 
            href="/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <header className="bg-white border-b p-4">
      <div className="flex justify-between items-center w-full">
        <Link href="/" className="focus:outline-none">
          <Image src={logo} alt="OCD Companion" width={80} height={80} />
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/chat" className="text-blue-600 hover:text-blue-800">
              Dashboard
            </Link>
            <button 
              onClick={signOut}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-blue-600 hover:text-blue-800">
              About
            </Link>
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
            <Link 
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}