import type { Metadata } from "next";
import "./globals.css";
import { GlassFilter } from "@/components/ui/liquid-glass";
import { BackgroundManager } from "@/components/ui/bg-manager";

export const metadata: Metadata = {
  title: "HireMind — AI-Powered Campus Placement System",
  description:
    "The intelligent campus placement platform that uses AI to parse your resume, analyse skill gaps, generate cover letters, and predict your placement probability.",
  keywords: "campus placement, AI resume, career coach, job placement, engineering college",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Global SVG Glass Distortion Filter */}
        <GlassFilter />
        {/* Grain overlay (fixed, always behind everything) */}
        <div className="grain-bg" aria-hidden="true" />
        <BackgroundManager />
        {children}
      </body>
    </html>
  );
}
