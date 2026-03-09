"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import { useTheme } from "../ThemeContext";

interface ProductLabelProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  rotate?: number;
  variant?: "elegant" | "bold" | "minimal" | "banner";
}

export default function ProductLabel({
  id,
  title,
  subtitle,
  badge,
  className = "",
  rotate = 0,
  variant = "elegant",
}: ProductLabelProps) {
  const t = useTheme();

  if (variant === "elegant") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-2xl opacity-20 blur-sm"
               style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accentGold || t.accentLime})` }} />
          <div className="relative rounded-2xl px-5 py-3 shadow-xl backdrop-blur-sm"
               style={{ backgroundColor: 'rgba(255,255,255,0.95)', border: `1px solid ${t.accent}15` }}>
            {badge && (
              <span className="text-[7px] font-black uppercase tracking-[0.2em] block mb-1"
                    style={{ color: t.accent }}>{badge}</span>
            )}
            <span className="text-base font-black block" style={{ color: t.primary }}>{title}</span>
            {subtitle && (
              <span className="text-[10px] font-bold block mt-0.5" style={{ color: t.primary + '50' }}>{subtitle}</span>
            )}
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "bold") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="rounded-2xl px-5 py-3 shadow-2xl"
             style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.primary})` }}>
          {badge && (
            <span className="text-[7px] font-black uppercase tracking-[0.2em] block mb-1 text-white/60">{badge}</span>
          )}
          <span className="text-base font-black text-white block">{title}</span>
          {subtitle && (
            <span className="text-[10px] font-bold text-white/60 block mt-0.5">{subtitle}</span>
          )}
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "minimal") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="border-r-2 pr-3" style={{ borderColor: t.accent }}>
          {badge && (
            <span className="text-[7px] font-black uppercase tracking-[0.2em] block mb-0.5"
                  style={{ color: t.accent }}>{badge}</span>
          )}
          <span className="text-sm font-black text-white block">{title}</span>
          {subtitle && (
            <span className="text-[9px] font-bold text-white/40 block">{subtitle}</span>
          )}
        </div>
      </DraggableWrapper>
    );
  }

  // banner
  return (
    <DraggableWrapper
      id={id}
      variant="card"
      className={`z-30 ${className}`}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <div className="flex items-stretch rounded-xl overflow-hidden shadow-xl">
        <div className="w-1.5" style={{ backgroundColor: t.accent }} />
        <div className="px-4 py-2.5" style={{ backgroundColor: t.primaryLight }}>
          {badge && (
            <span className="text-[7px] font-black uppercase tracking-[0.2em] block mb-0.5"
                  style={{ color: t.accent }}>{badge}</span>
          )}
          <span className="text-sm font-black block" style={{ color: t.primary }}>{title}</span>
          {subtitle && (
            <span className="text-[9px] font-bold block" style={{ color: t.primary + '50' }}>{subtitle}</span>
          )}
        </div>
      </div>
    </DraggableWrapper>
  );
}
