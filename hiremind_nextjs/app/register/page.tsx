"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, Sparkles, Building2 } from "lucide-react";
import { GlassCard, GlassButton } from "@/components/ui/liquid-glass";
import { useAuthStore, getRoleRedirect, type UserRole } from "@/store/authStore";
import { authAPI } from "@/lib/api";

const ROLE_OPTIONS = [
  { value: "student", label: "Student", desc: "Browse jobs and apply" },
  { value: "recruiter", label: "Recruiter", desc: "Post jobs and hire" },
  { value: "placement_officer", label: "Placement Officer", desc: "Manage college placements" },
  { value: "admin", label: "Admin", desc: "System administration" },
];

const DEPARTMENTS = [
  "Computer Science Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
];

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>("student");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    department: "",
    college: "",
    company_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = { 
        ...form, 
        role,
        username: form.email,
        password2: form.confirm_password
      };
      const { data } = await authAPI.register(payload);
      login(data.user, data.tokens?.access || data.access, data.tokens?.refresh || data.refresh);
      router.push(getRoleRedirect(data.user.role));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const msgs = axiosErr?.response?.data;
      if (msgs) {
        const first = Object.values(msgs)[0];
        setError(Array.isArray(first) ? first[0] : "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-10"
      style={{ backgroundColor: "#eae8e3" }}
    >
      {/* Glow removed for Monolith standard */}

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/">
            <span className="text-xs font-bold tracking-[0.25em] uppercase cursor-pointer" style={{ color: "#888888" }}>
              ← Back to site
            </span>
          </Link>
          <div className="flex items-center justify-center gap-3 mt-6 mb-2">
            <div className="monolith-line" />
            <div className="monolith-line" />
          </div>
          <h1
            className="text-5xl font-black tracking-[-0.03em] mt-4 mb-2"
            style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}
          >
            JOIN US
          </h1>
          <p className="text-sm" style={{ color: "#888888" }}>
            Create your HireMind account
          </p>
        </div>

        {/* Step 1 — Choose role */}
        {step === 1 && (
          <div>
            <p className="label-caps text-center mb-6" style={{ color: "#666666" }}>
              I am a...
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {ROLE_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setRole(opt.value as UserRole)}
                  className="glass-card p-5 cursor-pointer transition-all duration-300"
                  style={{
                    background: role === opt.value ? "rgba(200,184,154,0.1)" : "rgba(255,255,255,0.8)",
                    borderColor: role === opt.value ? "rgba(200,184,154,0.35)" : "#e0e0e0",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: "#000000",
                        background: role === opt.value ? "#000000" : "transparent",
                      }}
                    >
                      {role === opt.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#e2dfd8]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#000000" }}>
                        {opt.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <GlassButton variant="primary" fullWidth onClick={() => setStep(2)} className="text-sm tracking-widest uppercase">
              Continue →
            </GlassButton>
          </div>
        )}

        {/* Step 2 — Fill details */}
        {step === 2 && (
          <GlassCard className="p-8" hover={false}>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="label-caps" style={{ color: "#666666" }}>First Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
                    <input
                      className="glass-input text-sm"
                      style={{ paddingLeft: "44px" }}
                      placeholder="John"
                      value={form.first_name}
                      onChange={(e) => update("first_name", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="label-caps" style={{ color: "#666666" }}>Last Name</label>
                  <input
                    className="glass-input text-sm"
                    placeholder="Doe"
                    value={form.last_name}
                    onChange={(e) => update("last_name", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="label-caps" style={{ color: "#666666" }}>Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
                  <input
                    type="email"
                    className="glass-input text-sm"
                    style={{ paddingLeft: "44px" }}
                    placeholder="you@college.edu"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              {role === "student" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="label-caps" style={{ color: "#666666" }}>College Name</label>
                    <div className="relative">
                      <GraduationCap size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
                      <input
                        className="glass-input text-sm"
                        style={{ paddingLeft: "44px" }}
                        placeholder="XYZ Engineering College"
                        value={form.college}
                        onChange={(e) => update("college", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="label-caps" style={{ color: "#666666" }}>Department</label>
                    <select
                      className="glass-input text-sm appearance-none"
                      value={form.department}
                      onChange={(e) => update("department", e.target.value)}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239e9a95' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 16px center",
                      }}
                    >
                      <option value="" className="bg-[#e2dfd8]">Select Department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d} className="bg-[#e2dfd8]">{d}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {role === "recruiter" && (
                <div className="flex flex-col gap-2">
                  <label className="label-caps" style={{ color: "#666666" }}>Company Name</label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
                    <input
                      className="glass-input text-sm"
                      style={{ paddingLeft: "44px" }}
                      placeholder="Google, Amazon, Infosys..."
                      value={form.company_name}
                      onChange={(e) => update("company_name", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="label-caps" style={{ color: "#666666" }}>Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="glass-input text-sm"
                    style={{ paddingLeft: "44px", paddingRight: "44px" }}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label-caps" style={{ color: "#666666" }}>Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
                  <input
                    type="password"
                    className="glass-input text-sm"
                    style={{ paddingLeft: "44px" }}
                    placeholder="Repeat password"
                    value={form.confirm_password}
                    onChange={(e) => update("confirm_password", e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm px-4 py-3 rounded-xl" style={{ background: "rgba(229,115,115,0.1)", border: "1px solid rgba(229,115,115,0.2)", color: "#cc0000" }}>
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)} className="glass-btn text-sm px-6 py-3" style={{ color: "#666666" }}>
                  ← Back
                </button>
                <GlassButton type="submit" variant="primary" fullWidth disabled={loading} className="text-sm tracking-widest uppercase">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : "Create Account"}
                </GlassButton>
              </div>
            </form>

            <div className="divider my-5" />
            <p className="text-center text-sm" style={{ color: "#888888" }}>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold" style={{ color: "#000000" }}>
                Sign in
              </Link>
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
