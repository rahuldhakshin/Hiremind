"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { href: "/student", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/student/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/student/applications", icon: FileText, label: "Applications" },
  { href: "/student/profile", icon: User, label: "Profile" },
  { href: "/student/ai-chat", icon: MessageSquare, label: "AI Coach" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#eae8e3", color: "#000000" }}>

      {/* ─── Sidebar — Zara style: pure white, stark border ─── */}
      <aside
        className="fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-400"
        style={{
          width: sidebarOpen ? "240px" : "64px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e0e0e0",
          overflow: "hidden",
        }}
      >
        {/* Logo row */}
        <div
          className="flex items-center gap-3 px-5"
          style={{
            height: "64px",
            borderBottom: "1px solid #e0e0e0",
            minHeight: "64px",
          }}
        >
          {sidebarOpen && (
            <span
              className="font-black tracking-widest uppercase text-sm"
              style={{ fontFamily: "Outfit, sans-serif", color: "#000000", whiteSpace: "nowrap" }}
            >
              HireMind
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto flex-shrink-0"
            style={{ color: "#000000", lineHeight: 0 }}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== "/student" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div
                  className="flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-200 group relative"
                  style={{
                    backgroundColor: isActive ? "#000000" : "transparent",
                    color: isActive ? "#ffffff" : "#000000",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f2f2f2";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent";
                  }}
                >
                  <Icon
                    size={16}
                    className="flex-shrink-0"
                    style={{ color: isActive ? "#ffffff" : "#000000" }}
                  />
                  {sidebarOpen && (
                    <span
                      className="text-xs font-semibold tracking-widest uppercase whitespace-nowrap"
                      style={{ color: isActive ? "#ffffff" : "#000000" }}
                    >
                      {label}
                    </span>
                  )}
                  {/* Tooltip when collapsed */}
                  {!sidebarOpen && (
                    <div
                      className="absolute left-16 z-50 px-3 py-2 text-xs font-semibold tracking-widest uppercase opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap"
                      style={{
                        backgroundColor: "#000000",
                        color: "#ffffff",
                      }}
                    >
                      {label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User info + logout — clean, no avatar */}
        <div style={{ borderTop: "1px solid #e0e0e0", flexShrink: 0 }}>
          {sidebarOpen && user && (
            <div className="px-5 py-3" style={{ borderBottom: "1px solid #e0e0e0" }}>
              <p
                className="text-xs font-bold uppercase tracking-widest truncate"
                style={{ color: "#000000", lineHeight: 1.4 }}
              >
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs truncate mt-0.5" style={{ color: "#888888" }}>
                {user.email}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3 w-full transition-colors duration-200"
            style={{ color: "#888888" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#000000"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
          >
            <LogOut size={13} />
            {sidebarOpen && (
              <span className="text-xs font-semibold tracking-widest uppercase">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main
        className="flex-1 min-h-screen transition-all duration-400"
        style={{
          marginLeft: sidebarOpen ? "240px" : "64px",
          backgroundColor: "#eae8e3",
        }}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 px-8 flex items-center justify-between"
          style={{
            height: "64px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#000000" }}
          >
            Student Portal
          </p>
          {user && (
            <div
              className="w-8 h-8 flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
              }}
            >
              {user.first_name?.[0]?.toUpperCase() || "S"}
            </div>
          )}
        </header>

        <div className="page-banner">
          <img src="/banner-student.jpeg" alt="Student Portal Banner" />
          <div className="page-banner-overlay">
            <span className="banner-text">Student Portal</span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-10">{children}</div>
      </main>
    </div>
  );
}
