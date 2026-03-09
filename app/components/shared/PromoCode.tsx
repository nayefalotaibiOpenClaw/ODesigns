"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import { useTheme } from "../ThemeContext";
import { Scissors, Copy } from "lucide-react";

interface PromoCodeProps {
  id: string;
  code: string;
  discount?: string;
  description?: string;
  className?: string;
  rotate?: number;
  variant?: "coupon" | "badge" | "banner";
}

export default function PromoCode({
  id,
  code,
  discount,
  description,
  className = "",
  rotate = 0,
  variant = "coupon",
}: PromoCodeProps) {
  const t = useTheme();

  if (variant === "coupon") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="flex items-stretch rounded-xl overflow-hidden shadow-xl">
          {/* Left section - discount */}
          <div className="px-4 py-3 flex flex-col items-center justify-center"
               style={{ backgroundColor: t.accent }}>
            {discount && <span className="text-xl font-black text-white leading-none">{discount}</span>}
            <Scissors size={12} className="text-white/50 mt-1" />
          </div>
          {/* Right section - code */}
          <div className="px-4 py-3 flex flex-col justify-center relative"
               style={{ backgroundColor: t.primaryLight }}>
            {/* Dotted line separator */}
            <div className="absolute left-0 top-2 bottom-2 border-l-2 border-dashed" style={{ borderColor: t.primary + '15' }} />
            <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: t.primary + '50' }}>USE CODE</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-widest" style={{ color: t.primary }}>{code}</span>
              <Copy size={10} style={{ color: t.primary + '30' }} />
            </div>
            {description && (
              <span className="text-[8px] font-bold mt-0.5" style={{ color: t.primary + '40' }}>{description}</span>
            )}
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "badge") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="rounded-xl px-4 py-2.5 shadow-xl text-center"
             style={{ backgroundColor: t.primaryDark, border: `2px dashed ${t.accent}60` }}>
          {discount && (
            <span className="text-lg font-black block leading-none" style={{ color: t.accentLime }}>{discount}</span>
          )}
          <div className="flex items-center justify-center gap-1.5 mt-1 px-2 py-0.5 rounded-md"
               style={{ backgroundColor: t.accent + '20' }}>
            <span className="text-[10px] font-black tracking-[0.15em] text-white">{code}</span>
          </div>
          {description && (
            <span className="text-[8px] font-bold text-white/30 block mt-1">{description}</span>
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
      <div className="rounded-xl shadow-xl overflow-hidden"
           style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.primary})` }}>
        <div className="px-5 py-3 flex items-center gap-4">
          {discount && (
            <span className="text-2xl font-black text-white leading-none">{discount}</span>
          )}
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/50">PROMO CODE</span>
            <span className="text-sm font-black tracking-[0.15em] text-white">{code}</span>
            {description && <span className="text-[8px] font-bold text-white/40">{description}</span>}
          </div>
        </div>
      </div>
    </DraggableWrapper>
  );
}
