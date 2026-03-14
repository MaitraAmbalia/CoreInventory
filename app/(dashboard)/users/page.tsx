"use client";

import { useState, useEffect } from "react";
import { Users, Shield, User, Trash2, ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";

type UserType = {
  id: string;
  name: string;
  email: string;
  role: "Manager" | "Staff";
  createdAt: string;
};

import { TableSkeleton } from "@/components/skeletons";

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: "Manager" | "Staff") => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <TableSkeleton />;
  if (error) return <div className="p-8 text-red-400 font-mono text-xl">{error}</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-500" />
            User Management
          </h1>
          <p className="text-slate-400 mt-1">Manage staff roles and system access.</p>
        </div>
      </div>

      {}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
          />
        </div>
      </div>

      {}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No users found matching that criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-white">{user.name}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-sm">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                          user.role === "Manager"
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {user.role === "Manager" ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.role === "Staff" ? (
                          <button
                            onClick={() => handleRoleChange(user.id, "Manager")}
                            title="Promote to Manager"
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-md transition-colors"
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(user.id, "Staff")}
                            title="Demote to Staff"
                            className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-orange-400/10 rounded-md transition-colors"
                          >
                            <ArrowDownCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
