"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Type,
  Image,
  Scissors,
  Lock,
  Check,
} from "lucide-react";
import Link from "@/lib/i18n/LocaleLink";
import { useTheme as useNextTheme } from "next-themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FeaturedPostPreview from "@/features/posts/shared/FeaturedPostPreview";
import { useLocale } from "@/lib/i18n/context";

/* ─── Theme types ─── */
type DemoTheme = "light" | "dark";

function themeStyles(theme: DemoTheme) {
  return {
    cardBg: theme === "dark" ? "bg-neutral-900/80 backdrop-blur-xl border-neutral-700/50" : "bg-white/80 backdrop-blur-xl border-slate-200",
    cardShadow: theme === "dark" ? "shadow-2xl shadow-black/40" : "shadow-2xl shadow-slate-200/60",
    vizBg: theme === "dark" ? "bg-neutral-800/50 border-neutral-700/30" : "bg-slate-50 border-slate-100",
    urlBarBg: theme === "dark" ? "bg-neutral-800/60 border-neutral-700/50" : "bg-slate-50 border-slate-200",
    inputText: theme === "dark" ? "text-white" : "text-slate-900",
    generateBtn: theme === "dark" ? "bg-white text-black" : "bg-slate-900 text-white",
    labelText: theme === "dark" ? "text-neutral-400" : "text-slate-500",
    valueText: theme === "dark" ? "text-white font-semibold" : "text-slate-900 font-semibold",
    stepActive: theme === "dark" ? "bg-white text-black" : "bg-slate-900 text-white",
    stepInactive: theme === "dark" ? "bg-neutral-800 text-neutral-500" : "bg-slate-100 text-slate-400",
    stepLabelActive: theme === "dark" ? "text-white" : "text-slate-900",
    stepLabelInactive: theme === "dark" ? "text-neutral-600" : "text-slate-300",
    lineActive: theme === "dark" ? "bg-white" : "bg-slate-900",
    lineInactive: theme === "dark" ? "bg-neutral-700" : "bg-slate-200",
    skeletonBg: theme === "dark" ? "bg-neutral-700/50" : "bg-slate-200/70",
    swatchLabel: theme === "dark" ? "text-neutral-500" : "text-slate-400",
    ctaBg: theme === "dark" ? "bg-white text-black" : "bg-slate-900 text-white",
    heroTitle: theme === "dark"
      ? "bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent"
      : "text-slate-900",
    heroSub: theme === "dark" ? "text-neutral-400" : "text-slate-500",
    pageBg: theme === "dark" ? "bg-neutral-950" : "bg-white",
    progressLabel: theme === "dark" ? "text-neutral-400" : "text-slate-500",
    publishGradientText: theme === "dark" ? "text-white mix-blend-difference" : "text-white mix-blend-difference",
  };
}

type DemoStep = "idle" | "scanning" | "extracting" | "generating" | "publishing" | "done";

/* ─── Demo URLs ─── */
const demoUrls = [
  "brewhaus-coffee.com",
  "fitpulse-app.io",
  "luxe-fashion.store",
  "summit-saas.com",
  "fresh-eats.delivery",
];

/* ─── Scanning Visual ─── */
function ScanningVisual({ theme }: { theme: DemoTheme }) {
  const s = themeStyles(theme);
  return (
    <div className={`relative w-full h-52 rounded-xl border overflow-hidden ${s.vizBg}`}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
          initial={{ top: "0%", opacity: 0 }}
          animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, ease: "linear" }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-indigo-400/40"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute w-16 h-16 rounded-full border-2 border-indigo-400/40"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
        />
        <div className="absolute"><Search className="w-6 h-6 text-indigo-400" /></div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        {[0.8, 0.6, 0.45].map((w, i) => (
          <motion.div key={i} className={`h-2 rounded-full ${s.skeletonBg}`} initial={{ width: 0 }} animate={{ width: `${w * 100}%` }} transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Extracting Visual ─── */
function ExtractingVisual({ theme }: { theme: DemoTheme }) {
  const s = themeStyles(theme);
  const { t } = useLocale();
  const swatches = [
    { color: "#1B4332", label: "Primary" },
    { color: "#2D6A4F", label: "Secondary" },
    { color: "#52B788", label: "Accent" },
    { color: "#D8F3DC", label: "Light" },
    { color: "#081C15", label: "Dark" },
  ];

  return (
    <div className={`relative w-full h-52 rounded-xl border overflow-hidden p-5 ${s.vizBg}`}>
      <div className="flex gap-3 mb-4">
        {swatches.map((sw, i) => (
          <motion.div key={i} className="flex flex-col items-center gap-1" initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <div className="w-10 h-10 rounded-xl shadow-md" style={{ backgroundColor: sw.color }} />
            <span className={`text-[10px] ${s.swatchLabel}`}>{sw.label}</span>
          </motion.div>
        ))}
      </div>
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        <Type className={`w-4 h-4 ${s.labelText}`} />
        <span className={`text-sm ${s.labelText}`}>{t("landing.brandFont")}</span>
        <span className={`text-sm ${s.valueText}`}>Inter, SF Pro</span>
      </motion.div>
      <motion.div className="flex items-center gap-3 mt-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
        <Image className={`w-4 h-4 ${s.labelText}`} />
        <span className={`text-sm ${s.labelText}`}>{t("landing.productsFound")}</span>
        <span className={`text-sm ${s.valueText}`}>{t("landing.productsItems", { count: "12" })}</span>
        <motion.div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: "spring" }}>
          <Check className="w-2.5 h-2.5 text-white" />
        </motion.div>
      </motion.div>
      <motion.div className="flex items-center gap-3 mt-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
        <Scissors className={`w-4 h-4 ${s.labelText}`} />
        <span className={`text-sm ${s.labelText}`}>{t("landing.backgrounds")}</span>
        <span className={`text-sm ${s.valueText}`}>{t("landing.backgroundsCleaned")}</span>
      </motion.div>
    </div>
  );
}

/* ─── Generating Visual ─── */
function GeneratingVisual({ theme, featuredPosts }: { theme: DemoTheme; featuredPosts: FeaturedPost[] }) {
  const s = themeStyles(theme);
  const items = featuredPosts.slice(0, 4);

  return (
    <div className={`relative w-full rounded-xl border overflow-hidden p-4 ${s.vizBg}`}>
      <div className="flex gap-3 items-end justify-center">
        {items.map((item, i) => {
          const isStory = i % 2 !== 0;
          return (
            <motion.div key={item._id} initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, delay: i * 0.25 }} className="shrink-0">
              <div className="overflow-hidden rounded-lg">
                <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={isStory ? 100 : 120} aspect={isStory ? "9:16" : "1:1"} />
              </div>
              <p className="text-slate-400 text-[10px] text-center mt-1.5 truncate max-w-[120px]">{item.label} · {isStory ? "Story" : "Post"}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Social Media SVG Icons ─── */
const SocialIcon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Instagram: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    TikTok: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.85 4.85 0 01-1-.15z" />
      </svg>
    ),
    Facebook: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    X: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    "App Store": (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    "Google Play": (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333zm2.302-2.302L13.792 12l3.01-3.01 2.302 2.302zM5.864 2.658L16.8 9.39l-2.302 2.302z" />
      </svg>
    ),
  };
  return <>{icons[name] ?? null}</>;
};

/* ─── Publishing Visual ─── */
function PublishingVisual({ theme }: { theme: DemoTheme }) {
  const s = themeStyles(theme);
  const { t } = useLocale();
  const channels = [
    { name: "Instagram", color: "from-purple-500 to-pink-500" },
    { name: "TikTok", color: "from-neutral-900 to-black" },
    { name: "Facebook", color: "from-blue-500 to-blue-600" },
    { name: "X", color: "from-neutral-900 to-black" },
    { name: "App Store", color: "from-blue-400 to-blue-500" },
    { name: "Google Play", color: "from-green-400 to-emerald-500" },
  ];

  return (
    <div className={`relative w-full h-52 rounded-xl border overflow-hidden flex flex-col items-center justify-center p-6 ${s.vizBg}`}>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {channels.map((ch, i) => (
          <motion.div key={ch.name} className="flex flex-col items-center gap-2" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: i * 0.12, type: "spring" }}>
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center shadow-lg`}>
              <SocialIcon name={ch.name} />
            </div>
            <span className={`text-[10px] ${s.swatchLabel}`}>{ch.name}</span>
          </motion.div>
        ))}
      </div>
      <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <motion.div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" initial={{ width: 0 }} animate={{ width: 120 }} transition={{ duration: 0.8, delay: 0.9 }} />
        <span className="text-xs text-emerald-400 font-semibold whitespace-nowrap">{t("landing.publishingProgress")}</span>
      </motion.div>
    </div>
  );
}

/* ─── Done Visual ─── */
function DoneVisual({ t, featuredPosts }: { t: (key: import("@/lib/i18n/types").TranslationKey, params?: Record<string, string>) => string; featuredPosts: FeaturedPost[] }) {
  const items = featuredPosts.slice(0, 4);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <motion.div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <Check className="w-3 h-3 text-white" />
        </motion.div>
        <span className="text-sm font-semibold text-emerald-500">{t("landing.publishedAll", { count: String(items.length) })}</span>
      </div>
      <div className="flex gap-3 items-end justify-center">
        {items.map((item, i) => {
          const isStory = i % 2 !== 0;
          return (
            <motion.div key={item._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: i * 0.08 }} className="shrink-0">
              <div className="overflow-hidden rounded-lg">
                <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={isStory ? 100 : 120} aspect={isStory ? "9:16" : "1:1"} />
              </div>
              <p className="text-slate-400 text-[10px] text-center mt-1.5 truncate max-w-[120px]">{item.label} · {isStory ? "Story" : "Post"}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

type FeaturedPost = { _id: string; label: string; componentCode: string; theme: { primary: string; primaryLight: string; primaryDark: string; accent: string; accentLight: string; accentLime: string; accentGold: string; accentOrange: string; border: string; font: string }; category: string };

/* ─── Main HeroDemo Component ─── */
export default function HeroDemo({ theme }: { theme?: DemoTheme }) {
  const { resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const allFeatured = useQuery(api.featuredPosts.list, { category: "social" });
  const featuredPosts: FeaturedPost[] = (allFeatured ?? []) as FeaturedPost[];
  // Use "light" as SSR default; once mounted, read resolvedTheme correctly
  const effectiveTheme: DemoTheme = theme ?? (mounted && resolvedTheme === "dark" ? "dark" : "light");
  const s = themeStyles(effectiveTheme);
  const { t } = useLocale();
  const [demoStep, setDemoStep] = useState<DemoStep>("idle");
  const [inputValue, setInputValue] = useState("");
  const [urlIndex, setUrlIndex] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (typingRef.current) { clearTimeout(typingRef.current); typingRef.current = null; }
  }, []);

  const typeAndStart = useCallback((idx: number) => {
    const url = demoUrls[idx % demoUrls.length];
    setInputValue("");
    setDemoStep("idle");

    let charIndex = 0;
    const typeNext = () => {
      if (charIndex <= url.length) {
        setInputValue(url.slice(0, charIndex));
        charIndex++;
        typingRef.current = setTimeout(typeNext, 60 + Math.random() * 40);
      } else {
        typingRef.current = setTimeout(() => {
          setDemoStep("scanning");
          const t1 = setTimeout(() => setDemoStep("extracting"), 2200);
          const t2 = setTimeout(() => setDemoStep("generating"), 4400);
          const t3 = setTimeout(() => setDemoStep("publishing"), 6600);
          const t4 = setTimeout(() => setDemoStep("done"), 9000);
          const t5 = setTimeout(() => setUrlIndex((prev) => prev + 1), 13000);
          timersRef.current = [t1, t2, t3, t4, t5];
        }, 500);
      }
    };
    typingRef.current = setTimeout(typeNext, 800);
  }, []);

  useEffect(() => {
    typeAndStart(urlIndex);
    return () => clearTimers();
  }, [urlIndex, typeAndStart, clearTimers]);

  const stepIndex = demoStep === "scanning" ? 0 : demoStep === "extracting" ? 1 : demoStep === "generating" ? 2 : demoStep === "publishing" ? 3 : demoStep === "done" ? 4 : -1;
  const stepLabels = [t("landing.stepScan"), t("landing.stepExtract"), t("landing.stepGenerate"), t("landing.stepPublish")];

  /* ─── Progress Steps Row ─── */
  const ProgressSteps = () => (
    <div className="flex items-center justify-center gap-3 mb-4">
      {stepLabels.map((label, i) => (
        <React.Fragment key={label}>
          {i > 0 && <div className={`h-px w-6 transition-colors duration-300 ${i <= stepIndex ? s.lineActive : s.lineInactive}`} />}
          <div className="flex items-center gap-1.5">
            <motion.div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
                i < stepIndex ? "bg-emerald-500 text-white" :
                i === stepIndex ? s.stepActive : s.stepInactive
              }`}
              animate={i === stepIndex ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.6, repeat: i === stepIndex ? Infinity : 0 }}
            >
              {i < stepIndex ? <Check className="w-3 h-3" /> : i + 1}
            </motion.div>
            <span className={`text-xs font-medium transition-colors duration-300 ${i <= stepIndex ? s.stepLabelActive : s.stepLabelInactive}`}>
              {label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className={`border rounded-2xl overflow-hidden transition-opacity duration-300 ${mounted ? "opacity-100" : "opacity-0"} ${s.cardBg} ${s.cardShadow}`}>
      <div className="p-5 min-h-[340px] flex flex-col justify-center">
        {/* Idle — auto-typing URL */}
        {demoStep === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className={`flex items-center border rounded-xl overflow-hidden ${s.urlBarBg}`}>
              <div className="flex items-center gap-2 pl-4 pr-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400/70" />
                  <div className="w-2 h-2 rounded-full bg-amber-400/70" />
                  <div className="w-2 h-2 rounded-full bg-green-400/70" />
                </div>
                <Lock className="w-3 h-3 text-slate-400 ml-1" />
              </div>
              <div className={`flex-1 py-3 px-2 text-sm ${s.inputText}`}>
                {inputValue}
                <motion.span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-middle" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
              </div>
              <div className={`m-1.5 px-5 py-2 rounded-lg text-sm font-bold ${s.generateBtn}`}>
                {t("landing.generate")}
              </div>
            </div>
          </motion.div>
        )}

        {/* Scanning / Extracting / Generating */}
        {(demoStep === "scanning" || demoStep === "extracting" || demoStep === "generating") && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProgressSteps />
            <p className={`text-center text-sm mb-4 ${s.progressLabel}`}>
              {demoStep === "scanning" && t("landing.scanning")}
              {demoStep === "extracting" && t("landing.extracting")}
              {demoStep === "generating" && t("landing.generating")}
            </p>
            <AnimatePresence mode="wait">
              {demoStep === "scanning" && <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ScanningVisual theme={effectiveTheme} /></motion.div>}
              {demoStep === "extracting" && <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ExtractingVisual theme={effectiveTheme} /></motion.div>}
              {demoStep === "generating" && <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><GeneratingVisual theme={effectiveTheme} featuredPosts={featuredPosts} /></motion.div>}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Publishing */}
        {demoStep === "publishing" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ProgressSteps />
            <p className={`text-center text-sm mb-4 ${s.progressLabel}`}>{t("landing.publishingChannels")}</p>
            <PublishingVisual theme={effectiveTheme} />
          </motion.div>
        )}

        {/* Done */}
        {demoStep === "done" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <DoneVisual t={t} featuredPosts={featuredPosts} />
            <div className="flex items-center justify-center mt-4 pt-4 border-t border-slate-200 dark:border-neutral-800">
              <Link
                href="/login"
                className={`px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform ${s.ctaBg}`}
              >
                {t("landing.startCreating")}
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
