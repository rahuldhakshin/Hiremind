"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GlassCard, GlassButton, GlassInput, GlassSelect } from "@/components/ui/liquid-glass";
import { useAuthStore, getRoleRedirect, type UserRole } from "@/store/authStore";
import { authAPI } from "@/lib/api";

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "recruiter", label: "Recruiter" },
  { value: "placement_officer", label: "Placement Officer" },
  { value: "admin", label: "Admin" },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await authAPI.login(email, password, role);
      login(data.user, data.tokens?.access || data.access, data.tokens?.refresh || data.refresh);
      router.push(getRoleRedirect(data.user.role));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#eae8e3" }}>
      {/* Left — Chanel banner image */}
      <div
        className="hidden lg:flex flex-col justify-end"
        style={{
          width: "45%",
          position: "relative",
          backgroundImage: "url('/bg2.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        {/* Dark overlay for readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
            zIndex: 0,
          }}
        />
        {/* Only JOBQUENCH wordmark */}
        <div style={{ position: "relative", zIndex: 1, padding: "48px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1
              className="font-black"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "clamp(48px, 6vw, 80px)",
                lineHeight: 0.88,
                letterSpacing: "-0.04em",
                color: "#ffffff",
              }}
            >
              HIRE
              <br />
              MIND
            </h1>
          </Link>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-12" style={{ backgroundColor: "#eae8e3" }}>
        <div className="w-full" style={{ maxWidth: "360px" }}>
          {/* Back to site */}
          <div className="mb-10 lg:text-left">
            <Link href="/">
              <span className="text-xs font-bold tracking-[0.25em] uppercase cursor-pointer" style={{ color: "#888888" }}>
                ← Back to site
              </span>
            </Link>
          </div>

          <p className="label-caps mb-2" style={{ color: "#888888" }}>Welcome back</p>
          <h2
            className="font-black mb-8"
            style={{ fontFamily: "Outfit, sans-serif", fontSize: "36px", color: "#000000", letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="label-caps" style={{ color: "#000000", fontWeight: 700 }}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="glass-input !pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="label-caps" style={{ color: "#000000", fontWeight: 700 }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input !pl-11 !pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#888888" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <label className="label-caps" style={{ color: "#000000", fontWeight: 700 }}>Sign in as</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="glass-input appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                  color: "#000000",
                  backgroundColor: "#ffffff",
                }}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ backgroundColor: "#ffffff", color: "#000000" }}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm px-4 py-3" style={{ border: "1px solid #cc0000", color: "#cc0000" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <GlassButton type="submit" variant="primary" fullWidth disabled={loading} className="mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in
                </span>
              ) : (
                "Sign In"
              )}
            </GlassButton>
          </form>

          <div className="mt-7 pt-5" style={{ borderTop: "1px solid #e0e0e0" }}>
            <p className="text-xs" style={{ color: "#888888" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold" style={{ color: "#000000", textDecoration: "underline" }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
