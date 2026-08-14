"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Heart, MessageCircle, User, LogOut, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  const linkClass =
    "flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors";

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/discover" className="flex items-center gap-1.5 text-xl font-bold text-brand-500">
          <Heart className="fill-brand-500 stroke-brand-500" size={22} />
          Sparkle
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/discover" className={linkClass}>
            <Heart size={18} /> Discover
          </Link>
          <Link href="/matches" className={linkClass}>
            <MessageCircle size={18} /> Matches
          </Link>
          <Link href="/profile" className={linkClass}>
            <User size={18} /> Profile
          </Link>
          {isAdmin && (
            <Link href="/admin" className={linkClass}>
              <ShieldCheck size={18} /> Admin
            </Link>
          )}
          <button onClick={logout} className={linkClass}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
