"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Banknote, Clock, X, SlidersHorizontal } from "lucide-react";
import { GlassCard } from "@/components/ui/liquid-glass";
import { jobsAPI } from "@/lib/api";

const JOB_TYPES = ["All", "Full-time", "Internship", "Contract"];
const LOCATIONS = ["All Locations", "Bangalore", "Hyderabad", "Chennai", "Mumbai", "Pune", "Remote"];

export default function JobsPage() {
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "deadline" | "salary">("match");

  useEffect(() => {
    jobsAPI.list()
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        const mapped = raw.map((j: any) => ({
          id: j.id,
          company: j.company_name || j.recruiter?.recruiter_profile?.company_name || "Company",
          title: j.title,
          location: j.location || "Remote",
          salary: j.salary_min && j.salary_max
            ? `₹${j.salary_min}–${j.salary_max} LPA`
            : j.salary_min ? `₹${j.salary_min} LPA` : "Not specified",
          type: j.job_type ? j.job_type.replace("_", " ") : "Full-time",
          deadline: j.deadline ? new Date(j.deadline).toLocaleDateString() : "No deadline",
          match: j.match_percentage || 0,
          tags: j.required_skills
            ? j.required_skills.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          department: j.department || "All Departments",
          cgpa: j.min_cgpa || "0",
          logo: (j.company_name || j.recruiter?.recruiter_profile?.company_name || "C")[0],
        }));
        setDbJobs(mapped);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = dbJobs
    .filter((j: any) => {
      const q = search.toLowerCase();
      const tags = Array.isArray(j.tags) ? j.tags : [];
      return (
        (j.title?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          tags.some((t: string) => t.toLowerCase().includes(q))) &&
        (typeFilter === "All" || j.type === typeFilter) &&
        (locationFilter === "All Locations" || j.location === locationFilter)
      );
    })
    .sort((a: any, b: any) => sortBy === "match" ? (b.match || 0) - (a.match || 0) : 0);

  if (loading) return <div className="text-center py-20 text-sm" style={{ color: "#000000" }}>Loading jobs...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label-caps mb-2" style={{ color: "#000000" }}>Job Board</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>
          Open Positions
          <span className="text-lg font-normal ml-4" style={{ color: "#888888" }}>
            {filtered.length} jobs matched
          </span>
        </h1>
      </div>

      {/* Search + Filter bar */}
      <GlassCard className="p-4 mb-6" hover={false}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
            <input
              className="glass-input pl-11 text-sm"
              style={{ color: "#000000" }}
              placeholder="Search by role, company, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#888888" }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Location */}
          <select
            className="glass-input text-sm appearance-none cursor-pointer"
            style={{ width: "180px", color: "#000000", backgroundColor: "#ffffff" }}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="label-caps whitespace-nowrap" style={{ color: "#888888" }}>Sort:</span>
            {(["match", "deadline", "salary"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="text-xs px-3 py-1.5 capitalize transition-all duration-200"
                style={{
                  background: sortBy === s ? "#000000" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${sortBy === s ? "#000000" : "rgba(0,0,0,0.1)"}`,
                  color: sortBy === s ? "#ffffff" : "#888888",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs px-4 py-2.5 flex items-center gap-2 font-semibold"
            style={{ border: "1px solid #000000", color: "#000000" }}
          >
            <SlidersHorizontal size={13} /> Filters
          </button>
        </div>

        {/* Type pills */}
        {showFilters && (
          <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <span className="label-caps" style={{ color: "#888888" }}>Type:</span>
            {JOB_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="text-xs px-3 py-1.5 transition-all duration-200"
                style={{
                  background: typeFilter === t ? "#000000" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${typeFilter === t ? "#000000" : "rgba(0,0,0,0.1)"}`,
                  color: typeFilter === t ? "#ffffff" : "#888888",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Job Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold" style={{ color: "#000000" }}>No jobs found</p>
          <p className="text-sm mt-2" style={{ color: "#888888" }}>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <Link href={`/student/jobs/${job.id}`} key={job.id}>
              <GlassCard className="p-6 h-full flex flex-col" hover={true}>
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: "#000000", color: "#ffffff", fontFamily: "Outfit, sans-serif" }}
                    >
                      {job.logo}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#000000" }}>{job.company}</p>
                      <p className="text-xs" style={{ color: "#888888" }}>
                        <MapPin size={10} className="inline mr-1" />{job.location}
                      </p>
                    </div>
                  </div>
                  {job.match > 0 && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-2xl font-black" style={{ color: "#000000", fontFamily: "Outfit, sans-serif" }}>
                        {job.match}%
                      </span>
                      <p className="label-caps text-[9px]" style={{ color: "#888888" }}>match</p>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold mb-3" style={{ color: "#000000" }}>{job.title}</h3>

                {/* Meta row */}
                <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: "#888888" }}>
                  <span className="flex items-center gap-1"><Banknote size={12} />{job.salary}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />Due {job.deadline}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {(Array.isArray(job.tags) ? job.tags : []).slice(0, 4).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 font-medium"
                      style={{ background: "#f5f3ef", border: "1px solid #e0e0e0", color: "#000000" }}
                    >
                      {tag}
                    </span>
                  ))}
                  <span
                    className="text-xs px-2.5 py-1 font-medium"
                    style={{ background: "#f5f3ef", border: "1px solid #e0e0e0", color: "#000000" }}
                  >
                    CGPA {job.cgpa}+
                  </span>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 flex items-center justify-between"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <span className="label-caps text-[10px]" style={{ color: "#888888" }}>{job.department}</span>
                  <span className="text-xs font-semibold" style={{ color: "#000000" }}>View & Apply →</span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
