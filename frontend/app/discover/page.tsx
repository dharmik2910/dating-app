"use client";

import { useEffect, useState } from "react";
import { Heart, X, Loader2, Sparkles } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import { discoverProfiles, likeUser, passUser, ProfileResponse } from "@/lib/api";

function DiscoverContent() {
  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchToast, setMatchToast] = useState<string | null>(null);

  useEffect(() => {
    discoverProfiles()
      .then(setProfiles)
      .finally(() => setLoading(false));
  }, []);

  const current = profiles[index];

  const handleLike = async () => {
    if (!current) return;
    const res = await likeUser(current.userId);
    if (res.matched) {
      setMatchToast(`You matched with ${current.displayName}!`);
      setTimeout(() => setMatchToast(null), 2500);
    }
    setIndex((i) => i + 1);
  };

  const handlePass = async () => {
    if (!current) return;
    await passUser(current.userId);
    setIndex((i) => i + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
        {matchToast && (
          <div className="mb-4 flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            <Sparkles size={16} /> {matchToast}
          </div>
        )}

        {loading ? (
          <div className="flex h-96 items-center justify-center text-gray-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : current ? (
          <>
            <ProfileCard profile={current} />
            <div className="mt-6 flex items-center gap-6">
              <button
                onClick={handlePass}
                aria-label="Pass"
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 shadow-md transition hover:border-gray-300 hover:text-gray-600"
              >
                <X size={26} />
              </button>
              <button
                onClick={handleLike}
                aria-label="Like"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
              >
                <Heart size={28} className="fill-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-96 flex-col items-center justify-center text-center text-gray-400">
            <Heart size={40} className="mb-3" />
            <p className="font-medium">You're all caught up!</p>
            <p className="text-sm">Check back later for new people nearby.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <RequireAuth>
      <DiscoverContent />
    </RequireAuth>
  );
}
