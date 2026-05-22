"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar({ userName }: { userName?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            🍔 Naz Halal
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/order" className="text-sm hover:underline font-medium">
              Order Food
            </Link>
            <Link href="/dashboard" className="text-sm hover:underline font-medium">
              Rewards
            </Link>
          </div>
        </div>
        {userName ? (
          <div className="flex items-center gap-4">
            <Link href="/order" className="sm:hidden text-sm hover:underline font-medium">
              Order
            </Link>
            <span className="text-sm opacity-90">Hi, {userName}</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-700 hover:bg-red-800 px-3 py-1 rounded transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link href="/order" className="sm:hidden text-sm hover:underline">
              Order
            </Link>
            <Link href="/login" className="text-sm hover:underline">
              Log in
            </Link>
            <Link href="/register" className="text-sm bg-white text-red-600 px-3 py-1 rounded font-medium hover:bg-gray-100 transition-colors">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
