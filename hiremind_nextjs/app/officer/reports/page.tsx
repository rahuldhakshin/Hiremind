"use client";
import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/liquid-glass";
import { officerAPI } from "@/lib/api";
import { BarChart2, TrendingUp, Users, Briefcase } from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    officerAPI.reports().then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const downloadReport = async (type: "pdf" | "xlsx") => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) { alert("Please log in again to download reports."); return; }
      // Use fetch with Authorization header, then trigger browser download
      const res = await fetch(`http://127.0.0.1:8000/api/reports/placement.${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placement-report.${type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert("Download failed. Make sure ReportLab is installed on the backend (pip install reportlab openpyxl).");
    }
  };

  const stats = data || { total_students: 0, placed_students: 0, total_jobs: 0, total_applications: 0 };
  const placementRate = Math.round((stats.placed_students / (stats.total_students || 1)) * 100);
  const deptStats = data?.department_stats || [];

  if (loading) return <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading reports...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>Analytics</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>Placement Reports</h1>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Students", value: stats.total_students, icon: <Users size={18} /> },
          { label: "Students Placed", value: stats.placed_students, icon: <TrendingUp size={18} /> },
          { label: "Placement Rate", value: `${placementRate}%`, icon: <BarChart2 size={18} /> },
          { label: "Active Jobs", value: stats.total_jobs, icon: <Briefcase size={18} /> },
        ].map(({ label, value, icon }) => (
          <GlassCard key={label} className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-2" style={{ color: "#000000" }}>{icon}</div>
            <p className="text-3xl font-black" style={{ fontFamily: "Outfit", color: "#000000" }}>{value}</p>
            <p className="label-caps mt-1" style={{ color: "#888888" }}>{label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Department breakdown */}
      <GlassCard className="p-6 mb-6" hover={false}>
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 size={16} style={{ color: "#000000" }} />
          <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>Department Breakdown</h2>
        </div>
        <div className="flex flex-col gap-5">
          {deptStats.map((dept: any) => {
            const pct = Math.round(((dept.placed || 0) / (dept.total || 1)) * 100);
            return (
              <div key={dept.department}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: "#000000" }}>{dept.department}</span>
                  <span className="text-sm font-black" style={{ color: "#000000", fontFamily: "Outfit" }}>
                    {pct}% · {dept.placed}/{dept.total}
                  </span>
                </div>
                <div className="h-2" style={{ background: "#e0e0e0" }}>
                  <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: "#000000" }} />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Download links */}
      <GlassCard className="p-6" hover={false}>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Outfit", color: "#000000" }}>Export Reports</h2>
        <div className="flex gap-4">
          <button
            onClick={() => downloadReport("pdf")}
            className="text-sm px-5 py-2.5 font-semibold" style={{ background: "#000000", color: "#ffffff" }}>
            Download PDF
          </button>
          <button
            onClick={() => downloadReport("xlsx")}
            className="text-sm px-5 py-2.5 font-semibold" style={{ border: "1px solid #000000", color: "#000000" }}>
            Download Excel
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
