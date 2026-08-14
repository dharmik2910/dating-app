"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Users, Heart, MessageSquare, UserPlus, ShieldBan } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import Navbar from "@/components/Navbar";
import { getAdminStats, AdminStats } from "@/lib/api";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin dashboard</h1>
          <Link
            href="/admin/users"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Manage users
          </Link>
        </div>

        {loading || !stats ? (
          <div className="flex h-64 items-center justify-center text-gray-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={<Users size={22} />} label="Total users" value={stats.totalUsers} />
            <StatCard icon={<Heart size={22} />} label="Total matches" value={stats.totalMatches} />
            <StatCard icon={<MessageSquare size={22} />} label="Total messages" value={stats.totalMessages} />
            <StatCard icon={<UserPlus size={22} />} label="New users (7 days)" value={stats.newUsersLast7Days} />
            <StatCard icon={<ShieldBan size={22} />} label="Banned users" value={stats.bannedUsers} />
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireAuth adminOnly>
      <AdminDashboardContent />
    </RequireAuth>
  );
}
