"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import Navbar from "@/components/Navbar";
import { getAdminUsers, banUser, unbanUser, deleteUser, AdminUserRow } from "@/lib/api";

function AdminUsersContent() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const data = await getAdminUsers(q);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  const toggleBan = async (u: AdminUserRow) => {
    setBusyId(u.id);
    try {
      if (u.isBanned) await unbanUser(u.id);
      else await banUser(u.id);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isBanned: !x.isBanned } : x)));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (u: AdminUserRow) => {
    if (!confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return;
    setBusyId(u.id);
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">Manage users</h1>

        <form onSubmit={handleSearch} className="mb-4 flex max-w-sm gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name…"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button type="submit" className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
            Search
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-gray-400">
              <Loader2 className="animate-spin" size={28} />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium">{u.displayName || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Banned</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleBan(u)}
                          disabled={busyId === u.id}
                          title={u.isBanned ? "Unban" : "Ban"}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                        >
                          {u.isBanned ? <ShieldCheck size={16} /> : <ShieldBan size={16} />}
                        </button>
                        <button
                          onClick={() => remove(u)}
                          disabled={busyId === u.id}
                          title="Delete"
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireAuth adminOnly>
      <AdminUsersContent />
    </RequireAuth>
  );
}
