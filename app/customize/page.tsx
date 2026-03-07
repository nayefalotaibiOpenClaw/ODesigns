"use client";

import { useState } from "react";
import { Check, Copy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTheme, useSetTheme, defaultTheme, Theme } from "../components/ThemeContext";

const FONTS = [
  { name: "Cairo", value: "'Cairo', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "Tajawal", value: "'Tajawal', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "IBM Plex Sans Arabic", value: "'IBM Plex Sans Arabic', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "Noto Sans Arabic", value: "'Noto Sans Arabic', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "Readex Pro", value: "'Readex Pro', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "Rubik", value: "'Rubik', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "Almarai", value: "'Almarai', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "Changa", value: "'Changa', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "El Messiri", value: "'El Messiri', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "Baloo Bhaijaan 2", value: "'Baloo Bhaijaan 2', sans-serif", sample: "أهلاً بالعالم - Hello World" },
  { name: "Inter", value: "'Inter', sans-serif", sample: "Hello World - 123" },
  { name: "Geist", value: "'Geist', sans-serif", sample: "Hello World - 123" },
];

const PALETTES: { name: string; theme: Theme }[] = [
  {
    name: "Sylo Green (Default)",
    theme: defaultTheme,
  },
  {
    name: "Ocean Blue",
    theme: {
      primary: "#1E3A5F",
      primaryLight: "#EFF6FF",
      primaryDark: "#0F1D30",
      accent: "#3B82F6",
      accentLight: "#60A5FA",
      accentLime: "#38BDF8",
      accentGold: "#FCD34D",
      accentOrange: "#F97316",
      border: "#2D5A8E",
      font: "'Cairo', sans-serif",
    },
  },
  {
    name: "Royal Purple",
    theme: {
      primary: "#3B0764",
      primaryLight: "#F5F3FF",
      primaryDark: "#1E0334",
      accent: "#7C3AED",
      accentLight: "#A78BFA",
      accentLime: "#C084FC",
      accentGold: "#FCD34D",
      accentOrange: "#F97316",
      border: "#581C87",
      font: "'Cairo', sans-serif",
    },
  },
  {
    name: "Warm Orange",
    theme: {
      primary: "#7C2D12",
      primaryLight: "#FFF7ED",
      primaryDark: "#431407",
      accent: "#EA580C",
      accentLight: "#FB923C",
      accentLime: "#FBBF24",
      accentGold: "#FCD34D",
      accentOrange: "#F97316",
      border: "#9A3412",
      font: "'Cairo', sans-serif",
    },
  },
  {
    name: "Rose Pink",
    theme: {
      primary: "#881337",
      primaryLight: "#FFF1F2",
      primaryDark: "#4C0519",
      accent: "#E11D48",
      accentLight: "#FB7185",
      accentLime: "#FDA4AF",
      accentGold: "#FCD34D",
      accentOrange: "#F97316",
      border: "#9F1239",
      font: "'Cairo', sans-serif",
    },
  },
  {
    name: "Slate Dark",
    theme: {
      primary: "#0F172A",
      primaryLight: "#F8FAFC",
      primaryDark: "#020617",
      accent: "#475569",
      accentLight: "#94A3B8",
      accentLime: "#CBD5E1",
      accentGold: "#FCD34D",
      accentOrange: "#F97316",
      border: "#1E293B",
      font: "'Cairo', sans-serif",
    },
  },
  {
    name: "Teal",
    theme: {
      primary: "#134E4A",
      primaryLight: "#F0FDFA",
      primaryDark: "#042F2E",
      accent: "#0D9488",
      accentLight: "#2DD4BF",
      accentLime: "#5EEAD4",
      accentGold: "#FCD34D",
      accentOrange: "#F97316",
      border: "#115E59",
      font: "'Cairo', sans-serif",
    },
  },
  {
    name: "Gold & Black",
    theme: {
      primary: "#1C1917",
      primaryLight: "#FFFBEB",
      primaryDark: "#0C0A09",
      accent: "#A16207",
      accentLight: "#CA8A04",
      accentLime: "#FBBF24",
      accentGold: "#FCD34D",
      accentOrange: "#F97316",
      border: "#292524",
      font: "'Cairo', sans-serif",
    },
  },
  {
    name: "Crimson Red",
    theme: {
      primary: "#450A0A",
      primaryLight: "#FEF2F2",
      primaryDark: "#1C0404",
      accent: "#DC2626",
      accentLight: "#F87171",
      accentLime: "#FCA5A5",
      accentGold: "#FCD34D",
      accentOrange: "#F97316",
      border: "#7F1D1D",
      font: "'Cairo', sans-serif",
    },
  },
  {
    name: "Forest",
    theme: {
      primary: "#14532D",
      primaryLight: "#F0FDF4",
      primaryDark: "#052E16",
      accent: "#16A34A",
      accentLight: "#4ADE80",
      accentLime: "#86EFAC",
      accentGold: "#FCD34D",
      accentOrange: "#F97316",
      border: "#166534",
      font: "'Cairo', sans-serif",
    },
  },
];

export default function CustomizePage() {
  const currentTheme = useTheme();
  const setTheme = useSetTheme();
  const [copied, setCopied] = useState(false);

  const selectedPaletteIdx = PALETTES.findIndex(
    (p) => p.theme.primary === currentTheme.primary && p.theme.primaryLight === currentTheme.primaryLight
  );
  const selectedFontIdx = FONTS.findIndex((f) => f.value === currentTheme.font);

  const handleSelectPalette = (idx: number) => {
    setTheme({ ...PALETTES[idx].theme, font: currentTheme.font });
  };

  const handleSelectFont = (fontValue: string) => {
    setTheme({ ...currentTheme, font: fontValue });
  };

  const configJSON = JSON.stringify(currentTheme, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(configJSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-8" dir="ltr">
      <link
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;700;900&family=IBM+Plex+Sans+Arabic:wght@400;700&family=Noto+Sans+Arabic:wght@400;700;900&family=Readex+Pro:wght@400;700&family=Rubik:wght@400;700;900&family=Almarai:wght@400;700;800&family=Changa:wght@400;700;800&family=El+Messiri:wght@400;700&family=Baloo+Bhaijaan+2:wght@400;700;800&family=Inter:wght@400;700;900&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Customize Theme</h1>
        </div>

        {/* Live Preview */}
        <div
          className="rounded-xl p-8 mb-8 shadow-lg text-center"
          style={{
            backgroundColor: currentTheme.primaryLight,
            fontFamily: currentTheme.font,
          }}
        >
          <h2 className="text-4xl font-black mb-2" style={{ color: currentTheme.primary }}>
            معاينة مباشرة
          </h2>
          <p className="text-lg font-bold mb-4" style={{ color: currentTheme.accent }}>
            هذا مثال على شكل النصوص
          </p>
          <div className="inline-flex gap-2">
            <div className="px-6 py-2 rounded-full text-white font-bold" style={{ backgroundColor: currentTheme.accent }}>
              زر تجريبي
            </div>
            <div className="px-6 py-2 rounded-full font-bold" style={{ backgroundColor: currentTheme.accentLime, color: currentTheme.primary }}>
              لون مميز
            </div>
          </div>
        </div>

        {/* Fonts Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Fonts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FONTS.map((font, i) => (
              <button
                key={font.value}
                onClick={() => handleSelectFont(font.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedFontIdx === i
                    ? "border-gray-900 bg-white shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">{font.name}</span>
                  {selectedFontIdx === i && (
                    <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-600" style={{ fontFamily: font.value }}>
                  {font.sample}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Color Palettes Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Color Palettes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PALETTES.map((palette, i) => (
              <button
                key={palette.name}
                onClick={() => handleSelectPalette(i)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedPaletteIdx === i
                    ? "border-gray-900 bg-white shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">{palette.name}</span>
                  {selectedPaletteIdx === i && (
                    <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {[
                    { key: "primary", color: palette.theme.primary },
                    { key: "light", color: palette.theme.primaryLight },
                    { key: "accent", color: palette.theme.accent },
                    { key: "accentLight", color: palette.theme.accentLight },
                    { key: "lime", color: palette.theme.accentLime },
                  ].map((item) => (
                    <div key={item.key} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-lg shadow-sm border border-black/10"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] text-gray-400 font-bold">{item.key}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* JSON Output */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Config</h2>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-6 rounded-xl text-sm overflow-x-auto font-mono">
            {configJSON}
          </pre>
        </section>
      </div>
    </main>
  );
}
