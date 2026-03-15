"use client";

import React from "react";
import DynamicPost from "@/app/components/DynamicPost";
import { type Theme, ThemeCtx } from "@/contexts/ThemeContext";
import { EditContext, AspectRatioContext, type AspectRatioType } from "@/contexts/EditContext";

interface FeaturedPostPreviewProps {
  code: string;
  theme: Theme;
  size?: number;
  aspect?: AspectRatioType;
}

const ratioConfigs: Record<string, { innerW: number; innerH: number }> = {
  "1:1":  { innerW: 600, innerH: 600 },
  "9:16": { innerW: 600, innerH: 1067 },
  "16:9": { innerW: 1067, innerH: 600 },
  "4:5":  { innerW: 600, innerH: 750 },
  "4:3":  { innerW: 600, innerH: 450 },
};

export default function FeaturedPostPreview({ code, theme, size = 280, aspect = "1:1" }: FeaturedPostPreviewProps) {
  const cfg = ratioConfigs[aspect] || ratioConfigs["1:1"];
  const scale = size / cfg.innerW;
  const displayW = size;
  const displayH = (cfg.innerH / cfg.innerW) * size;

  return (
    <EditContext.Provider value={false}>
      <AspectRatioContext.Provider value={aspect}>
        <ThemeCtx.Provider value={theme}>
          <div
            dir="ltr"
            className="rounded-2xl overflow-hidden shadow-xl pointer-events-none select-none"
            style={{ width: displayW, height: displayH }}
          >
            <div style={{ width: cfg.innerW, height: cfg.innerH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <DynamicPost code={code} />
            </div>
          </div>
        </ThemeCtx.Provider>
      </AspectRatioContext.Provider>
    </EditContext.Provider>
  );
}
