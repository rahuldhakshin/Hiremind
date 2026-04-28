"use client";
import React from "react";

type BannerVariant = "officer" | "student" | "recruiter" | "admin";

interface PortalBannerProps {
  variant: BannerVariant;
  title: string;
}

/* ─────────────────────────────────────────────
   OFFICER — Architectural blueprint grid
   Charcoal + fine grid lines
───────────────────────────────────────────── */
const OfficerBanner = () => (
  <svg viewBox="0 0 1440 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id="og1" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1a1a1a" />
        <stop offset="60%" stopColor="#252525" />
        <stop offset="100%" stopColor="#1d1c1a" />
      </linearGradient>
      <pattern id="ogrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      </pattern>
      <pattern id="osmallgrid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
      </pattern>
    </defs>
    {/* Base */}
    <rect width="1440" height="160" fill="url(#og1)" />
    {/* Fine grid */}
    <rect width="1440" height="160" fill="url(#osmallgrid)" />
    {/* Major grid */}
    <rect width="1440" height="160" fill="url(#ogrid)" />
    {/* Accent lines — architectural drawing style */}
    <line x1="0" y1="40" x2="1440" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    <line x1="0" y1="80" x2="1440" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    <line x1="0" y1="120" x2="1440" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    <line x1="360" y1="0" x2="360" y2="160" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
    <line x1="720" y1="0" x2="720" y2="160" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
    <line x1="1080" y1="0" x2="1080" y2="160" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
    {/* Corner marks — blueprint callout */}
    <rect x="40" y="20" width="60" height="1" fill="rgba(255,255,255,0.25)" />
    <rect x="40" y="20" width="1" height="40" fill="rgba(255,255,255,0.25)" />
    <rect x="1340" y="20" width="60" height="1" fill="rgba(255,255,255,0.25)" />
    <rect x="1399" y="20" width="1" height="40" fill="rgba(255,255,255,0.25)" />
    {/* Measurement tick marks */}
    {Array.from({ length: 36 }).map((_, i) => (
      <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="6" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    ))}
    {/* Bottom gradient fade */}
    <defs>
      <linearGradient id="ofade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
      </linearGradient>
    </defs>
    <rect width="1440" height="160" fill="url(#ofade)" />
  </svg>
);

/* ─────────────────────────────────────────────
   STUDENT — Diagonal notebook lines
   Warm dark gradient + hatching pattern
───────────────────────────────────────────── */
const StudentBanner = () => (
  <svg viewBox="0 0 1440 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1c1a17" />
        <stop offset="50%" stopColor="#252219" />
        <stop offset="100%" stopColor="#1a1a1a" />
      </linearGradient>
      <pattern id="shatch" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
        <line x1="0" y1="0" x2="0" y2="24" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      </pattern>
      <pattern id="shatch2" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
      </pattern>
      <linearGradient id="sfade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
      </linearGradient>
    </defs>
    <rect width="1440" height="160" fill="url(#sg1)" />
    <rect width="1440" height="160" fill="url(#shatch2)" />
    <rect width="1440" height="160" fill="url(#shatch)" />
    {/* Horizontal academic lines — like ruled paper */}
    {[28, 56, 84, 112, 140].map((y) => (
      <line key={y} x1="0" y1={y} x2="1440" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />
    ))}
    {/* Vertical margin line */}
    <line x1="80" y1="0" x2="80" y2="160" stroke="rgba(255,200,100,0.12)" strokeWidth="1" />
    {/* Dot accents — graduation motif */}
    {[200, 400, 600, 800, 1000, 1200].map((x) => (
      <circle key={x} cx={x} cy={30} r="1.5" fill="rgba(255,255,255,0.2)" />
    ))}
    {/* Subtle arc — cap/achievement motif */}
    <path d="M 580 200 Q 720 -20 860 200" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <rect width="1440" height="160" fill="url(#sfade)" />
  </svg>
);

/* ─────────────────────────────────────────────
   RECRUITER — Corporate pinstripe
   Deep navy-black + vertical stripes
───────────────────────────────────────────── */
const RecruiterBanner = () => (
  <svg viewBox="0 0 1440 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id="rg1" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#141418" />
        <stop offset="50%" stopColor="#1a1a22" />
        <stop offset="100%" stopColor="#141416" />
      </linearGradient>
      <pattern id="rstripe" x="0" y="0" width="18" height="1" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="1" height="1" fill="rgba(255,255,255,0.035)" />
      </pattern>
      <linearGradient id="rfade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
      </linearGradient>
      <linearGradient id="rside" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
        <stop offset="20%" stopColor="transparent" />
        <stop offset="80%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
      </linearGradient>
    </defs>
    <rect width="1440" height="160" fill="url(#rg1)" />
    {/* Pinstripes */}
    <rect width="1440" height="160" fill="url(#rstripe)" />
    {/* Horizontal accent lines */}
    <line x1="0" y1="1" x2="1440" y2="1" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    <line x1="0" y1="159" x2="1440" y2="159" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    {/* Center divider accent */}
    <line x1="720" y1="0" x2="720" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
    {/* Diamond shape — corporate insignia */}
    <polygon points="720,60 730,80 720,100 710,80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.75" />
    <polygon points="720,50 740,80 720,110 700,80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.75" />
    {/* Horizontal bands */}
    <rect x="0" y="74" width="1440" height="1" fill="rgba(255,255,255,0.07)" />
    <rect x="0" y="86" width="1440" height="1" fill="rgba(255,255,255,0.04)" />
    {/* Side vignettes */}
    <rect width="1440" height="160" fill="url(#rside)" />
    <rect width="1440" height="160" fill="url(#rfade)" />
  </svg>
);

/* ─────────────────────────────────────────────
   ADMIN — Circuit board nodes
   Stark black + circuit trace pattern
───────────────────────────────────────────── */
const AdminBanner = () => (
  <svg viewBox="0 0 1440 160" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id="ag1" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#0e0e0e" />
        <stop offset="40%" stopColor="#141414" />
        <stop offset="100%" stopColor="#0f0f0f" />
      </linearGradient>
      <linearGradient id="afade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
      </linearGradient>
    </defs>
    <rect width="1440" height="160" fill="url(#ag1)" />
    {/* Circuit traces — horizontal */}
    <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    <line x1="200" y1="40" x2="200" y2="80" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    <line x1="200" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    <line x1="480" y1="80" x2="480" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    <line x1="480" y1="40" x2="760" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    <line x1="760" y1="40" x2="760" y2="120" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    <line x1="760" y1="120" x2="1060" y2="120" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    <line x1="1060" y1="120" x2="1060" y2="60" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    <line x1="1060" y1="60" x2="1440" y2="60" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    {/* Secondary traces */}
    <line x1="0" y1="100" x2="120" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <line x1="120" y1="100" x2="120" y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
    <line x1="320" y1="0" x2="320" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <line x1="320" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <line x1="900" y1="0" x2="900" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <line x1="900" y1="80" x2="1200" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    <line x1="1200" y1="80" x2="1200" y2="160" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    {/* Node circles */}
    {[
      [200, 40], [480, 40], [200, 80], [480, 80], [760, 40],
      [760, 120], [1060, 60], [1060, 120], [120, 100], [120, 40],
      [320, 120], [900, 80], [1200, 80]
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="3" fill="rgba(255,255,255,0.18)" />
    ))}
    {/* Node halos */}
    {[[200, 40], [480, 80], [760, 40], [1060, 60]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="6" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    ))}
    {/* Dot matrix background */}
    {Array.from({ length: 18 }).map((_, row) =>
      Array.from({ length: 72 }).map((_, col) => (
        <circle key={`${row}-${col}`} cx={col * 20 + 10} cy={row * 10 + 5}
          r="0.6" fill={`rgba(255,255,255,${0.02 + Math.sin(col * row) * 0.01})`} />
      ))
    )}
    <rect width="1440" height="160" fill="url(#afade)" />
  </svg>
);

const BANNER_MAP: Record<BannerVariant, React.FC> = {
  officer: OfficerBanner,
  student: StudentBanner,
  recruiter: RecruiterBanner,
  admin: AdminBanner,
};

export function PortalBanner({ variant, title }: PortalBannerProps) {
  const BannerSVG = BANNER_MAP[variant];

  return (
    <div
      style={{
        width: "100%",
        height: "160px",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <BannerSVG />
      {/* Text overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-end",
          padding: "22px 40px",
          zIndex: 2,
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: "26px",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            textShadow: "0 1px 12px rgba(0,0,0,0.8)",
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
}
