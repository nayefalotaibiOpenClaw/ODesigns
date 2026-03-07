"use client";

import { useState } from "react";
import { Check, Copy, ArrowLeft } from "lucide-react";
import Link from "next/link";

const FONTS = [
  { name: "Cairo", value: "Cairo", sample: "أهلاً بالعالم - Hello World" },
  { name: "Tajawal", value: "Tajawal", sample: "أهلاً بالعالم - Hello World" },
  { name: "IBM Plex Sans Arabic", value: "IBM Plex Sans Arabic", sample: "أهلاً بالعالم - Hello World" },
  { name: "Noto Sans Arabic", value: "Noto Sans Arabic", sample: "أهلاً بالعالم - Hello World" },
  { name: "Readex Pro", value: "Readex Pro", sample: "أهلاً بالعالم - Hello World" },
  { name: "Rubik", value: "Rubik", sample: "أهلاً بالعالم - Hello World" },
  { name: "Almarai", value: "Almarai", sample: "أهلاً بالعالم - Hello World" },
  { name: "Changa", value: "Changa", sample: "أهلاً بالعالم - Hello World" },
  { name: "El Messiri", value: "El Messiri", sample: "أهلاً بالعالم - Hello World" },
  { name: "Baloo Bhaijaan 2", value: "Baloo Bhaijaan 2", sample: "أهلاً بالعالم - Hello World" },
  { name: "Inter", value: "Inter", sample: "Hello World - 123" },
  { name: "Geist", value: "Geist", sample: "Hello World - 123" },
];

const PALETTES = [
  {
    name: "Sylo Green (Current)",
    colors: { primary: "#1B4332", secondary: "#40916C", accent: "#52B788", bg: "#EAF4EE", text: "#1B4332" },
  },
  {
    name: "Ocean Blue",
    colors: { primary: "#1E3A5F", secondary: "#3B82F6", accent: "#60A5FA", bg: "#EFF6FF", text: "#1E3A5F" },
  },
  {
    name: "Royal Purple",
    colors: { primary: "#3B0764", secondary: "#7C3AED", accent: "#A78BFA", bg: "#F5F3FF", text: "#3B0764" },
  },
  {
    name: "Warm Orange",
    colors: { primary: "#7C2D12", secondary: "#EA580C", accent: "#FB923C", bg: "#FFF7ED", text: "#7C2D12" },
  },
  {
    name: "Rose Pink",
    colors: { primary: "#881337", secondary: "#E11D48", accent: "#FB7185", bg: "#FFF1F2", text: "#881337" },
  },
  {
    name: "Slate Dark",
    colors: { primary: "#0F172A", secondary: "#475569", accent: "#94A3B8", bg: "#F8FAFC", text: "#0F172A" },
  },
  {
    name: "Teal",
    colors: { primary: "#134E4A", secondary: "#0D9488", accent: "#2DD4BF", bg: "#F0FDFA", text: "#134E4A" },
  },
  {
    name: "Gold & Black",
    colors: { primary: "#1C1917", secondary: "#A16207", accent: "#FBBF24", bg: "#FFFBEB", text: "#1C1917" },
  },
  {
    name: "Crimson Red",
    colors: { primary: "#450A0A", secondary: "#DC2626", accent: "#F87171", bg: "#FEF2F2", text: "#450A0A" },
  },
  {
    name: "Forest",
    colors: { primary: "#14532D", secondary: "#16A34A", accent: "#4ADE80", bg: "#F0FDF4", text: "#14532D" },
  },
];

export default function CustomizePage() {
  const [selectedFont, setSelectedFont] = useState("Cairo");
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [copied, setCopied] = useState(false);

  const config = {
    font: selectedFont,
    colors: PALETTES[selectedPalette].colors,
    paletteName: PALETTES[selectedPalette].name,
  };

  const configJSON = JSON.stringify(config, null, 2);

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
            backgroundColor: PALETTES[selectedPalette].colors.bg,
            fontFamily: `'${selectedFont}', sans-serif`,
          }}
        >
          <h2
            className="text-4xl font-black mb-2"
            style={{ color: PALETTES[selectedPalette].colors.primary }}
          >
            معاينة مباشرة
          </h2>
          <p
            className="text-lg font-bold mb-4"
            style={{ color: PALETTES[selectedPalette].colors.secondary }}
          >
            هذا مثال على شكل النصوص
          </p>
          <div
            className="inline-block px-6 py-2 rounded-full text-white font-bold"
            style={{ backgroundColor: PALETTES[selectedPalette].colors.accent }}
          >
            زر تجريبي
          </div>
        </div>

        {/* Fonts Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Fonts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FONTS.map((font) => (
              <button
                key={font.value}
                onClick={() => setSelectedFont(font.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedFont === font.value
                    ? "border-gray-900 bg-white shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">{font.name}</span>
                  {selectedFont === font.value && (
                    <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <p
                  className="text-xl font-bold text-gray-600"
                  style={{ fontFamily: `'${font.value}', sans-serif` }}
                >
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
                onClick={() => setSelectedPalette(i)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedPalette === i
                    ? "border-gray-900 bg-white shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">{palette.name}</span>
                  {selectedPalette === i && (
                    <div className="w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {Object.entries(palette.colors).map(([key, color]) => (
                    <div key={key} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-lg shadow-sm border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] text-gray-400 font-bold">{key}</span>
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
