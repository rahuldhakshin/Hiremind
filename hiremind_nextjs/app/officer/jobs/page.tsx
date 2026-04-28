"use client";
import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/liquid-glass";
import { officerAPI } from "@/lib/api";
import { CheckCircle, XCircle } from "lucide-react";

export default function OfficerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    officerAPI.pendingJobs().then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setJobs(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await officerAPI.approveJob(id, action);
      setStatuses(prev => ({ ...prev, [id]: action === "approve" ? "approved" : "rejected" }));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading pending jobs...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>Job Approvals</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>Approve Jobs</h1>
      </div>

      {jobs.length === 0 ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <p className="text-lg font-semibold" style={{ color: "#000000" }}>No pending jobs</p>
          <p className="text-sm mt-2" style={{ color: "#888888" }}>All job postings have been reviewed.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map((job: any) => {
            const status = statuses[job.id];
            return (
              <GlassCard key={job.id} className="p-6" hover={false}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-base font-bold" style={{ color: "#000000" }}>{job.title}</p>
                    <p className="text-sm mt-1" style={{ color: "#888888" }}>
                      {job.company_name || "Company"} · {job.location || "Remote"} ·
                      {job.salary_min && job.salary_max ? ` ${job.salary_min}–${job.salary_max} LPA` : ""}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#888888" }}>
                      CGPA {job.min_cgpa || "0"}+ · {job.department || "All Departments"} ·
                      Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recent"}
                    </p>
                    {job.description && (
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: "#888888" }}>{job.description}</p>
                    )}
                  </div>
                </div>
                {!status ? (
                  <div className="flex gap-3">
                    <button onClick={() => handleAction(job.id, "approve")} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold" style={{ background: "#000000", color: "#ffffff" }}>
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={() => handleAction(job.id, "reject")} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold" style={{ border: "1px solid #000000", color: "#000000" }}>
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-xs font-semibold py-2" style={{ border: "1px solid #000000", color: "#000000" }}>
                    {status === "approved" ? "Approved" : "Rejected"}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
