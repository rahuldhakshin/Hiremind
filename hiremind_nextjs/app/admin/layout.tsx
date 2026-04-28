"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Shield, LogOut, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/system", icon: Shield, label: "System" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#eae8e3", color: "#000000" }}>
      <aside className="glass-panel fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-500" style={{ width: sidebarOpen ? "260px" : "72px", backgroundColor: "#ffffff", borderRight: "1px solid #e0e0e0" }}>
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: "1px solid #e0e0e0", minHeight: "72px" }}>
          {sidebarOpen && <span className="font-black text-sm tracking-widest uppercase" style={{ fontFamily: "Outfit, sans-serif", color: "#000000" }}>Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto p-1" style={{ color: "#000000" }}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-200"
                  style={{ backgroundColor: isActive ? "#000000" : "transparent" }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f2f2f2"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent"; }}
                >
                  <Icon size={16} className="flex-shrink-0" style={{ color: isActive ? "#ffffff" : "#000000" }} />
                  {sidebarOpen && <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: isActive ? "#ffffff" : "#000000" }}>{label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-3" style={{ borderTop: "1px solid #e0e0e0" }}>
          <button onClick={() => { logout(); router.push("/login"); }} className="flex items-center gap-3 px-3 py-3 w-full transition-colors duration-200" style={{ color: "#888888" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#000000"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#888888"; }}
          >
            <LogOut size={16} style={{ color: "inherit" }} />
            {sidebarOpen && <span className="text-xs font-semibold tracking-widest uppercase">Sign Out</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 min-h-screen transition-all duration-500" style={{ marginLeft: sidebarOpen ? "260px" : "72px", backgroundColor: "#eae8e3" }}>
        <header className="sticky top-0 z-30 px-8 flex items-center" style={{ height: "64px", backgroundColor: "#ffffff", borderBottom: "1px solid #e0e0e0" }}>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#000000" }}>Admin Control Panel</p>
        </header>
        <div className="page-banner">
          <img src="/banner-admin.jpeg" alt="Admin Portal Banner" />
          <div className="page-banner-overlay">
            <span className="banner-text">Admin Panel</span>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
