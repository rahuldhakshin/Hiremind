"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ─── SVG Filter — removed (Zara aesthetic is clean) ───
export const GlassFilter: React.FC = () => null;

// ─── Types ───
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

// ─── Glass Card — Zara: white paper, thin border, zero radius ───
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  style,
  onClick,
  hover = true,
}) => {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: 0,
        transition: "border-color 0.2s ease",
        ...(hover ? { cursor: "pointer" } : {}),
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover) (e.currentTarget as HTMLDivElement).style.borderColor = "#000000";
      }}
      onMouseLeave={(e) => {
        if (hover) (e.currentTarget as HTMLDivElement).style.borderColor = "#e0e0e0";
      }}
    >
      <div className="relative">{children}</div>
    </div>
  );
};

// ─── Glass Button — Zara: stark black pill ───
export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  className,
  variant = "default",
  disabled = false,
  type = "button",
  fullWidth = false,
}) => {
  const isDanger = variant === "danger";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(fullWidth && "w-full", disabled && "opacity-40 cursor-not-allowed", className)}
      style={{
        backgroundColor: isDanger ? "transparent" : "#000000",
        color: isDanger ? "#cc0000" : "#ffffff",
        border: isDanger ? "1px solid #cc0000" : "1px solid #000000",
        borderRadius: "50px",
        padding: "12px 28px",
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase" as const,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isDanger) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#333333";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isDanger) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#000000";
        }
      }}
    >
      {children}
    </button>
  );
};

// ─── Glass Input ───
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  icon,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          className="label-caps"
          style={{ color: "#000000", fontWeight: 600 }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#888888" }}>
            {icon}
          </div>
        )}
        <input
          className={cn("glass-input", icon && "!pl-12", error && "border-[#cc0000]", className)}
          {...props}
        />
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#cc0000" }}>{error}</p>}
    </div>
  );
};

// ─── Glass Select ───
interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  label,
  options,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="label-caps" style={{ color: "#000000", fontWeight: 600 }}>
          {label}
        </label>
      )}
      <select
        className={cn("glass-input appearance-none cursor-pointer", error && "border-[#cc0000]", className)}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 16px center",
          backgroundColor: "#ffffff",
          color: "#000000",
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ backgroundColor: "#ffffff", color: "#000000" }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs" style={{ color: "#cc0000" }}>{error}</p>}
    </div>
  );
};

// ─── Glass Badge — Zara: minimal outlined tag ───
interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "accent";
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = "accent",
  className,
}) => {
  const colors: Record<string, { border: string; color: string }> = {
    accent:   { border: "#000000", color: "#000000" },
    success:  { border: "#006600", color: "#006600" },
    warning:  { border: "#cc6600", color: "#cc6600" },
    danger:   { border: "#cc0000", color: "#cc0000" },
    info:     { border: "#003399", color: "#003399" },
  };
  const c = colors[variant] || colors.accent;

  return (
    <span
      className={cn(className)}
      style={{
        display: "inline-block",
        border: `1px solid ${c.border}`,
        color: c.color,
        backgroundColor: "transparent",
        padding: "3px 10px",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {children}
    </span>
  );
};

// ─── Stat Card — Zara: clean white block with stark number ───
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendPositive,
}) => {
  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div style={{ color: "#000000", opacity: 0.5 }}>
            {icon}
          </div>
        )}
        {trend && (
          <span
            className="text-xs font-semibold"
            style={{ color: trendPositive ? "#006600" : "#cc0000" }}
          >
            {trend}
          </span>
        )}
      </div>
      <p
        className="text-4xl font-black mb-1"
        style={{ fontFamily: "Outfit, sans-serif", color: "#000000", letterSpacing: "-0.02em" }}
      >
        {value}
      </p>
      <p className="label-caps" style={{ color: "#888888" }}>{label}</p>
    </GlassCard>
  );
};

// ─── Glass Dock ───
interface DockIcon {
  src: string;
  alt: string;
  onClick?: () => void;
  label?: string;
}

export const GlassDock: React.FC<{ icons: DockIcon[] }> = ({ icons }) => (
  <div className="flex items-center justify-center gap-2 p-3" style={{ border: "1px solid #e0e0e0" }}>
    {icons.map((icon, index) => (
      <button
        key={index}
        onClick={icon.onClick}
        className="group relative flex flex-col items-center gap-1"
        title={icon.label || icon.alt}
      >
        <img
          src={icon.src}
          alt={icon.alt}
          className="w-12 h-12 transition-all duration-300 group-hover:scale-110"
        />
        <span className="absolute -bottom-6 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap" style={{ color: "#000000" }}>
          {icon.label || icon.alt}
        </span>
      </button>
    ))}
  </div>
);
