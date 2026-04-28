"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, Users, Clock, CheckCircle, PlusCircle, ArrowRight } from "lucide-react";
import { GlassCard, StatCard, GlassButton } from "@/components/ui/liquid-glass";
import { recruiterAPI } from "@/lib/api";

export default function RecruiterDashboard() {
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [dbApplicants, setDbApplicants] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, pendingReview: 0, offers: 0 });

  useEffect(() => {
    recruiterAPI.myJobs().then(async (res) => {
      const jobs = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setDbJobs(jobs);
      let totalApp = 0, pending = 0, offers = 0, allApps: any[] = [];
      const recentJobs = jobs.slice(0, 3);
      for (const job of recentJobs) {
        try {
          const appRes = await recruiterAPI.getApplicants(job.id);
          const applicants = Array.isArray(appRes.data) ? appRes.data : (appRes.data.results ?? []);
          totalApp += applicants.length;
          applicants.forEach((a: any) => {
            if (a.status === "applied") pending++;
            if (a.status === "selected") offers++;
            allApps.push({
              name: a.student?.user?.first_name ? `${a.student.user.first_name} ${a.student.user.last_name}` : "Student",
              job: job.title, cgpa: a.student?.cgpa || "N/A",
              skills: a.student?.skills ? a.student.skills.split(",").slice(0, 2) : [],
              status: a.status, match: a.match_percentage || 0,
            });
          });
        } catch (e) { console.error("Failed to load applicants for job", job.id, e); }
      }
      setDbApplicants(allApps.slice(0, 5));
      setStats({ activeJobs: jobs.filter((j: any) => j.status === "published").length, totalApplicants: totalApp, pendingReview: pending, offers });
    }).catch(console.error);
  }, []);

  const activeJobsList = dbJobs.slice(0, 3).map((j: any) => ({
    id: j.id, title: j.title, applicants: 0,
    deadline: j.deadline ? new Date(j.deadline).toLocaleDateString() : "Open",
    status: j.status === "published" ? "active" : "pending"
  }));

  const recentAppsList = dbApplicants;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>Recruiter Portal</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Jobs" value={String(stats.activeJobs)} icon={<Briefcase size={18} style={{ color: "#000000" }} />} />
        <StatCard label="Total Applicants" value={String(stats.totalApplicants)} icon={<Users size={18} style={{ color: "#000000" }} />} />
        <StatCard label="Pending Review" value={String(stats.pendingReview)} icon={<Clock size={18} style={{ color: "#000000" }} />} />
        <StatCard label="Offers Extended" value={String(stats.offers)} icon={<CheckCircle size={18} style={{ color: "#000000" }} />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>Active Jobs</h2>
              <Link href="/recruiter/jobs"><span className="label-caps cursor-pointer" style={{ color: "#888888" }}>View all →</span></Link>
            </div>
            {activeJobsList.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "#888888" }}>No jobs posted yet. Create your first job posting.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activeJobsList.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4" style={{ background: "#f5f3ef", border: "1px solid #e0e0e0" }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#000000" }}>{job.title}</p>
                      <p className="text-xs mt-1" style={{ color: "#888888" }}>Deadline {job.deadline}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 capitalize" style={{ background: "transparent", border: "1px solid #000000", color: "#000000" }}>
                        {job.status}
                      </span>
                      <Link href={`/recruiter/applicants?job=${job.id}`}>
                        <ArrowRight size={16} style={{ color: "#000000" }} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>Recent Applicants</h2>
              <Link href="/recruiter/applicants"><span className="label-caps cursor-pointer" style={{ color: "#888888" }}>View all →</span></Link>
            </div>
            {recentAppsList.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "#888888" }}>No applicants yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentAppsList.map((a: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-4" style={{ background: "#f5f3ef", border: "1px solid #e0e0e0" }}>
                    <div className="w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "#000000", color: "#ffffff" }}>
                      {(a.name || "?")[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "#000000" }}>{a.name}</p>
                      <p className="text-xs" style={{ color: "#888888" }}>{a.job} · CGPA {a.cgpa}</p>
                    </div>
                    {a.match > 0 && (
                      <span className="text-sm font-black" style={{ color: "#000000", fontFamily: "Outfit" }}>{a.match}%</span>
                    )}
                    <span className="text-xs px-2 py-1 capitalize" style={{ border: "1px solid #000000", color: "#000000" }}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="flex flex-col gap-4">
          <GlassCard className="p-6" hover={false} style={{ background: "#f5f3ef", borderColor: "#000000" }}>
            <PlusCircle size={28} className="mb-4" style={{ color: "#000000" }} />
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Outfit", color: "#000000" }}>Post a New Job</h3>
            <p className="text-sm mb-5" style={{ color: "#888888" }}>Reach thousands of qualified engineering students instantly.</p>
            <Link href="/recruiter/post-job">
              <GlassButton variant="primary" fullWidth className="text-sm">Create Job Posting →</GlassButton>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
