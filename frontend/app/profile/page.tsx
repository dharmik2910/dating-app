"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2, Save, Check } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import Navbar from "@/components/Navbar";
import { getMyProfile, updateMyProfile, ProfileResponse } from "@/lib/api";

function ProfileContent() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [interestsInput, setInterestsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setInterestsInput(p.interests.join(", "));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateMyProfile({
        ...profile,
        interests: interestsInput
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">Edit profile</h1>

        {loading || !profile ? (
          <div className="flex h-64 items-center justify-center text-gray-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex justify-center">
              <img
                src={profile.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.userId}`}
                alt={profile.displayName}
                className="h-28 w-28 rounded-full object-cover shadow"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Photo URL</label>
              <input
                value={profile.photoUrl || ""}
                onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })}
                className={inputClass}
                placeholder="https://…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Display name</label>
                <input
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) || 0 })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
              <input
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Interests <span className="text-gray-400">(comma separated)</span>
              </label>
              <input
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                className={inputClass}
                placeholder="Hiking, Coffee, Travel"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? "Saved" : "Save changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
