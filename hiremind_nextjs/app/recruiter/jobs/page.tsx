"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { GlassCard, GlassButton } from "@/components/ui/liquid-glass";
import { recruiterAPI } from "@/lib/api";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruiterAPI.myJobs().then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setJobs(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading jobs...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label-caps mb-2" style={{ color: "#000000" }}>My Postings</p>
          <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>My Jobs</h1>
        </div>
        <Link href="/recruiter/post-job">
          <GlassButton variant="primary" className="flex items-center gap-2 text-sm">
            <Plus size={14} /> Post New Job
          </GlassButton>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <p className="text-lg font-semibold mb-2" style={{ color: "#000000" }}>No jobs posted yet</p>
          <p className="text-sm mb-6" style={{ color: "#888888" }}>Post your first job to start receiving applications.</p>
          <Link href="/recruiter/post-job"><GlassButton variant="primary">Post a Job</GlassButton></Link>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job: any) => (
            <GlassCard key={job.id} className="p-5" hover={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold mb-1" style={{ color: "#000000" }}>{job.title}</p>
                  <p className="text-sm" style={{ color: "#888888" }}>
                    {job.location || "Remote"} · {job.job_type?.replace("_", " ") || "Full-time"} ·
                    Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#888888" }}>
                    {job.salary_min && job.salary_max ? `${job.salary_min}–${job.salary_max} LPA` : "Salary not specified"}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs px-2 py-1" style={{ border: "1px solid #000000", color: "#000000" }}>
                    {job.status || "pending"}
                  </span>
                  <Link href={`/recruiter/applicants?job=${job.id}`}>
                    <ArrowRight size={16} style={{ color: "#000000" }} />
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
