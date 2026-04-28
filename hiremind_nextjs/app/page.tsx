"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Brain, Cloud, Code2, ChevronDown, X } from "lucide-react";
import { GlassButton } from "@/components/ui/liquid-glass";

// ─── Company Data (Monolith artist-style grid) ───
const COMPANIES = [
  {
    name: "Google",
    role: "Hiring Partner",
    roles_offered: "SDE · ML Engineer · Cloud Architect",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
    color: "#4285F4",
    blurb: "Known for its innovative work culture, Google offers a playground for engineers to build products used by billions. Focus areas include AI, Cloud computing, and core Search infrastructure.",
  },
  {
    name: "Microsoft",
    role: "Hiring Partner",
    roles_offered: "SDE · Azure Engineer · PM",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    color: "#00A4EF",
    blurb: "At the forefront of enterprise software and cloud computing, Microsoft empowers its developers to create impactful solutions through Azure and cutting-edge AI.",
  },
  {
    name: "Amazon",
    role: "Hiring Partner",
    roles_offered: "SDE · AWS Cloud · Data Engineer",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80",
    color: "#FF9900",
    blurb: "A culture of customer obsession and high performance. Working at Amazon means tackling unprecedented scale in logistics, cloud computing (AWS), and e-commerce.",
  },
  {
    name: "Meta",
    role: "Hiring Partner",
    roles_offered: "SDE · AI Research · Systems",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    color: "#0080FB",
    blurb: "Connecting the world through social platforms and pioneering the metaverse. Engineers at Meta work on massive distributed systems and cutting-edge AR/VR technologies.",
  },
  {
    name: "Infosys",
    role: "Hiring Partner",
    roles_offered: "Developer · Analyst · Consultant",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    color: "#007CC3",
    blurb: "A global leader in next-generation digital services and consulting. Infosys provides a vast landscape for freshers to grow through world-class training programs.",
  },
  {
    name: "TCS",
    role: "Hiring Partner",
    roles_offered: "Developer · DevOps · QA Engineer",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    color: "#5B2D8E",
    blurb: "As India's largest IT services company, TCS offers unparalleled job security, global exposure, and the opportunity to work across diverse industry domains.",
  },
  {
    name: "Deloitte",
    role: "Hiring Partner",
    roles_offered: "Tech Consultant · Data Analyst",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
    color: "#86BC25",
    blurb: "Renowned for tech consulting, Deloitte bridges the gap between business strategy and technological implementation with a focus on data and transformation.",
  },
  {
    name: "Wipro",
    role: "Hiring Partner",
    roles_offered: "Developer · Cloud · AI/ML",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    color: "#341F6C",
    blurb: "A dynamic environment focusing on IT, consulting, and business process services. Wipro champions continuous learning and holistic employee growth.",
  },
];

// ─── Career Pillars ───
const CAREER_PILLARS = [
  {
    title: "ARTIFICIAL\nINTELLIGENCE",
    sub: "Machine Learning · Deep Learning · NLP · Computer Vision",
    desc: "The most transformative field of our era. We match your profile to AI/ML roles at top-tier product companies.",
    tag: "AI / ML",
  },
  {
    title: "SOFTWARE\nENGINEERING",
    sub: "Full Stack · Backend · Systems · Mobile",
    desc: "The backbone of every digital product. SDE roles across FAANG, startups, and unicorns — matched to your exact skill set.",
    tag: "SDE",
  },
  {
    title: "DATA\nSCIENCE",
    sub: "Data Engineering · Analytics · Big Data",
    desc: "Turn raw data into strategic insights. High-value roles for analytical minds and math prodigies.",
    tag: "DATA",
  },
  {
    title: "CYBER\nSECURITY",
    sub: "Ethical Hacking · Network Security · Cryptography",
    desc: "Defend the digital frontier. Specialized roles protecting the core infrastructure of global tech giants.",
    tag: "SEC",
  },
  {
    title: "CLOUD &\nDEVOPS",
    sub: "AWS · Azure · GCP · Kubernetes · CI/CD",
    desc: "Every company needs cloud infrastructure. High-demand, high-salary roles in the fastest-growing tech domain.",
    tag: "CLOUD",
  },
];

// ─── AI Features ───
const AI_FEATURES = [
  {
    title: "Resume AI",
    desc: "Instantly extract and structure your profile data from a single PDF upload.",
  },
  {
    title: "Skill Gap Analyser",
    desc: "Identify critical missing competencies customized to your targeted roles.",
  },
  {
    title: "AI Career Coach",
    desc: "24/7 intelligent mentorship guiding you through the placement process.",
  },
];

// ─── Main Landing Page ───
export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Simple fade-in on mount (no GSAP needed for this clean effect)
  useEffect(() => {
    const el = titleRef.current;
    if (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(60px)";
      setTimeout(() => {
        el.style.transition = "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 200);
    }
  }, []);

  return (
    <main className="relative min-h-screen">
      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#e6e4df]"
        style={{ zIndex: 1 }}
      >
        {/* Beige atmospheric glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212,207,200,0.06) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
          aria-hidden="true"
        />

        {/* Nav */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 px-12 py-6 flex items-center justify-between"
          style={{
            background: "transparent",
          }}
        >
          <span
            className="text-sm font-bold tracking-[0.15em] uppercase"
            style={{ color: "#0a0a0a" }}
          >
            HireMind
          </span>
          <div className="flex items-center gap-8">
            <span className="label-caps cursor-pointer hover:text-black transition-colors" onClick={() => document.getElementById("companies")?.scrollIntoView({ behavior: "smooth" })}>
              Companies
            </span>
            <span className="label-caps cursor-pointer hover:text-black transition-colors" onClick={() => document.getElementById("careers")?.scrollIntoView({ behavior: "smooth" })}>
              Careers
            </span>
            <Link href="/login">
              <span className="text-xs font-bold tracking-widest uppercase cursor-pointer hover:opacity-50 transition-opacity" style={{ color: "#0a0a0a" }}>
                Sign In
              </span>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container-site text-center relative z-10 pt-20">
          {/* Giant wordmark */}
          <h1
            ref={titleRef}
            className="display-xl mb-12"
            style={{ color: "#0a0a0a", fontWeight: "900", letterSpacing: "-0.05em" }}
          >
            HIRE
            <span style={{ color: "#0a0a0a" }}>MIND</span>
          </h1>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-8 mt-12">
            <div className="flex flex-col items-center gap-4">
              <a 
                href="/login"
                className="w-[240px] flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  border: "1px solid #000000",
                  borderRadius: "50px",
                  padding: "12px 28px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                  zIndex: 50
                }}
              >
                LOG IN TO PORTAL
              </a>
              <a 
                href="/register"
                className="w-[240px] flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "transparent",
                  color: "#000000",
                  border: "1px solid #000000",
                  borderRadius: "50px",
                  padding: "12px 28px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                  zIndex: 50
                }}
              >
                Create Account
              </a>
            </div>
            
            {/* Scroll hint now properly spaced below buttons */}
            <div className="flex flex-col items-center gap-2 mt-8 animate-bounce">
              <span className="label-caps" style={{ color: "rgba(10,10,10,0.6)" }}>Scroll to explore</span>
              <ChevronDown size={16} style={{ color: "rgba(10,10,10,0.6)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — CAREER PILLARS (Monolith-style editorial strips)
      ═══════════════════════════════════════════ */}
      <section id="careers" className="relative bg-[#e6e4df]" style={{ zIndex: 1 }}>
        <div className="container-site py-8">
          <div className="flex items-center justify-center gap-4 mb-16 opacity-60">
            <div className="h-px w-10 bg-black" />
            <span className="text-xs font-bold tracking-widest uppercase">Career Domains</span>
            <div className="h-px w-10 bg-black" />
          </div>
        </div>

        {CAREER_PILLARS.map((pillar, i) => {
          return (
            <div
              key={i}
              className="relative overflow-hidden border-t py-16"
              style={{
                borderColor: "rgba(10,10,10,0.1)",
              }}
            >
              {/* Content */}
              <div
                className={`container-site relative z-10 flex items-center ${i % 2 === 1 ? "justify-end" : ""}`}
              >
                <div className={`max-w-2xl ${i % 2 === 1 ? "text-right" : ""}`}>
                  {/* Tag */}
                  <span
                    className="label-caps inline-block mb-6 px-4 py-1.5 rounded-full"
                    style={{
                      border: "1px solid rgba(10,10,10,0.2)",
                      color: "#0a0a0a",
                    }}
                  >
                    {pillar.tag}
                  </span>

                  {/* Title */}
                  <h2
                    className="display-lg mb-4"
                    style={{
                      color: "#0a0a0a",
                      whiteSpace: "pre-line",
                      fontWeight: 900,
                    }}
                  >
                    {pillar.title}
                  </h2>

                  {/* Sub */}
                  <p className="label-caps mb-4" style={{ color: "rgba(10,10,10,0.6)" }}>
                    {pillar.sub}
                  </p>

                  {/* Desc */}
                  <p
                    className="text-base max-w-lg"
                    style={{ color: "rgba(10,10,10,0.8)", lineHeight: 1.8, fontWeight: 400 }}
                  >
                    {pillar.desc}
                  </p>

                  <div className={`mt-8 flex ${i % 2 === 1 ? "justify-end" : ""}`}>
                    <Link href="/register">
                      <button
                        className="flex items-center gap-2 text-sm font-bold"
                        style={{ color: "#0a0a0a" }}
                      >
                        Explore {pillar.tag} Roles
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Section number */}
              <div
                className="absolute top-1/2 -translate-y-1/2 z-0 font-bold"
                style={{
                  fontSize: "12vw",
                  color: "rgba(10,10,10,0.03)",
                  fontFamily: "Outfit, sans-serif",
                  lineHeight: 1,
                  userSelect: "none",
                  [i % 2 === 1 ? 'left' : 'right']: "-2vw",
                }}
              >
                0{i + 1}
              </div>
            </div>
          );
        })}
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — TOP MNC PARTNERS (Monolith Artist Grid)
      ═══════════════════════════════════════════ */}
      <section
        id="companies"
        className="relative py-32 bg-black text-white"
        style={{ zIndex: 1 }}
      >
        <div className="container-site">
          {/* Header */}
          <div className="flex items-end justify-between mb-20">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="monolith-line" style={{ background: "linear-gradient(to bottom, transparent, #ffffff, transparent)" }} />
                <span className="label-caps text-white">Hiring Partners</span>
              </div>
              <h2 className="display-md text-white">
                Top MNCs<br />
                <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>
                  recruiting from your campus
                </span>
              </h2>
            </div>
            <Link href="/login">
              <span className="text-xs font-bold tracking-widest uppercase cursor-pointer hover:opacity-50 transition-opacity flex items-center gap-2 text-white">
                VIEW ALL
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>

          {/* Grid — like Monolith's artist grid */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {COMPANIES.map((company, i) => (
              <div 
                key={i} 
                className="relative aspect-square bg-[#0a0a0a] overflow-hidden group border border-[#222] cursor-pointer"
                onClick={() => setSelectedCompany(company)}
              >
                {/* Top Left Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#f0f0f0] text-black text-[10px] font-bold px-2 py-1 tracking-widest uppercase shadow-sm">
                    {company.role}
                  </span>
                </div>

                {/* Image */}
                <img
                  src={company.image}
                  alt={company.name}
                  className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />

                {/* Bottom Info Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 z-0 pointer-events-none" />

                {/* Bottom Info */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {company.name}
                    </h3>
                    <ArrowRight size={14} className="text-white/30 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-white/60 text-xs" style={{ letterSpacing: "0.02em" }}>
                    {company.roles_offered}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════
          SECTION 5 — CTA (Login bottom centered)
      ═══════════════════════════════════════════ */}
      <section
        className="relative py-40 flex items-center justify-center overflow-hidden"
        style={{ zIndex: 1, borderTop: "1px solid rgba(10,10,10,0.1)" }}
      >
        <div className="container-site text-center relative z-10 w-full flex justify-center">
          <Link href="/login">
            <span className="text-xs font-bold tracking-widest uppercase cursor-pointer hover:opacity-50 transition-opacity flex items-center gap-2" style={{ color: "#0a0a0a" }}>
              LOG IN TO PORTAL
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MODAL
      ═══════════════════════════════════════════ */}
      {selectedCompany && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedCompany(null)}
        >
          <div 
            className="bg-[#0a0a0a]/70 backdrop-blur-2xl text-white max-w-lg w-full rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.05)] animate-fade-up"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255,255,255,0.02)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full transition-colors border border-white/10"
              onClick={() => setSelectedCompany(null)}
            >
              <X size={16} className="text-white" />
            </button>
            
            {/* Image Header */}
            <div className="h-48 relative overflow-hidden">
              <img 
                src={selectedCompany.image} 
                alt={selectedCompany.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent" />
              <h2 className="absolute bottom-4 left-6 text-3xl font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                {selectedCompany.name}
              </h2>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase border border-white/20">
                  {selectedCompany.role}
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed mb-6" style={{ letterSpacing: "0.01em" }}>
                {selectedCompany.blurb}
              </p>
              
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Key Roles</h4>
                <p className="text-sm font-medium text-white/90">
                  {selectedCompany.roles_offered}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
