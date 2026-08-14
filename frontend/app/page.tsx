import Link from "next/link";
import { Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-6 text-center">
      <div className="mb-6 flex items-center gap-2 text-brand-500">
        <Heart size={48} className="fill-brand-500" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        Find your <span className="text-brand-500">spark</span>
      </h1>
      <p className="mt-4 max-w-md text-lg text-gray-600">
        Meet real people nearby, chat when you match, and let something great begin.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-500"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
