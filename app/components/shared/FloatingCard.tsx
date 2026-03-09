"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import { useTheme } from "../ThemeContext";

interface FloatingCardProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  rotate?: number;
  animation?: string;
  borderColor?: string;
  /** Visual variant */
  variant?: "default" | "glass" | "pill" | "glow" | "dark" | "outline" | "gradient";
}

export default function FloatingCard({
  id,
  icon,
  label,
  value,
  className = "",
  rotate = 0,
  animation = "",
  borderColor,
  variant = "default",
}: FloatingCardProps) {
  const t = useTheme();

  if (variant === "glass") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${animation} ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl border"
             style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.15)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-sm"
               style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
            {icon}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/50">{label}</span>
            <span className="text-sm font-black text-white">{value}</span>
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "pill") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${animation} ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="flex items-center gap-2 rounded-full px-2 py-1.5 shadow-xl"
             style={{ backgroundColor: t.primaryLight }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
               style={{ backgroundColor: borderColor || t.accent, color: 'white' }}>
            {icon}
          </div>
          <div className="pr-2 flex flex-col leading-none">
            <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: t.primary + '60' }}>{label}</span>
            <span className="text-xs font-black" style={{ color: t.primary }}>{value}</span>
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "glow") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${animation} ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl blur-md opacity-40"
               style={{ backgroundColor: borderColor || t.accent }} />
          <div className="relative rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl"
               style={{ backgroundColor: t.primaryDark, border: `1px solid ${(borderColor || t.accent)}40` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: (borderColor || t.accent) + '25', color: borderColor || t.accentLime }}>
              {icon}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">{label}</span>
              <span className="text-sm font-black text-white">{value}</span>
            </div>
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "dark") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${animation} ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl"
             style={{ backgroundColor: t.primary }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: t.accent, color: 'white' }}>
            {icon}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: t.primaryLight + '50' }}>{label}</span>
            <span className="text-sm font-black" style={{ color: t.primaryLight }}>{value}</span>
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "outline") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${animation} ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 border-2"
             style={{ borderColor: borderColor || t.accent, backgroundColor: 'transparent' }}>
          <div style={{ color: borderColor || t.accent }}>
            {icon}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">{label}</span>
            <span className="text-sm font-black text-white">{value}</span>
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "gradient") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${animation} ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl text-white"
             style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.primary})` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {icon}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/60">{label}</span>
            <span className="text-sm font-black">{value}</span>
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  // Default
  return (
    <DraggableWrapper
      id={id}
      variant="card"
      className={`p-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 z-30 ${animation} ${className}`}
      style={{
        backgroundColor: t.primaryLight,
        borderColor: borderColor || t.accentLime,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: t.primary, color: t.accentLime }}
      >
        {icon}
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[8px] text-gray-500 font-bold uppercase mb-1">{label}</span>
        <span className="text-sm font-black" style={{ color: t.primary }}>{value}</span>
      </div>
    </DraggableWrapper>
  );
}
