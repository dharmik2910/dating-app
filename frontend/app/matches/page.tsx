"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import Navbar from "@/components/Navbar";
import { getMyMatches, MatchResponse } from "@/lib/api";

function MatchesContent() {
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyMatches()
      .then(setMatches)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">Your matches</h1>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-gray-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
            <MessageCircle size={36} className="mb-3" />
            <p className="font-medium">No matches yet</p>
            <p className="text-sm">Keep swiping — your next match is out there.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {matches.map((m) => (
              <li key={m.matchId}>
                <Link
                  href={`/messages/${m.matchId}`}
                  className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <img
                    src={m.otherPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.otherUserId}`}
                    alt={m.otherDisplayName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{m.otherDisplayName}</p>
                    <p className="text-sm text-gray-400">
                      Matched {new Date(m.matchedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <MessageCircle className="text-gray-300" size={20} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <RequireAuth>
      <MatchesContent />
    </RequireAuth>
  );
}
