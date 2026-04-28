"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Star, ChevronRight, Filter } from "lucide-react";
import { GlassCard } from "@/components/ui/liquid-glass";
import { applicationsAPI } from "@/lib/api";

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  applied:     { color: "#000000", bg: "rgba(0,0,0,0.06)",  border: "rgba(0,0,0,0.15)", icon: <Clock size={13} /> },
  shortlisted: { color: "#000000", bg: "rgba(0,0,0,0.06)",  border: "rgba(0,0,0,0.15)", icon: <Star size={13} /> },
  interview:   { color: "#000000", bg: "rgba(0,0,0,0.08)",  border: "rgba(0,0,0,0.2)",  icon: <ChevronRight size={13} /> },
  selected:    { color: "#000000", bg: "rgba(0,0,0,0.08)",  border: "rgba(0,0,0,0.2)",  icon: <CheckCircle size={13} /> },
  rejected:    { color: "#888888", bg: "rgba(0,0,0,0.04)",  border: "rgba(0,0,0,0.1)",  icon: <XCircle size={13} /> },
};

const PIPELINE_STAGES = ["applied", "shortlisted", "interview", "selected"];
const FILTER_OPTIONS = ["All", "Applied", "Shortlisted", "Interview", "Selected", "Rejected"];

export default function ApplicationsPage() {
  const [dbApps, setDbApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    applicationsAPI.list()
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        const mapped = raw.map((a: any) => ({
          id: a.id,
          company: a.job?.recruiter?.recruiter_profile?.company_name || a.job?.company_name || "Company",
          title: a.job?.title || "Role",
          appliedDate: a.created_at ? new Date(a.created_at).toLocaleDateString() : "—",
          status: a.status || "applied",
          statusLabel: a.status === "applied" ? "Under Review"
            : a.status === "shortlisted" ? "Shortlisted"
            : a.status === "interview" ? "Interview Scheduled"
            : a.status === "selected" ? "Selected"
            : "Not Selected",
          logo: (a.job?.company_name || a.job?.recruiter?.recruiter_profile?.company_name || "C")[0],
          interviewDate: a.interview_date || null,
          round: a.current_round || null,
        }));
        setDbApps(mapped);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = dbApps.filter((a: any) =>
    filter === "All" ? true : a.status === filter.toLowerCase()
  );

  const counts = {
    total: dbApps.length,
    shortlisted: dbApps.filter((a: any) => ["shortlisted", "interview", "selected"].includes(a.status)).length,
    interview: dbApps.filter((a: any) => a.status === "interview").length,
    selected: dbApps.filter((a: any) => a.status === "selected").length,
  };

  if (loading) return <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading applications...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>My Journey</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>
          Applications
        </h1>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Applied", value: counts.total },
          { label: "Shortlisted", value: counts.shortlisted },
          { label: "Interviews", value: counts.interview },
          { label: "Selected", value: counts.selected },
        ].map(({ label, value }) => (
          <GlassCard key={label} className="p-4 text-center" hover={false}>
            <p className="text-3xl font-black mb-1" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>{value}</p>
            <p className="label-caps" style={{ color: "#888888" }}>{label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Pipeline visual */}
      <GlassCard className="p-6 mb-6" hover={false}>
        <p className="label-caps mb-5" style={{ color: "#888888" }}>Placement Pipeline</p>
        <div className="flex items-center gap-0">
          {PIPELINE_STAGES.map((stage, i) => {
            const stagesWithThis = dbApps.filter((a: any) =>
              PIPELINE_STAGES.indexOf(a.status) >= i
            ).length;
            const isLast = i === PIPELINE_STAGES.length - 1;
            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: stagesWithThis > 0 ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.04)",
                      border: `2px solid ${stagesWithThis > 0 ? "#000000" : "rgba(0,0,0,0.1)"}`,
                      color: "#000000",
                      fontFamily: "Outfit",
                    }}
                  >
                    {stagesWithThis}
                  </div>
                  <p className="text-xs mt-2 capitalize" style={{ color: "#888888" }}>{stage}</p>
                </div>
                {!isLast && (
                  <div className="flex-1 h-px mx-2"
                    style={{ background: stagesWithThis > 0 ? "#000000" : "rgba(0,0,0,0.08)" }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </GlassCard>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <Filter size={13} style={{ color: "#888888" }} />
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 transition-all duration-200"
            style={{
              background: filter === f ? "#000000" : "rgba(0,0,0,0.04)",
              border: `1px solid ${filter === f ? "#000000" : "rgba(0,0,0,0.1)"}`,
              color: filter === f ? "#ffffff" : "#888888",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <p className="text-lg font-semibold" style={{ color: "#000000" }}>No applications yet</p>
          <p className="text-sm mt-2" style={{ color: "#888888" }}>Apply for jobs to see your applications here.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG["applied"];
            return (
              <GlassCard key={app.id} className="p-5" hover={false}>
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center text-base font-black flex-shrink-0"
                    style={{ background: "#000000", color: "#ffffff", fontFamily: "Outfit" }}
                  >
                    {app.logo}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#000000" }}>{app.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#888888" }}>{app.company}</p>
                      </div>
                      <span
                        className="text-xs px-3 py-1.5 font-semibold flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                      >
                        {cfg.icon}
                        {app.statusLabel}
                      </span>
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center gap-2 mt-3">
                      {PIPELINE_STAGES.map((stage, i) => {
                        const reached = PIPELINE_STAGES.indexOf(app.status) >= i;
                        return (
                          <React.Fragment key={stage}>
                            <div className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: reached ? "#000000" : "rgba(0,0,0,0.1)" }} />
                            {i < PIPELINE_STAGES.length - 1 && (
                              <div className="h-px flex-shrink-0"
                                style={{ width: "24px", background: reached ? "#000000" : "rgba(0,0,0,0.08)" }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: "#888888" }}>
                      <span>Applied {app.appliedDate}</span>
                      {app.interviewDate && (
                        <span className="font-semibold" style={{ color: "#000000" }}>
                          Interview: {app.interviewDate} — {app.round}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
