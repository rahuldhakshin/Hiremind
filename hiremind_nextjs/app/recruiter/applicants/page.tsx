"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/liquid-glass";
import { recruiterAPI } from "@/lib/api";

const STATUS_OPTIONS = ["applied", "shortlisted", "interview", "selected", "rejected"];

function ApplicantsContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(jobId ? Number(jobId) : null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    recruiterAPI.myJobs().then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setJobs(data);
      if (!selectedJob && data.length > 0) setSelectedJob(data[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    recruiterAPI.getApplicants(selectedJob).then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setApplicants(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedJob]);

  const updateStatus = async (appId: number, status: string) => {
    try {
      await recruiterAPI.updateApplicationStatus(appId, status);
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>Manage Candidates</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>Applicants</h1>
      </div>

      {jobs.length > 0 && (
        <GlassCard className="p-4 mb-6" hover={false}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="label-caps" style={{ color: "#000000" }}>Viewing job:</span>
            <select
              className="glass-input text-sm appearance-none"
              style={{ width: "320px", color: "#000000", backgroundColor: "#ffffff" }}
              value={selectedJob || ""}
              onChange={e => setSelectedJob(Number(e.target.value))}
            >
              {jobs.map((j: any) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading applicants...</div>
      ) : applicants.length === 0 ? (
        <GlassCard className="p-12 text-center" hover={false}>
          <p className="text-lg font-semibold" style={{ color: "#000000" }}>No applicants yet</p>
          <p className="text-sm mt-2" style={{ color: "#888888" }}>Applications will appear here once students apply.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {applicants.map((a: any) => (
            <GlassCard key={a.id} className="p-5" hover={false}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "#000000", color: "#ffffff" }}>
                    {(a.student?.user?.first_name || "S")[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#000000" }}>
                      {a.student?.user?.first_name} {a.student?.user?.last_name}
                    </p>
                    <p className="text-xs" style={{ color: "#888888" }}>
                      {a.student?.user?.email} · CGPA {a.student?.cgpa || "N/A"} · Applied {new Date(a.created_at).toLocaleDateString()}
                    </p>
                    {a.student?.skills && (
                      <p className="text-xs mt-1" style={{ color: "#888888" }}>Skills: {a.student.skills}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    className="text-xs px-2 py-1 appearance-none cursor-pointer"
                    style={{ border: "1px solid #000000", color: "#000000", backgroundColor: "#f5f3ef" }}
                    value={a.status}
                    onChange={e => updateStatus(a.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApplicantsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading...</div>}>
      <ApplicantsContent />
    </Suspense>
  );
}
