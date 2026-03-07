"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, Upload, Globe, Palette, Sparkles, Image, X } from "lucide-react";
import Link from "next/link";

export default function GeneratePage() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [configJson, setConfigJson] = useState("");
  const [screenshotNames, setScreenshotNames] = useState<string[]>([]);
  const [screenshotInput, setScreenshotInput] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [postCount, setPostCount] = useState(4);
  const [copied, setCopied] = useState(false);

  const addScreenshot = () => {
    if (screenshotInput.trim()) {
      setScreenshotNames([...screenshotNames, screenshotInput.trim()]);
      setScreenshotInput("");
    }
  };

  const removeScreenshot = (i: number) => {
    setScreenshotNames(screenshotNames.filter((_, idx) => idx !== i));
  };

  let parsedConfig: { font?: string; colors?: Record<string, string>; paletteName?: string } = {};
  try {
    parsedConfig = configJson ? JSON.parse(configJson) : {};
  } catch {
    // invalid json
  }

  const prompt = `You are a social media post designer for a SaaS/app product. Generate ${postCount} creative Instagram post designs as React/TSX components using Tailwind CSS and lucide-react icons.

## STRICT DESIGN RULES

1. **Every post MUST be a self-contained React component** that renders a 1:1 square post (use \`aspect-square\` with \`max-w-[600px]\`)
2. **All posts MUST use the EXACT same color palette and font** — no exceptions
3. **Use only CSS for visuals** — no external images except the logo and screenshots provided
4. **Each post should highlight ONE feature** with a creative visual representation
5. **Text should be ${language === "ar" ? "Arabic (RTL)" : "English (LTR)"}**
6. **Import EditableText from './EditableText'** and wrap all visible text with \`<EditableText>\` (use \`as="h2"\`, \`as="p"\` etc. to match the original tag)
7. **Keep designs bold, modern, and minimal** — big typography, clear hierarchy

## THEME CONFIG
\`\`\`json
${configJson || JSON.stringify({ font: "Cairo", colors: { primary: "#1B4332", secondary: "#40916C", accent: "#52B788", bg: "#EAF4EE", text: "#1B4332" }, paletteName: "Default Green" }, null, 2)}
\`\`\`

**Font:** \`${parsedConfig.font || "Cairo"}\` — apply via \`style={{ fontFamily: "'${parsedConfig.font || "Cairo"}', sans-serif" }}\` on the root div
**Colors:**
- Primary (headings, dark bg): \`${parsedConfig.colors?.primary || "#1B4332"}\`
- Secondary (subtext, accents): \`${parsedConfig.colors?.secondary || "#40916C"}\`
- Accent (highlights, buttons): \`${parsedConfig.colors?.accent || "#52B788"}\`
- Background: \`${parsedConfig.colors?.bg || "#EAF4EE"}\`
- Text: \`${parsedConfig.colors?.text || "#1B4332"}\`

## APP INFO
- **Name:** ${appName || "[App Name]"}
- **Description:** ${appDescription || "[App Description]"}
- **Website:** ${websiteUrl || "[Website URL]"}
- **Key Features:** ${features || "[List features]"}
${logoFileName ? `- **Logo file:** \`${logoFileName}\` (use as \`<img src="/${logoFileName}" />\`)` : ""}

## SCREENSHOTS PROVIDED
${screenshotNames.length > 0 ? screenshotNames.map((s, i) => `${i + 1}. \`${s}\` — use as \`<img src="/${s}" />\` where relevant`).join("\n") : "No screenshots provided — use CSS-only mockups to represent the app UI"}

## COMPONENT TEMPLATE
\`\`\`tsx
import React from 'react';
import EditableText from './EditableText';
// import icons from lucide-react

export default function FeatureNamePost() {
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto"
         style={{ fontFamily: "'${parsedConfig.font || "Cairo"}', sans-serif" }}>
      {/* Background */}
      {/* Content */}
      {/* Use EditableText for ALL text: */}
      {/* <EditableText as="h2" className="...">Title</EditableText> */}
      {/* <EditableText as="p" className="...">Subtitle</EditableText> */}
    </div>
  );
}
\`\`\`

## IMPORTANT
- Vary the layouts: some with dark bg using primary color, some with light bg
- Create visual metaphors for each feature (e.g., phone mockups, dashboard cards, floating UI elements)
- Add subtle background decorations (gradients, blur circles, grid patterns) using the palette colors
- Numbers and stats make posts more engaging
- Each component must be in its own file, named descriptively (e.g., \`FeatureNamePost.tsx\`)

Generate ${postCount} complete, production-ready TSX components now.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Generate Posts</h1>
            <p className="text-sm text-gray-500">Fill in the details, copy the prompt, paste it to AI</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Theme Config */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={20} className="text-purple-500" />
              <h2 className="text-base font-bold text-gray-900">Theme Config (JSON)</h2>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Paste the JSON from the{" "}
              <Link href="/customize" className="text-blue-600 underline">Customize page</Link>
            </p>
            <textarea
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              placeholder='{"font":"Cairo","colors":{"primary":"#1B4332",...}}'
              className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            {configJson && !parsedConfig.font && (
              <p className="text-red-500 text-xs mt-2 font-bold">Invalid JSON — check your config</p>
            )}
            {parsedConfig.font && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-1.5">
                  {parsedConfig.colors && Object.values(parsedConfig.colors).map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-md border border-black/10" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-bold">{parsedConfig.font} / {parsedConfig.paletteName}</span>
              </div>
            )}
          </section>

          {/* App Info */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={20} className="text-blue-500" />
              <h2 className="text-base font-bold text-gray-900">App Info</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">App / Brand Name</label>
                <input
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Sylo"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Short Description</label>
                <input
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  placeholder="e.g. All-in-one restaurant management system"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Website URL</label>
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Key Features (one per line)</label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder={"POS System\nInventory Management\nStaff Management\nOnline Ordering\nDelivery Integration"}
                  className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </section>

          {/* Assets */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Image size={20} className="text-green-500" />
              <h2 className="text-base font-bold text-gray-900">Assets</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Logo Filename</label>
                <input
                  value={logoFileName}
                  onChange={(e) => setLogoFileName(e.target.value)}
                  placeholder="e.g. logo.png (place in /public folder)"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Screenshot Filenames</label>
                <p className="text-xs text-gray-400 mb-2">Add filenames of screenshots placed in /public folder</p>
                <div className="flex gap-2 mb-3">
                  <input
                    value={screenshotInput}
                    onChange={(e) => setScreenshotInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addScreenshot()}
                    placeholder="e.g. dashboard.png"
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    onClick={addScreenshot}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800"
                  >
                    <Upload size={16} />
                  </button>
                </div>
                {screenshotNames.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {screenshotNames.map((name, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700">
                        <span>{name}</span>
                        <button onClick={() => removeScreenshot(i)} className="text-gray-400 hover:text-red-500">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Options */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-yellow-500" />
              <h2 className="text-base font-bold text-gray-900">Options</h2>
            </div>
            <div className="flex gap-6">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Language</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage("ar")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      language === "ar" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Arabic
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      language === "en" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Number of Posts</label>
                <div className="flex gap-2">
                  {[2, 4, 6, 8].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPostCount(n)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                        postCount === n ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Generated Prompt */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Generated Prompt</h2>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Prompt"}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-300 p-6 rounded-xl text-xs overflow-x-auto font-mono max-h-96 overflow-y-auto whitespace-pre-wrap">
              {prompt}
            </pre>
          </section>

        </div>
      </div>
    </main>
  );
}
