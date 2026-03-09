"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import { useTheme } from "../ThemeContext";
import { Star } from "lucide-react";

interface RatingStarsProps {
  id: string;
  rating?: number;
  reviews?: string;
  className?: string;
  rotate?: number;
  variant?: "compact" | "card" | "minimal";
}

export default function RatingStars({
  id,
  rating = 4.9,
  reviews,
  className = "",
  rotate = 0,
  variant = "compact",
}: RatingStarsProps) {
  const t = useTheme();
  const fullStars = Math.floor(rating);

  if (variant === "card") {
    return (
      <DraggableWrapper
        id={id}
        variant="card"
        className={`z-30 ${className}`}
        style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      >
        <div className="rounded-2xl px-4 py-3 shadow-2xl text-center"
             style={{ backgroundColor: t.primaryLight }}>
          <div className="flex items-center justify-center gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill={i < fullStars ? t.accentGold || '#F59E0B' : 'transparent'}
                    style={{ color: i < fullStars ? t.accentGold || '#F59E0B' : t.primary + '20' }} />
            ))}
          </div>
          <span className="text-lg font-black" style={{ color: t.primary }}>{rating}</span>
          {reviews && <p className="text-[8px] font-bold" style={{ color: t.primary + '50' }}>{reviews}</p>}
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
        <div className="flex items-center gap-1.5">
          <Star size={14} fill={t.accentGold || '#F59E0B'} style={{ color: t.accentGold || '#F59E0B' }} />
          <span className="text-sm font-black text-white">{rating}</span>
          {reviews && <span className="text-[9px] font-bold text-white/40">({reviews})</span>}
        </div>
      </DraggableWrapper>
    );
  }

  // compact
  return (
    <DraggableWrapper
      id={id}
      variant="card"
      className={`z-30 ${className}`}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <div className="flex items-center gap-2 rounded-full px-3 py-1.5 shadow-xl"
           style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={10} fill={i < fullStars ? '#F59E0B' : 'transparent'}
                  style={{ color: i < fullStars ? '#F59E0B' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
        <span className="text-xs font-black text-white">{rating}</span>
        {reviews && <span className="text-[8px] font-bold text-white/40">{reviews}</span>}
      </div>
    </DraggableWrapper>
  );
}
