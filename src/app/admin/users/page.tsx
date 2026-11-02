"use client";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Trash2 } from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id: string, role: "user" | "admin") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      if (!res.ok) throw new Error();
      toast.success("Role updated");
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Users</h1>
        <p className="text-gray-400 mt-1 text-xs sm:text-sm">Manage registered customer and administrator accounts</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-white/10 text-white placeholder:text-gray-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm transition-all"
        />
      </div>

      <div className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-left">
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Name</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Email</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Role</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-white">{u.name}</td>
                    <td className="px-4 py-3.5 text-gray-300 font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value as "user" | "admin")}
                        className="text-xs px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-white focus:border-brand-400 outline-none"
                      >
                        <option value="user" className="bg-gray-900 text-white">User</option>
                        <option value="admin" className="bg-gray-900 text-white">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs sm:text-sm text-gray-400 font-mono">
            Page {page} of {Math.ceil(total / limit)} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-white/10 hover:bg-white/10 text-white disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-white/10 hover:bg-white/10 text-white disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
