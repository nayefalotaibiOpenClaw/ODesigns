"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import { useTheme } from "../ThemeContext";

interface PriceBadgeProps {
  id: string;
  price: string;
  currency?: string;
  label?: string;
  oldPrice?: string;
  className?: string;
  rotate?: number;
  variant?: "circle" | "tag" | "ribbon" | "sticker";
}

export default function PriceBadge({
  id,
  price,
  currency = "KD",
  label,
  oldPrice,
  className = "",
  rotate = 0,
  variant = "circle",
}: PriceBadgeProps) {
  const t = useTheme();

  if (variant === "circle") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-full blur-md opacity-30"
               style={{ backgroundColor: t.accent }} />
          <div className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-2xl"
               style={{ backgroundColor: t.accent }}>
            {oldPrice && (
              <span className="text-[9px] font-bold line-through text-white/50">{oldPrice}</span>
            )}
            <span className="text-xl font-black text-white leading-none">{price}</span>
            <span className="text-[8px] font-bold text-white/70 uppercase">{currency}</span>
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "tag") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="flex items-center shadow-xl rounded-xl overflow-hidden">
          <div className="px-3 py-2 flex flex-col items-center"
               style={{ backgroundColor: t.accent }}>
            <span className="text-lg font-black text-white leading-none">{price}</span>
            <span className="text-[7px] font-bold text-white/70 uppercase">{currency}</span>
          </div>
          {label && (
            <div className="px-3 py-2" style={{ backgroundColor: t.primaryLight }}>
              <span className="text-[9px] font-black" style={{ color: t.primary }}>{label}</span>
            </div>
          )}
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "ribbon") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="relative">
          <div className="px-5 py-2.5 shadow-xl flex items-center gap-2"
               style={{ backgroundColor: t.accent, clipPath: 'polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)' }}>
            {oldPrice && (
              <span className="text-xs font-bold line-through text-white/40">{oldPrice}</span>
            )}
            <span className="text-lg font-black text-white">{price}</span>
            <span className="text-[8px] font-bold text-white/70 uppercase">{currency}</span>
          </div>
        </div>
      </DraggableWrapper>
    );
  }

  // sticker
  return (
    <DraggableWrapper
      id={id}
      variant="card"
      className={`z-30 ${className}`}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <div className="relative">
        <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-dashed"
             style={{ backgroundColor: t.primaryLight, borderColor: t.accent }}>
          {label && <span className="text-[8px] font-black uppercase" style={{ color: t.accent }}>{label}</span>}
          <span className="text-2xl font-black leading-none" style={{ color: t.primary }}>{price}</span>
          <span className="text-[9px] font-bold" style={{ color: t.accent }}>{currency}</span>
          {oldPrice && (
            <span className="text-[9px] font-bold line-through" style={{ color: t.primary + '40' }}>{oldPrice}</span>
          )}
        </div>
      </div>
    </DraggableWrapper>
  );
}
