"use client";

import React, { useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { useParentSelected } from "../EditContext";
import { ImagePlus } from "lucide-react";

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
 * Shows upload button when parent DraggableWrapper is selected.
 */
export default function IPhoneMockup({
  src,
  alt = "App screenshot",
  className = "",
  notch = "pill",
}: IPhoneMockupProps) {
  const t = useTheme();
  const isSelected = useParentSelected();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customSrc, setCustomSrc] = useState<string | null>(null);

  const displaySrc = customSrc || src;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomSrc(url);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Hardware Buttons */}
      <div className="absolute -left-[7px] top-[20%] w-[3px] h-[10%] rounded-l-md opacity-30" style={{ backgroundColor: t.border }} />
      <div className="absolute -left-[7px] top-[33%] w-[3px] h-[10%] rounded-l-md opacity-30" style={{ backgroundColor: t.border }} />
      <div className="absolute -right-[7px] top-[27%] w-[3px] h-[13%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />

      {/* iPhone Frame */}
      <div
        className="absolute inset-0 rounded-[42px] border-[7px] shadow-2xl overflow-hidden"
        style={{ backgroundColor: t.primaryDark, borderColor: t.border }}
      >
        {/* Screen Content */}
        <div className="absolute inset-0 bg-white">
          <img src={displaySrc} alt={alt} className="w-full h-full object-cover object-top pointer-events-none" draggable={false} />
          {/* Glass Reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Notch / Dynamic Island */}
        {notch === "pill" ? (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2 gap-1">
             <div className="w-1 h-1 rounded-full bg-blue-500/20" />
             <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          </div>
        ) : (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-4 rounded-b-xl z-30" style={{ backgroundColor: t.primaryDark }} />
        )}
      </div>

      {/* Upload button — only when parent DraggableWrapper is selected */}
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="absolute -top-2 -right-2 z-50 w-8 h-8 rounded-full bg-[#B7FF5B] text-[#1B4332] flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
        >
          <ImagePlus size={14} />
        </button>
      )}
    </div>
  );
}
