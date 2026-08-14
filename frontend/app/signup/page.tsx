"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    age: "",
    gender: "Male",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        displayName: form.displayName,
        age: parseInt(form.age, 10),
        gender: form.gender,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center">
          <Heart className="fill-brand-500 stroke-brand-500" size={36} />
          <h1 className="mt-2 text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-gray-500">Start meeting new people today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Display name</label>
            <input required value={form.displayName} onChange={update("displayName")} className={inputClass} placeholder="Alex" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
              <input required type="number" min={18} max={120} value={form.age} onChange={update("age")} className={inputClass} placeholder="25" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
              <select value={form.gender} onChange={update("gender") as any} className={inputClass}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input required type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="you@example.com" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input required type="password" value={form.password} onChange={update("password")} className={inputClass} placeholder="At least 8 characters" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
