"use client";
import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/liquid-glass";
import { adminAPI } from "@/lib/api";
import { Users, Trash2, Search } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    adminAPI.allUsers().then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setUsers(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  const filtered = users.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor: Record<string, string> = {
    student: "#000000",
    recruiter: "#000000",
    officer: "#000000",
    admin: "#000000",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>User Management</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>All Users</h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(["student", "recruiter", "officer", "admin"] as const).map(role => {
          const count = users.filter(u => u.role === role).length;
          return (
            <GlassCard key={role} className="p-5" hover={false}>
              <p className="text-3xl font-black" style={{ fontFamily: "Outfit", color: "#000000" }}>{count}</p>
              <p className="label-caps mt-1 capitalize" style={{ color: "#888888" }}>{role}s</p>
            </GlassCard>
          );
        })}
      </div>

      {/* Search */}
      <GlassCard className="p-4 mb-6" hover={false}>
        <div className="flex items-center gap-3">
          <Search size={16} style={{ color: "#888888" }} />
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#000000" }}
            placeholder="Search by name, email or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </GlassCard>

      {loading ? (
        <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading users...</div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <Users size={32} className="mx-auto mb-4" style={{ color: "#000000" }} />
          <p className="text-lg font-semibold" style={{ color: "#000000" }}>No users found</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((user: any) => (
            <GlassCard key={user.id} className="p-5" hover={false}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "#000000", color: "#ffffff" }}>
                    {(user.first_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#000000" }}>
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs" style={{ color: "#888888" }}>
                      {user.email} · Joined {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs px-2 py-1 font-semibold capitalize"
                    style={{ border: "1px solid #000000", color: "#000000" }}>
                    {user.role || "student"}
                  </span>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                    className="p-1.5 transition-opacity hover:opacity-60"
                    style={{ color: "#000000" }}
                    title="Delete user"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
