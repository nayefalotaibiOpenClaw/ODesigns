"use client";

import React from "react";
import { useTheme } from "../ThemeContext";

interface IPadMockupProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Reusable iPad mockup frame (Landscape).
 */
export default function IPadMockup({
  src,
  alt = "Tablet screenshot",
  className = "",
}: IPadMockupProps) {
  const t = useTheme();

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Power Button */}
      <div className="absolute top-[-4px] right-[15%] w-[12%] h-[4px] rounded-t-md opacity-30" style={{ backgroundColor: t.border }} />
      {/* Volume Buttons */}
      <div className="absolute right-[-4px] top-[15%] w-[4px] h-[10%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />

      {/* iPad Frame */}
      <div
        className="absolute inset-0 rounded-[24px] border-[10px] shadow-2xl overflow-hidden"
        style={{ backgroundColor: t.primaryDark, borderColor: t.border }}
      >
        {/* Screen Content */}
        <div className="absolute inset-0 bg-white">
          <img src={src} alt={alt} className="w-full h-full object-cover" />
          {/* Glass Reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Home Button / Indicator (Modern iPad style - no button, just a bar at bottom) */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-black/20 rounded-full z-30" />
      </div>
    </div>
  );
}
