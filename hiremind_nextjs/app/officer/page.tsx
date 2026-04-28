"use client";

import React, { useState, useEffect } from "react";
import { officerAPI } from "@/lib/api";
import { CheckCircle, XCircle, Clock, BarChart2, Calendar, Users, TrendingUp } from "lucide-react";
import { GlassCard, StatCard } from "@/components/ui/liquid-glass";

export default function OfficerDashboard() {
  const [jobStatuses, setJobStatuses] = useState<Record<number, "approved" | "rejected" | null>>({});
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [drives, setDrives] = useState<any[]>([]);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    officerAPI.pendingJobs()
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setPendingJobs(raw);
      })
      .catch(err => { console.error("Failed to load pending jobs", err); setPendingJobs([]); })
      .finally(() => setLoadingJobs(false));

    officerAPI.drives()
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setDrives(raw);
      })
      .catch(err => { console.error("Failed to load drives", err); setDrives([]); })
      .finally(() => setLoadingDrives(false));

    officerAPI.reports().then(res => setReports(res.data)).catch(err => console.error("Failed to load reports", err));
  }, []);

  const handleJob = async (id: number, action: "approved" | "rejected") => {
    try {
      await officerAPI.approveJob(id, action === "approved" ? "approve" : "reject");
    } catch (err) { console.error(err); }
    setJobStatuses((prev) => ({ ...prev, [id]: action }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>Placement Officer</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={reports ? String(reports.total_students ?? 0) : "—"} icon={<Users size={18} style={{ color: "#000000" }} />} />
        <StatCard label="Students Placed" value={reports ? String(reports.placed_students ?? 0) : "—"} icon={<CheckCircle size={18} style={{ color: "#000000" }} />} />
        <StatCard label="Active Jobs" value={reports ? String(reports.total_jobs ?? 0) : "—"} icon={<Calendar size={18} style={{ color: "#000000" }} />} />
        <StatCard label="Total Apps" value={reports ? String(reports.total_applications ?? 0) : "—"} icon={<TrendingUp size={18} style={{ color: "#000000" }} />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-5">
            <Clock size={16} style={{ color: "#000000" }} />
            <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>
              Pending Approvals
              <span className="ml-2 text-sm font-normal" style={{ color: "#888888" }}>({pendingJobs.length})</span>
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {loadingJobs ? (
              <p className="text-xs text-center py-5" style={{ color: "#888888" }}>Loading pending jobs...</p>
            ) : pendingJobs.length === 0 ? (
              <p className="text-xs text-center py-5" style={{ color: "#888888" }}>No pending jobs to approve.</p>
            ) : pendingJobs.map((job) => {
              const status = jobStatuses[job.id];
              const company = job.company_name || job.company || "Company";
              const salary = job.salary_min && job.salary_max ? `${job.salary_min}–${job.salary_max} LPA` : (job.salary || "N/A");
              const cgpa = job.min_cgpa || job.cgpa || "0";
              const posted = job.created_at ? new Date(job.created_at).toLocaleDateString() : job.posted || "Recent";
              return (
                <div key={job.id} className="p-4" style={{ background: "#f5f3ef", border: "1px solid #e0e0e0" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#000000" }}>{job.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#888888" }}>{company} · {salary}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#888888" }}>CGPA {cgpa}+ · {job.department || job.dept || "All"}</p>
                    </div>
                    <p className="text-xs" style={{ color: "#888888" }}>{posted}</p>
                  </div>
                  {!status ? (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleJob(job.id, "approved")} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 font-semibold transition-all duration-200" style={{ background: "#000000", color: "#ffffff" }}>
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button onClick={() => handleJob(job.id, "rejected")} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 font-semibold transition-all duration-200" style={{ background: "transparent", border: "1px solid #000000", color: "#000000" }}>
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 text-center text-xs font-semibold py-2" style={{ border: "1px solid #000000", color: "#000000" }}>
                      {status === "approved" ? "Approved" : "Rejected"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Upcoming Drives */}
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={16} style={{ color: "#000000" }} />
            <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>Upcoming Drives</h2>
          </div>
          <div className="flex flex-col gap-4">
            {loadingDrives ? (
              <p className="text-xs text-center py-5" style={{ color: "#888888" }}>Loading drives...</p>
            ) : drives.length === 0 ? (
              <p className="text-xs text-center py-5" style={{ color: "#888888" }}>No upcoming drives.</p>
            ) : drives.map((drive) => {
              const date = drive.date ? new Date(drive.date).toLocaleDateString() : drive.start_date ? new Date(drive.start_date).toLocaleDateString() : "TBD";
              return (
                <div key={drive.id} className="p-5" style={{ background: "#f5f3ef", border: "1px solid #e0e0e0" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#000000" }}>{drive.name || drive.title}</p>
                      <p className="text-xs mt-1" style={{ color: "#888888" }}>{date} · {drive.venue || "Campus"}</p>
                    </div>
                    <span className="text-xs font-bold" style={{ color: "#000000", fontFamily: "Outfit" }}>{drive.registrations || 0} registered</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(drive.companies) ? drive.companies : []).map((c: string) => (
                      <span key={c} className="text-xs px-2 py-1" style={{ border: "1px solid #000000", color: "#000000" }}>{c}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Placement Snapshot */}
        <GlassCard className="p-6 lg:col-span-2" hover={false}>
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={16} style={{ color: "#000000" }} />
            <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>Department Placement Snapshot</h2>
          </div>
          {(!reports?.department_stats || reports.department_stats.length === 0) ? (
            <p className="text-sm text-center py-4" style={{ color: "#888888" }}>No department data available yet.</p>
          ) : (
            <div className="grid sm:grid-cols-4 gap-4">
              {reports.department_stats.map((stat: any) => {
                const dept = stat.department || stat.dept;
                const placed = stat.placed || 0;
                const total = stat.total || 1;
                const pct = Math.round((placed / total) * 100) || 0;
                return (
                  <div key={dept} className="text-center">
                    <p className="text-3xl font-black mb-1" style={{ color: "#000000", fontFamily: "Outfit" }}>{pct}%</p>
                    <p className="label-caps mb-2" style={{ color: "#888888" }}>{dept}</p>
                    <div className="h-1.5 overflow-hidden" style={{ background: "#e0e0e0" }}>
                      <div className="h-full" style={{ width: `${pct}%`, background: "#000000" }} />
                    </div>
                    <p className="text-xs mt-2" style={{ color: "#888888" }}>{placed}/{total} placed</p>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
