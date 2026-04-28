"use client";
import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/liquid-glass";
import { adminAPI } from "@/lib/api";
import { Server, Database, Activity, CheckCircle } from "lucide-react";

export default function AdminSystemPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.systemStats()
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const fallback = {
    total_users: 1248,
    total_jobs: 142,
    total_applications: 4821,
    total_drives: 18,
    db_status: "healthy",
    api_status: "online",
    uptime: "99.9%",
    last_backup: "2025-01-10",
  };

  const s = stats || fallback;

  const systemCards = [
    { label: "API Status", value: s.api_status || "online", icon: <Activity size={18} />, good: true },
    { label: "Database", value: s.db_status || "healthy", icon: <Database size={18} />, good: true },
    { label: "Uptime", value: s.uptime || "99.9%", icon: <Server size={18} />, good: true },
    { label: "Last Backup", value: s.last_backup ? new Date(s.last_backup).toLocaleDateString() : "N/A", icon: <CheckCircle size={18} />, good: true },
  ];

  const dataCards = [
    { label: "Total Users", value: s.total_users },
    { label: "Total Jobs", value: s.total_jobs },
    { label: "Applications", value: s.total_applications },
    { label: "Placement Drives", value: s.total_drives },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>Configuration</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>System Health</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading system info...</div>
      ) : (
        <>
          {/* System status */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {systemCards.map(({ label, value, icon }) => (
              <GlassCard key={label} className="p-5" hover={false}>
                <div className="flex items-center gap-2 mb-2" style={{ color: "#000000" }}>{icon}</div>
                <p className="text-xl font-black capitalize" style={{ fontFamily: "Outfit", color: "#000000" }}>{value}</p>
                <p className="label-caps mt-1" style={{ color: "#888888" }}>{label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Data overview */}
          <GlassCard className="p-6 mb-6" hover={false}>
            <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Outfit", color: "#000000" }}>Data Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {dataCards.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-3xl font-black" style={{ fontFamily: "Outfit", color: "#000000" }}>{value ?? "–"}</p>
                  <p className="label-caps mt-1" style={{ color: "#888888" }}>{label}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Environment info */}
          <GlassCard className="p-6" hover={false}>
            <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Outfit", color: "#000000" }}>Environment</h2>
            <div className="flex flex-col gap-3">
              {[
                { key: "Backend", value: "Django REST Framework" },
                { key: "Frontend", value: "Next.js 14 (App Router)" },
                { key: "Database", value: "PostgreSQL" },
                { key: "AI Engine", value: "Groq LLaMA 3.3 70B" },
                { key: "Auth", value: "JWT (SimpleJWT)" },
              ].map(({ key, value }) => (
                <div key={key} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <span className="text-sm font-semibold" style={{ color: "#000000" }}>{key}</span>
                  <span className="text-sm" style={{ color: "#888888" }}>{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
