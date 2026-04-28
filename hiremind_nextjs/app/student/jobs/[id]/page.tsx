"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobsAPI } from "@/lib/api";
import { ArrowLeft, MapPin, Banknote, Clock, CheckCircle, XCircle, Sparkles, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "@/components/ui/liquid-glass";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [skillGap, setSkillGap] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    jobsAPI.detail(id)
      .then(res => {
        const j = res.data;
        setJob({
          id: j.id,
          company: j.company_name || j.recruiter?.recruiter_profile?.company_name || "Company",
          title: j.title,
          location: j.location || "Remote",
          salary: j.salary_min && j.salary_max ? `₹${j.salary_min}–${j.salary_max} LPA` : (j.salary_min ? `₹${j.salary_min} LPA` : "Not specified"),
          type: j.job_type ? j.job_type.replace("_", " ") : "Full-time",
          deadline: j.deadline ? new Date(j.deadline).toLocaleDateString() : "No deadline",
          department: j.department || "All",
          cgpaRequired: j.min_cgpa || "0",
          match: j.match_percentage || 0,
          logo: (j.company_name || j.recruiter?.recruiter_profile?.company_name || "C")[0],
          description: j.description || "",
          responsibilities: j.requirements
            ? j.requirements.split("\n").map((r: string) => r.replace(/^[-*]\s*/, '')).filter(Boolean)
            : [],
          interviewRounds: j.interview_rounds
            ? j.interview_rounds.split(",").map((r: string) => r.trim())
            : ["Resume Shortlisting", "Technical Interview", "HR Round"],
        });
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));

    jobsAPI.skillGap(id)
      .then(res => setSkillGap(res.data))
      .catch(() => setSkillGap(null));
  }, [id]);

  const handleApply = async () => {
    try {
      await jobsAPI.apply(id);
      setApplied(true);
    } catch {
      setApplied(true);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setLoadingCoverLetter(true);
    setCoverLetterOpen(true);
    try {
      const res = await jobsAPI.coverLetter(id);
      setCoverLetter(res.data.cover_letter || res.data.message || JSON.stringify(res.data));
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || "Unknown error";
      setCoverLetter(`Error: ${msg}\n\nTip: Make sure you have uploaded a resume to your profile first.`);
    } finally {
      setLoadingCoverLetter(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading job details...</div>;
  if (!job) return <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Job not found.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm mb-6"
        style={{ color: "#888888" }}
      >
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─── Left: Job Details ─── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Header Card */}
          <GlassCard className="p-7" hover={false}>
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-14 h-14 flex items-center justify-center text-xl font-black flex-shrink-0"
                style={{ background: "#000000", color: "#ffffff", fontFamily: "Outfit" }}
              >
                {job.logo}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>
                  {job.title}
                </h1>
                <p className="text-base font-semibold mb-2" style={{ color: "#444444" }}>{job.company}</p>
                <div className="flex flex-wrap gap-4 text-sm" style={{ color: "#888888" }}>
                  <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>
                  <span className="flex items-center gap-1"><Banknote size={13} />{job.salary}</span>
                  <span className="flex items-center gap-1"><Clock size={13} />Deadline: {job.deadline}</span>
                </div>
              </div>
              {job.match > 0 && (
                <div className="text-right flex-shrink-0">
                  <span className="text-3xl font-black" style={{ color: "#000000", fontFamily: "Outfit" }}>{job.match}%</span>
                  <p className="text-xs mt-0.5" style={{ color: "#888888" }}>match</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1 font-semibold" style={{ border: "1px solid #000000", color: "#000000" }}>CGPA {job.cgpaRequired}+</span>
              <span className="text-xs px-3 py-1 font-semibold" style={{ border: "1px solid #000000", color: "#000000" }}>{job.type}</span>
              <span className="text-xs px-3 py-1 font-semibold" style={{ border: "1px solid #000000", color: "#000000" }}>{job.department}</span>
            </div>
          </GlassCard>

          {/* Description */}
          <GlassCard className="p-7" hover={false}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Outfit", color: "#000000" }}>About the Role</h2>
            <p className="text-sm whitespace-pre-line" style={{ color: "#444444", lineHeight: 1.8 }}>{job.description}</p>

            {job.responsibilities.length > 0 && (
              <>
                <h3 className="text-base font-semibold mt-6 mb-3" style={{ color: "#000000" }}>Key Responsibilities</h3>
                <ul className="flex flex-col gap-2">
                  {job.responsibilities.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#444444" }}>
                      <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#000000" }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </GlassCard>

          {/* ─── Skill Gap Analyser ─── */}
          <GlassCard className="p-7" hover={false}>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} style={{ color: "#000000" }} />
              <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>AI Skill Gap Analysis</h2>
            </div>

            {job.match > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-caps" style={{ color: "#888888" }}>Profile Match</span>
                  <span className="font-bold text-sm" style={{ color: "#000000" }}>{job.match}%</span>
                </div>
                <div className="h-2 overflow-hidden" style={{ background: "#e0e0e0" }}>
                  <div className="h-full" style={{ width: `${job.match}%`, background: "#000000" }} />
                </div>
              </div>
            )}

            {skillGap ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="label-caps mb-3" style={{ color: "#000000" }}>
                    <CheckCircle size={10} className="inline mr-1" />You Have
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(skillGap.matched_skills || skillGap.present_skills || []).map((s: string) => (
                      <span key={s} className="text-xs px-3 py-1.5 font-medium"
                        style={{ background: "#f5f3ef", border: "1px solid #000000", color: "#000000" }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label-caps mb-3" style={{ color: "#000000" }}>
                    <XCircle size={10} className="inline mr-1" />Missing Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(skillGap.missing_skills || []).map((s: { skill: string; learn_at: string } | string) => {
                      const skillName = typeof s === 'object' ? s.skill : s;
                      const learnUrl = typeof s === 'object' ? s.learn_at : null;
                      return (
                        <a
                          key={skillName}
                          href={learnUrl || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={learnUrl ? `Learn ${skillName} →` : undefined}
                          className="text-xs px-3 py-1.5 font-medium"
                          style={{
                            background: "#f5f3ef",
                            border: "1px solid #888888",
                            color: "#888888",
                            textDecoration: "none",
                            cursor: learnUrl ? "pointer" : "default",
                          }}
                        >
                          ✗ {skillName}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "#888888" }}>Upload a resume to see your skill gap analysis.</p>
            )}
          </GlassCard>

          {/* ─── AI Cover Letter ─── */}
          <GlassCard className="p-7" hover={false}>
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setCoverLetterOpen(!coverLetterOpen)}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: "#000000" }} />
                <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>AI Cover Letter Generator</h2>
              </div>
              {coverLetterOpen
                ? <ChevronUp size={18} style={{ color: "#000000" }} />
                : <ChevronDown size={18} style={{ color: "#000000" }} />}
            </button>

            {coverLetterOpen && (
              <div className="mt-5">
                {!coverLetter && !loadingCoverLetter && (
                  <div className="text-center py-8">
                    <p className="text-sm mb-5" style={{ color: "#888888" }}>
                      Generate a personalised cover letter for this role using your resume and this job description.
                    </p>
                    <GlassButton variant="primary" onClick={handleGenerateCoverLetter} className="text-sm px-8">
                      <Sparkles size={14} className="inline mr-2" />Generate with AI
                    </GlassButton>
                  </div>
                )}
                {(coverLetter || loadingCoverLetter) && (
                  <div>
                    <div
                      className="p-5 mb-4 text-sm"
                      style={{ background: "#f5f3ef", border: "1px solid #e0e0e0", color: "#000000", lineHeight: 1.8, whiteSpace: "pre-line", minHeight: "200px", fontFamily: "Georgia, serif" }}
                    >
                      {coverLetter}
                      {loadingCoverLetter && <span className="animate-pulse">|</span>}
                    </div>
                    {!loadingCoverLetter && (
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-sm font-semibold"
                        style={{ color: copied ? "#000000" : "#555555" }}
                      >
                        <Copy size={14} />
                        {copied ? "Copied!" : "Copy to clipboard"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ─── Right: Apply + Interview Rounds ─── */}
        <div className="flex flex-col gap-4">
          <GlassCard className="p-6" hover={false} style={{ position: "sticky", top: "88px" }}>
            <p className="label-caps mb-1" style={{ color: "#888888" }}>Application</p>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "Outfit", color: "#000000" }}>
              {applied ? "Applied" : "Apply Now"}
            </h3>

            {!applied ? (
              <GlassButton variant="primary" fullWidth onClick={handleApply} className="text-sm tracking-widest uppercase mb-3">
                Apply to {job.company}
              </GlassButton>
            ) : (
              <div className="text-center py-3 text-sm font-semibold mb-3"
                style={{ background: "#f5f3ef", border: "1px solid #000000", color: "#000000" }}>
                Application Submitted
              </div>
            )}

            <button
              onClick={handleGenerateCoverLetter}
              className="w-full text-sm py-3 flex items-center justify-center gap-2 font-semibold"
              style={{ border: "1px solid #000000", color: "#000000" }}
            >
              <Sparkles size={14} /> Generate Cover Letter
            </button>

            <div className="my-5" style={{ borderTop: "1px solid #e0e0e0" }} />

            <p className="label-caps mb-3" style={{ color: "#888888" }}>Interview Process</p>
            <div className="flex flex-col gap-2">
              {job.interviewRounds.map((round: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "#000000", color: "#ffffff", fontFamily: "Outfit" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-xs" style={{ color: "#444444" }}>{round}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
