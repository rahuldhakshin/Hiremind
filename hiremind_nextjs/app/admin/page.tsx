"use client";

import React, { useEffect, useState } from "react";
import { Users, Briefcase, GraduationCap, Shield, CheckCircle, AlertTriangle, Activity, Database } from "lucide-react";
import { GlassCard, StatCard } from "@/components/ui/liquid-glass";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [stats, setStats] = useState({ total: "—", jobs: "—", students: "—", recruiters: "—" });

  useEffect(() => {
    api.get("/admin/all-users/")
      .then(res => {
        const users = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setRecentUsers(users.slice(0, 4).map((u: any) => ({
          name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
          email: u.email,
          role: u.role,
          joined: u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—",
        })));
        setStats({
          total: String(users.length),
          jobs: "—",
          students: String(users.filter((u: any) => u.role === "student").length),
          recruiters: String(users.filter((u: any) => u.role === "recruiter").length),
        });
      })
      .catch(err => console.error("Failed to load users", err))
      .finally(() => setLoading(false));

    api.get("/admin/system-stats/")
      .then(res => {
        setSystemStats(res.data);
        setStats(prev => ({ ...prev, jobs: String(res.data.total_jobs ?? "—") }));
      })
      .catch(err => console.error("Failed to load system stats", err));
  }, []);

  const healthItems = systemStats ? [
    {
      label: "Django Backend",
      status: systemStats.api_status || "operational",
      ok: (systemStats.api_status || "operational") === "operational",
    },
    {
      label: "Database",
      status: systemStats.db_status || "unknown",
      ok: (systemStats.db_status || "").toLowerCase().includes("ok") || (systemStats.db_status || "") === "operational",
    },
    {
      label: "Groq AI API",
      status: "check api key",
      ok: false,
    },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>System Control</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>Admin Overview</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.total} icon={<Users size={18} style={{ color: "#000000" }} />} />
        <StatCard label="Active Jobs" value={stats.jobs} icon={<Briefcase size={18} style={{ color: "#000000" }} />} />
        <StatCard label="Students" value={stats.students} icon={<GraduationCap size={18} style={{ color: "#000000" }} />} />
        <StatCard label="Recruiters" value={stats.recruiters} icon={<Shield size={18} style={{ color: "#000000" }} />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6" hover={false}>
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Outfit", color: "#000000" }}>Recent Registrations</h2>
          {loading ? (
            <p className="text-sm text-center py-6" style={{ color: "#888888" }}>Loading users...</p>
          ) : recentUsers.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "#888888" }}>No users registered yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentUsers.map((u) => (
                <div key={u.email} className="flex items-center gap-4 p-3" style={{ background: "#f5f3ef", border: "1px solid #e0e0e0" }}>
                  <div className="w-9 h-9 flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#000000", color: "#ffffff" }}>
                    {(u.name || u.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#000000" }}>{u.name}</p>
                    <p className="text-xs truncate" style={{ color: "#888888" }}>{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2 py-1" style={{ border: "1px solid #000000", color: "#000000" }}>
                      {(u.role || "").replace(/_/g, " ")}
                    </span>
                    <span className="text-xs" style={{ color: "#888888" }}>{u.joined}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6" hover={false}>
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Outfit", color: "#000000" }}>System Health</h2>
          {!systemStats ? (
            <p className="text-sm text-center py-6" style={{ color: "#888888" }}>Loading system status...</p>
          ) : (
            <div className="flex flex-col gap-3 mb-6">
              {healthItems.map(({ label, status, ok }) => (
                <div key={label} className="flex items-center justify-between p-3" style={{ background: "#f5f3ef", border: "1px solid #e0e0e0" }}>
                  <div className="flex items-center gap-3">
                    {ok
                      ? <CheckCircle size={14} style={{ color: "#000000" }} />
                      : <AlertTriangle size={14} style={{ color: "#888888" }} />}
                    <p className="text-sm font-medium" style={{ color: "#000000" }}>{label}</p>
                  </div>
                  <span className="text-xs px-2 py-1" style={{ border: "1px solid #000000", color: "#000000" }}>{status}</span>
                </div>
              ))}
              {systemStats.uptime && (
                <div className="p-3" style={{ background: "#f5f3ef", border: "1px solid #e0e0e0" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#000000" }}>Uptime</p>
                  <p className="text-xs" style={{ color: "#888888" }}>{systemStats.uptime}</p>
                </div>
              )}
            </div>
          )}
          {systemStats && (
            <div className="p-4" style={{ background: "#f5f3ef", border: "1px solid #e0e0e0" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: "#000000" }}>Total Applications</p>
                <p className="text-xs font-bold" style={{ color: "#000000" }}>{systemStats.total_applications ?? 0}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: "#000000" }}>Total Students</p>
                <p className="text-xs font-bold" style={{ color: "#000000" }}>{systemStats.total_students ?? 0}</p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
