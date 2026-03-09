"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import { useTheme } from "../ThemeContext";
import { Star } from "lucide-react";

interface TestimonialBubbleProps {
  id: string;
  text: string;
  author?: string;
  rating?: number;
  className?: string;
  rotate?: number;
  variant?: "bubble" | "card" | "minimal";
}

export default function TestimonialBubble({
  id,
  text,
  author,
  rating = 5,
  className = "",
  rotate = 0,
  variant = "bubble",
}: TestimonialBubbleProps) {
  const t = useTheme();

  if (variant === "bubble") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="relative max-w-[200px]">
          <div className="rounded-2xl rounded-bl-sm px-4 py-3 shadow-xl"
               style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-0.5 mb-1.5">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} size={8} fill={t.accentGold || '#F59E0B'} style={{ color: t.accentGold || '#F59E0B' }} />
              ))}
            </div>
            <p className="text-[10px] font-bold leading-relaxed" style={{ color: t.primary }} dir="rtl">{text}</p>
            {author && (
              <p className="text-[8px] font-black mt-1.5 opacity-40" style={{ color: t.primary }}>{author}</p>
            )}
          </div>
          {/* Tail */}
          <div className="absolute -bottom-2 left-3 w-4 h-4 rotate-45"
               style={{ backgroundColor: 'white' }} />
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "card") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="max-w-[200px] rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm"
             style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: `1px solid rgba(255,255,255,0.1)` }}>
          <div className="flex items-center gap-0.5 mb-1.5">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} size={8} fill={t.accentGold || '#F59E0B'} style={{ color: t.accentGold || '#F59E0B' }} />
            ))}
          </div>
          <p className="text-[10px] font-bold leading-relaxed text-white/90" dir="rtl">{text}</p>
          {author && (
            <p className="text-[8px] font-black mt-1.5 text-white/40">{author}</p>
          )}
        </div>
      </DraggableWrapper>
    );
  }

  // minimal
  return (
    <DraggableWrapper
      id={id}
      variant="card"
      className={`z-30 ${className}`}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <div className="max-w-[200px] border-r-2 pr-3" style={{ borderColor: t.accentGold || t.accent }}>
        <div className="flex items-center gap-0.5 mb-1">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} size={8} fill={t.accentGold || '#F59E0B'} style={{ color: t.accentGold || '#F59E0B' }} />
          ))}
        </div>
        <p className="text-[10px] font-bold leading-relaxed text-white/80" dir="rtl">{text}</p>
        {author && <p className="text-[8px] font-black mt-1 text-white/30">{author}</p>}
      </div>
    </DraggableWrapper>
  );
}
