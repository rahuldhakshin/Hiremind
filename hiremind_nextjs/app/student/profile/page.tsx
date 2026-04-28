"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Sparkles, CheckCircle, XCircle, Star, Brain, FileText, ChevronDown, ChevronUp, Zap, BarChart, Target, Bot } from "lucide-react";
import { GlassCard, GlassButton, GlassBadge } from "@/components/ui/liquid-glass";
import { useAuthStore } from "@/store/authStore";
import { profileAPI, jobsAPI } from "@/lib/api"; // we might need to add readinessScore to profileAPI or just use api instance
import api from "@/lib/api";

export default function StudentProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI Feature States
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [atsData, setAtsData] = useState<any>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  const [interviewData, setInterviewData] = useState<any>(null);
  const [interviewLoading, setInterviewLoading] = useState(false);

  const uploadedFileRef = useRef<File | null>(null);

  const [placementData, setPlacementData] = useState<any>(null);
  const [placementLoading, setPlacementLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchPlacementPredictor();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await profileAPI.get();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacementPredictor = async () => {
    setPlacementLoading(true);   // always show spinner when re-fetching
    setPlacementData(null);      // clear stale value so UI shows loading
    try {
      const { data } = await api.get("/student/readiness-score/");
      setPlacementData(data);
    } catch (err) {
      console.error("Failed to load placement predictor", err);
    } finally {
      setPlacementLoading(false);
    }
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await profileAPI.parseResume(file);
      setUploadResult(data);
      setUploadDone(true);
      uploadedFileRef.current = file;
      // Clear ALL stale data immediately before refetching
      setAtsData(null);
      setInterviewData(null);
      setPlacementData(null);
      // Refresh profile + placement predictor with new data
      fetchProfile();
      fetchPlacementPredictor();
      // Auto-fetch ATS and interview with the actual uploaded file
      setActiveSection("ats");
      fetchAtsWithFile(file);
      fetchInterviewWithFile(file);
    } catch (err) {
      console.error(err);
      alert("Failed to parse resume");
    } finally {
      setUploading(false);
    }
  };

  const fetchAtsWithFile = async (file: File) => {
    setAtsLoading(true);
    try {
      const form = new FormData();
      form.append("resume", file);
      const { data } = await api.post("/resume/review/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // normalise field names — backend may return score or ats_score
      const score = data.score ?? data.ats_score ?? data.compatibility_score ?? 0;
      setAtsData({ ...data, score });
    } catch (err) {
      console.error(err);
    } finally {
      setAtsLoading(false);
    }
  };

  const fetchAts = async () => {
    if (atsData) return; // already loaded, don't refetch unless cleared
    const file = uploadedFileRef.current;
    if (!file) return;
    await fetchAtsWithFile(file);
  };

  const fetchInterviewWithFile = async (file: File) => {
    setInterviewLoading(true);
    try {
      const form = new FormData();
      form.append("resume", file);
      const { data } = await api.post("/resume/interview-questions/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      let questions: any[] = [];
      if (data.technical) questions.push(...data.technical.map((q: string) => ({ type: "Technical", question: q })));
      if (data.hr) questions.push(...data.hr.map((q: string) => ({ type: "HR", question: q })));
      if (data.project) questions.push(...data.project.map((q: string) => ({ type: "Project", question: q })));
      if (Array.isArray(data.questions)) questions = data.questions;
      setInterviewData({ questions: questions.length > 0 ? questions : null });
    } catch (err) {
      console.error("Interview questions error:", err);
    } finally {
      setInterviewLoading(false);
    }
  };

  const fetchInterview = async () => {
    if (interviewData) return;
    const file = uploadedFileRef.current;
    if (!file) return;
    fetchInterviewWithFile(file);
  };

  const toggleSection = (s: string) => {
    if (activeSection === s) {
      setActiveSection(null);
    } else {
      setActiveSection(s);
      if (s === "ats") fetchAts();
      if (s === "interview") fetchInterview();
    }
  };

  if (loading) return <div className="text-center mt-20">Loading profile...</div>;
  if (!profile) return <div className="text-center mt-20">Error loading profile</div>;

  const fullName = `${profile.user.first_name} ${profile.user.last_name}`.trim() || profile.user.username;
  const skillsList = profile.skills ? profile.skills.split(',').map((s:string) => s.trim()).filter(Boolean) : [];
  const certList = profile.certifications ? profile.certifications.split(',').map((s:string) => s.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>My Profile</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>
          {fullName}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#000000", fontWeight: 500 }}>{profile.department} · Batch {profile.batch_year}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─── Left: Profile info ─── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Basic Info Card */}
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                style={{ background: "rgba(0,0,0,0.15)", border: "2px solid rgba(0,0,0,0.3)", color: "#000000", fontFamily: "Outfit" }}
              >
                {fullName[0]}
              </div>
              <div className="flex-1">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "CGPA", value: profile.cgpa },
                    { label: "Email", value: profile.user.email },
                    { label: "LinkedIn", value: profile.linkedin_url || "-" },
                    { label: "GitHub", value: profile.github_url || "-" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="label-caps mb-0.5" style={{ color: "#000000", fontWeight: 600 }}>{label}</p>
                      <p style={{ color: "#000000" }} className="font-medium truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <p className="label-caps mb-3" style={{ color: "#000000", fontWeight: 600 }}>Skills</p>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((s:string) => <GlassBadge key={s} variant="accent">{s}</GlassBadge>)}
                {skillsList.length === 0 && <span className="text-xs text-gray-500">No skills added yet.</span>}
              </div>
            </div>

            {/* Certifications */}
            <div className="mt-4">
              <p className="label-caps mb-3" style={{ color: "#000000", fontWeight: 600 }}>Certifications</p>
              <div className="flex flex-wrap gap-2">
                {certList.map((c:string) => <GlassBadge key={c} variant="accent">{c}</GlassBadge>)}
                {certList.length === 0 && <span className="text-xs text-gray-500">No certifications added yet.</span>}
              </div>
            </div>
          </GlassCard>

          {/* ─── AI Resume Upload ─── */}
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} style={{ color: "#000000" }} />
              <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>
                Smart Resume Upload
              </h2>
            </div>

            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />

            {!uploadDone ? (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
                className="rounded-2xl p-10 text-center cursor-pointer transition-all duration-300"
                style={{
                  border: `2px dashed ${isDragOver ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.12)"}`,
                  background: isDragOver ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.02)",
                }}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-[#000000] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold" style={{ color: "#000000" }}>AI is reading your resume...</p>
                    <p className="text-xs" style={{ color: "#000000" }}>Extracting skills, CGPA, certifications&hellip;</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.2)" }}
                    >
                      <Upload size={22} style={{ color: "#000000" }} />
                    </div>
                    <p className="text-base font-semibold" style={{ color: "#000000" }}>
                      Drop your resume here
                    </p>
                    <p className="text-sm" style={{ color: "#000000" }}>PDF format · AI auto-fills your entire profile</p>
                    <GlassButton variant="primary" className="text-xs mt-2 px-6">
                      Browse File
                    </GlassButton>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: "rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.2)" }}
              >
                <CheckCircle size={28} className="mx-auto mb-3" style={{ color: "#000000" }} />
                <p className="font-semibold mb-1" style={{ color: "#000000" }}>Profile Updated Successfully!</p>
                <p className="text-xs" style={{ color: "#000000" }}>AI extracted data from your resume.</p>
                <button
                  onClick={() => setUploadDone(false)}
                  className="text-xs mt-3 font-semibold"
                  style={{ color: "#000000" }}
                >
                  Upload a different resume
                </button>
              </div>
            )}
          </GlassCard>

          {/* ─── ATS Score ─── */}
          <GlassCard className="p-6" hover={false}>
            <button className="flex items-center justify-between w-full" onClick={() => toggleSection("ats")}>
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: "#000000" }} />
                <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>ATS Resume Score</h2>
              </div>
              {activeSection === "ats" ? <ChevronUp size={18} style={{ color: "#000000" }} /> : <ChevronDown size={18} style={{ color: "#000000" }} />}
            </button>

            {activeSection === "ats" && (
              <div className="mt-5">
                {atsLoading ? (
                  <div className="text-center py-8 text-sm">Analyzing your resume against industry standards...</div>
                ) : atsData ? (
                  <>
                    <div className="flex items-center gap-6 mb-6">
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(0,0,0,0.1)", border: "3px solid rgba(0,0,0,0.35)" }}
                      >
                        <div className="text-center">
                          <p className="text-3xl font-black leading-none" style={{ color: "#000000", fontFamily: "Outfit" }}>{atsData.score}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#000000" }}>/100</p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "rgba(0,0,0,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width: `${atsData.score}%`, background: "#000000" }} />
                        </div>
                        <p className="text-xs" style={{ color: "#000000" }}>Score {atsData.score} / 100 — ATS Compatibility</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="label-caps mb-2" style={{ color: "#000000" }}>✓ Strengths</p>
                        {atsData.strengths?.length > 0
                          ? atsData.strengths.map((s: string) => (
                              <p key={s} className="text-xs py-1 flex items-start gap-2" style={{ color: "#000000" }}>
                                <CheckCircle size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#000000" }} />{s}
                              </p>
                            ))
                          : <p className="text-xs" style={{ color: "#888888" }}>None detected</p>
                        }
                      </div>
                      <div>
                        <p className="label-caps mb-2" style={{ color: "#000000" }}>⚠ Issues</p>
                        {atsData.issues?.length > 0
                          ? atsData.issues.map((s: string) => (
                              <p key={s} className="text-xs py-1 flex items-start gap-2" style={{ color: "#000000" }}>
                                <XCircle size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#000000" }} />{s}
                              </p>
                            ))
                          : <p className="text-xs" style={{ color: "#888888" }}>None detected</p>
                        }
                      </div>
                    </div>
                    {atsData.suggestions?.length > 0 && (
                      <div className="mt-2">
                        <p className="label-caps mb-2" style={{ color: "#000000" }}>Suggestions</p>
                        {atsData.suggestions.map((s: string) => (
                          <p key={s} className="text-xs py-1 flex items-start gap-2" style={{ color: "#444444" }}>
                            <span className="flex-shrink-0 mt-0.5">→</span>{s}
                          </p>
                        ))}
                      </div>
                    )}
                    {atsData.missing_sections?.length > 0 && (
                      <div className="mt-3 pt-3" style={{ borderTop: "1px solid #e0e0e0" }}>
                        <p className="label-caps mb-1" style={{ color: "#888888" }}>Missing Sections</p>
                        <p className="text-xs" style={{ color: "#888888" }}>{atsData.missing_sections.join(", ")}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-sm">Please upload a resume first to get your ATS score.</div>
                )}
              </div>
            )}
          </GlassCard>

          {/* ─── Interview Questions ─── */}
          <GlassCard className="p-6" hover={false}>
            <button className="flex items-center justify-between w-full" onClick={() => toggleSection("interview")}>
              <div className="flex items-center gap-2">
                <Brain size={16} style={{ color: "#000000" }} />
                <h2 className="text-lg font-bold" style={{ fontFamily: "Outfit", color: "#000000" }}>AI Interview Questions</h2>
              </div>
              {activeSection === "interview" ? <ChevronUp size={18} style={{ color: "#000000" }} /> : <ChevronDown size={18} style={{ color: "#000000" }} />}
            </button>

            {activeSection === "interview" && (
              <div className="mt-5 flex flex-col gap-3">
                {interviewLoading ? (
                  <div className="text-center py-8 text-sm">Generating targeted questions based on your profile...</div>
                ) : interviewData?.questions ? (
                  interviewData.questions.map((q:any, i:number) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl"
                      style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.07)" }}
                    >
                      <GlassBadge variant="accent" className="mb-2">
                        {q.type}
                      </GlassBadge>
                      <p className="text-sm mt-2" style={{ color: "#000000", lineHeight: 1.7 }}>{q.question || q.q}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm">No questions available. Try uploading a detailed resume.</div>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* ─── Right: Scores ─── */}
        <div className="flex flex-col gap-4">
          {/* Placement Predictor */}
          <GlassCard
            className="p-6"
            hover={false}
            style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.02))", borderColor: "rgba(0,0,0,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} style={{ color: "#000000" }} />
              <p className="label-caps" style={{ color: "#000000" }}>AI Placement Predictor</p>
            </div>
            {placementLoading ? (
              <div className="text-center py-10 text-xs">Analyzing readiness...</div>
            ) : placementData ? (
              <>
                <div
                  className="w-28 h-28 rounded-full mx-auto flex items-center justify-center mb-4"
                  style={{ background: "rgba(0,0,0,0.12)", border: "3px solid rgba(0,0,0,0.4)" }}
                >
                  <div className="text-center">
                    <p className="text-4xl font-black" style={{ color: "#000000", fontFamily: "Outfit" }}>{placementData.score}%</p>
                  </div>
                </div>
                <p className="text-center text-sm font-semibold mb-1" style={{ color: "#000000" }}>{placementData.label}</p>
                <p className="text-center text-xs" style={{ color: "#000000", fontWeight: 500 }}>Based on CGPA, skills, certifications & experience</p>
                <div className="h-2 rounded-full overflow-hidden mt-4" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${placementData.score}%`, background: "#000000" }} />
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-xs">Could not load placement score.</div>
            )}
          </GlassCard>

          {/* Quick AI Tools */}
          {[
            { icon: <BarChart size={18} style={{ color: "#000000" }} />, label: "ATS Score", action: () => toggleSection("ats") },
            { icon: <Target size={18} style={{ color: "#000000" }} />, label: "Interview Questions", action: () => toggleSection("interview") },
            { icon: <Bot size={18} style={{ color: "#000000" }} />, label: "Career Coach", href: "/student/ai-chat" },
          ].map((tool) => (
            <GlassCard key={tool.label} className="p-4" onClick={tool.action} style={{cursor: tool.action ? 'pointer' : 'default'}}>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center">{tool.icon}</span>
                <p className="text-sm font-medium" style={{ color: "#000000" }}>{tool.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
