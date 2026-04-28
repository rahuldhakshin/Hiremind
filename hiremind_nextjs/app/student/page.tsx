"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle, Clock, TrendingUp, ArrowRight, Star, Upload, Search, MessageSquare } from "lucide-react";
import { GlassCard, StatCard, GlassBadge } from "@/components/ui/liquid-glass";
import { useAuthStore } from "@/store/authStore";
import { jobsAPI, applicationsAPI } from "@/lib/api";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const QUICK_ACTIONS = [
  { icon: <Upload size={16} />, label: "Upload Resume", desc: "AI auto-fills your entire profile", href: "/student/profile" },
  { icon: <Search size={16} />, label: "Browse Jobs", desc: "See all AI-matched openings", href: "/student/jobs" },
  { icon: <MessageSquare size={16} />, label: "Ask AI Coach", desc: "Instant career guidance", href: "/student/ai-chat" },
];

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const firstName = user?.first_name || "Student";

  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsError, setJobsError] = useState(false);
  const [stats, setStats] = useState({ applications: 0, shortlisted: 0, interviews: 0, score: null as number | null });
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    // Fetch real jobs
    jobsAPI.list({ limit: 3 })
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setJobs(raw.slice(0, 3).map((j: any) => ({
          id: j.id,
          company: j.company_name || j.recruiter?.recruiter_profile?.company_name || "Company",
          title: j.title,
          salary: j.salary_min && j.salary_max ? `${j.salary_min}–${j.salary_max} LPA` : "Not specified",
          deadline: j.deadline ? new Date(j.deadline).toLocaleDateString() : "No deadline",
          match: j.match_percentage || 0,
          tags: j.required_skills
            ? j.required_skills.split(",").map((s: string) => s.trim()).filter(Boolean).slice(0, 3)
            : [],
        })));
      })
      .catch(() => setJobsError(true));

    // Fetch real application stats
    applicationsAPI.list()
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        setStats({
          applications: raw.length,
          shortlisted: raw.filter((a: any) => ["shortlisted", "interview", "selected"].includes(a.status)).length,
          interviews: raw.filter((a: any) => a.status === "interview").length,
          score: null,
        });
      })
      .catch(() => setStatsError(true));

    // Fetch readiness score
    api.get("/student/readiness-score/")
      .then(res => setStats(prev => ({ ...prev, score: res.data.score ?? null })))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="max-w-7xl mx-auto pt-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-12" style={{ backgroundColor: "#e0e0e0" }}>
          <StatCard label="Applications Sent" value={String(stats.applications)} icon={<Briefcase size={16} />} />
          <StatCard label="Shortlisted" value={String(stats.shortlisted)} icon={<Star size={16} />} />
          <StatCard label="Interviews" value={String(stats.interviews)} icon={<CheckCircle size={16} />} />
          <StatCard
            label="Placement Score"
            value={stats.score !== null ? `${stats.score}%` : "—"}
            icon={<TrendingUp size={16} />}
            trend={stats.score !== null ? (stats.score >= 80 ? "Excellent" : stats.score >= 60 ? "Good" : "Needs Work") : ""}
            trendPositive={stats.score !== null && stats.score >= 60}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Readiness block — live score */}
            <GlassCard className="p-8" hover={false}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="label-caps mb-2" style={{ color: "#000000" }}>Placement Readiness Score</p>
                  <p className="text-5xl font-black" style={{ fontFamily: "Outfit, sans-serif", color: "#000000", letterSpacing: "-0.03em" }}>
                    {stats.score !== null ? stats.score : "—"}
                    <span className="text-2xl font-light"> / 100</span>
                  </p>
                </div>
                <div className="flex items-center justify-center" style={{ width: "56px", height: "56px", border: "2px solid #000000" }}>
                  <span className="text-lg font-black" style={{ color: "#000000" }}>
                    {stats.score !== null ? (stats.score >= 80 ? "A" : stats.score >= 60 ? "B" : "C") : "—"}
                  </span>
                </div>
              </div>
              <div className="h-px mb-6" style={{ backgroundColor: "#e0e0e0", position: "relative" }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, height: "2px",
                  width: `${stats.score ?? 0}%`, backgroundColor: "#000000", marginTop: "-0.5px",
                }} />
              </div>
              <p className="text-sm mb-5" style={{ color: "#000000", lineHeight: 1.7 }}>
                Upload your resume and add LinkedIn/GitHub to boost your score.
              </p>
              <Link href="/student/profile">
                <span className="text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center gap-2" style={{ color: "#000000" }}>
                  Boost my score <ArrowRight size={12} />
                </span>
              </Link>
            </GlassCard>

            {/* Matched Jobs */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black tracking-tight" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>
                  Matched Jobs
                </h2>
                <Link href="/student/jobs">
                  <span className="label-caps cursor-pointer" style={{ color: "#000000" }}>View all →</span>
                </Link>
              </div>

              {jobsError ? (
                <GlassCard className="p-6 text-center" hover={false}>
                  <p className="text-sm" style={{ color: "#888888" }}>Could not load jobs. Please check your connection.</p>
                </GlassCard>
              ) : jobs.length === 0 ? (
                <GlassCard className="p-6 text-center" hover={false}>
                  <p className="text-sm" style={{ color: "#888888" }}>No jobs available yet. Check back soon.</p>
                </GlassCard>
              ) : (
                <div className="flex flex-col" style={{ gap: "1px", backgroundColor: "#e0e0e0" }}>
                  {jobs.map((job) => (
                    <Link href={`/student/jobs/${job.id}`} key={job.id}>
                      <GlassCard className="p-5" hover={true}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-base font-bold mb-1" style={{ color: "#000000" }}>{job.title}</p>
                            <p className="text-sm" style={{ color: "#888888" }}>{job.company} · {job.salary}</p>
                          </div>
                          {job.match > 0 && (
                            <div className="text-right flex-shrink-0 ml-4">
                              <span className="text-2xl font-black block" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>
                                {job.match}%
                              </span>
                              <span className="label-caps text-[9px]" style={{ color: "#888888" }}>match</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {job.tags.map((tag: string) => (
                            <GlassBadge key={tag} variant="accent">{tag}</GlassBadge>
                          ))}
                          <GlassBadge variant="accent">
                            <Clock size={9} className="inline mr-1" />{job.deadline}
                          </GlassBadge>
                        </div>
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Actions + AI Coach */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-black tracking-tight" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>
              Quick Actions
            </h2>
            <div className="flex flex-col" style={{ gap: "1px", backgroundColor: "#e0e0e0" }}>
              {QUICK_ACTIONS.map((action) => (
                <GlassCard key={action.label} className="p-5" hover={true} onClick={() => router.push(action.href)}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center flex-shrink-0"
                      style={{ width: "36px", height: "36px", border: "1px solid #000000", color: "#000000" }}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: "#000000" }}>{action.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#888888" }}>{action.desc}</p>
                    </div>
                    <ArrowRight size={14} style={{ color: "#000000", flexShrink: 0 }} />
                  </div>
                </GlassCard>
              ))}
            </div>

            <GlassCard className="p-6 mt-2" hover={false} style={{ backgroundColor: "#000000" }}>
              <p className="label-caps mb-2" style={{ color: "#888888" }}>AI Career Coach</p>
              <p className="text-sm mb-5" style={{ color: "#ffffff", lineHeight: 1.7 }}>
                Ask anything about placements, resume tips, interview prep, or career guidance.
              </p>
              <Link href="/student/ai-chat">
                <span className="text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center gap-2" style={{ color: "#ffffff" }}>
                  Start a conversation <ArrowRight size={12} />
                </span>
              </Link>
            </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
}
