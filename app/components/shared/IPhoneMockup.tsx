"use client";

import React from "react";
import { useTheme } from "../ThemeContext";

interface IPhoneMockupProps {
  src: string;
  alt?: string;
  className?: string;
  /** Notch style: "pill" (Dynamic Island) or "notch" (classic) */
  notch?: "pill" | "notch";
}

/**
 * Reusable iPhone mockup frame.
 * Renders at 100% of its parent container — wrap in a sized div to control dimensions.
 *
 * Usage:
 *   <div className="w-[230px] h-[360px]">
 *     <IPhoneMockup src="/1.jpg" />
 *   </div>
 */
export default function IPhoneMockup({
  src,
  alt = "App screenshot",
  className = "",
  notch = "pill",
}: IPhoneMockupProps) {
  const t = useTheme();

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Hardware Buttons */}
      <div className="absolute -left-[7px] top-[20%] w-[3px] h-[10%] rounded-l-md" style={{ backgroundColor: t.border }} />
      <div className="absolute -left-[7px] top-[33%] w-[3px] h-[10%] rounded-l-md" style={{ backgroundColor: t.border }} />
      <div className="absolute -right-[7px] top-[27%] w-[3px] h-[13%] rounded-r-md" style={{ backgroundColor: t.border }} />

      {/* iPhone Frame */}
      <div
        className="absolute inset-0 rounded-[42px] border-[7px] shadow-2xl overflow-hidden"
        style={{ backgroundColor: t.primaryDark, borderColor: t.border }}
      >
        {/* Screen Content */}
        <div className="absolute inset-0 bg-white">
          <img src={src} alt={alt} className="w-full h-full object-cover object-top" />
          {/* Glass Reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Notch / Dynamic Island */}
        {notch === "pill" ? (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-30" />
        ) : (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-xl z-30" style={{ backgroundColor: t.primaryDark }} />
        )}
      </div>
    </div>
  );
}
