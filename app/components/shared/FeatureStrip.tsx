"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import { useTheme } from "../ThemeContext";

interface FeatureStripProps {
  id: string;
  features: { icon: React.ReactNode; text: string }[];
  className?: string;
  variant?: "horizontal" | "vertical" | "chips";
  dir?: "rtl" | "ltr";
}

export default function FeatureStrip({
  id,
  features,
  className = "",
  variant = "horizontal",
  dir = "rtl",
}: FeatureStripProps) {
  const t = useTheme();

  if (variant === "chips") {
    return (
      <DraggableWrapper id={id} className={`z-30 ${className}`} dir={dir}>
        <div className="flex flex-wrap gap-2 justify-center">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm"
                 style={{ backgroundColor: t.primaryLight + '15', border: `1px solid ${t.primaryLight}20` }}>
              <span style={{ color: t.accentLime }}>{f.icon}</span>
              <span className="text-[10px] font-bold text-white">{f.text}</span>
            </div>
          ))}
        </div>
      </DraggableWrapper>
    );
  }

  if (variant === "vertical") {
    return (
      <DraggableWrapper id={id} className={`z-30 ${className}`} dir={dir}>
        <div className="flex flex-col gap-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                 style={{ backgroundColor: t.primaryLight + '08', border: `1px solid ${t.primaryLight}10` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                   style={{ backgroundColor: t.accent + '20', color: t.accentLime }}>
                {f.icon}
              </div>
              <span className="text-xs font-bold text-white">{f.text}</span>
            </div>
          ))}
        </div>
      </DraggableWrapper>
    );
  }

  // horizontal
  return (
    <DraggableWrapper id={id} className={`z-30 ${className}`} dir={dir}>
      <div className="flex items-center gap-1 rounded-2xl overflow-hidden shadow-xl"
           style={{ backgroundColor: t.primaryDark }}>
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2.5"
               style={{ borderRight: i < features.length - 1 ? `1px solid ${t.primaryLight}10` : 'none' }}>
            <span style={{ color: t.accentLime }}>{f.icon}</span>
            <span className="text-[10px] font-bold text-white whitespace-nowrap">{f.text}</span>
          </div>
        ))}
      </div>
    </DraggableWrapper>
  );
}
