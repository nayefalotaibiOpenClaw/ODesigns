"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FloatingNav from "@/app/components/FloatingNav";
import HeroDemo from "./HeroDemo";
import FeaturedPostPreview from "@/features/posts/shared/FeaturedPostPreview";

// Contexts for rendering posts
import { type Theme, defaultTheme } from "@/contexts/ThemeContext";

// i18n
import { useLocale } from "@/lib/i18n/context";

import type { AspectRatioType } from "@/contexts/EditContext";

type TabKey = "social" | "appstore";

// Shuffle an array using Fisher-Yates
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const aspectMap: Record<TabKey, { aspect: AspectRatioType; size: number; minW: string }> = {
  social:   { aspect: "1:1",  size: 280, minW: "300px" },
  appstore: { aspect: "9:16", size: 320, minW: "200px" },
};

const FloatingLogo = ({ delay, children, top, left, right }: { delay: number; children: React.ReactNode; top?: string; left?: string; right?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.1, 1],
      y: [0, -10, 0]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute z-0 hidden md:flex items-center justify-center"
    style={{ top, left, right }}
  >
    <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-slate-100 dark:border-neutral-700 flex items-center justify-center p-2">
      {children}
    </div>
  </motion.div>
);

export default function V0Original() {
  const [activeTab, setActiveTab] = useState<TabKey>("social");
  const { t } = useLocale();

  // Fetch featured posts from Convex
  const allFeatured = useQuery(api.featuredPosts.list, {});

  // Split by category and shuffle for random display
  const { socialPosts, appStorePosts } = useMemo(() => {
    if (!allFeatured || allFeatured.length === 0) {
      return { socialPosts: [], appStorePosts: [] };
    }
    return {
      socialPosts: shuffle(allFeatured.filter((p) => p.category === "social")),
      appStorePosts: shuffle(allFeatured.filter((p) => p.category === "appstore")),
    };
  }, [allFeatured]);

  const tabPostsMap: Record<TabKey, { posts: typeof socialPosts; aspect: AspectRatioType; size: number; minW: string }> = {
    social:   { posts: socialPosts,   ...aspectMap.social },
    appstore: { posts: appStorePosts, ...aspectMap.appstore },
  };

  const currentTab = tabPostsMap[activeTab];
  const collageItems = useMemo(() => shuffle(socialPosts).slice(0, 6), [socialPosts]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "social", label: t("landing.tabSocial") },
    { key: "appstore", label: t("landing.tabAppStore") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      <FloatingNav activePage="home" />

      {/* Hero Demo Section — Interactive Demo with Floating Icons */}
      <section className="pt-36 pb-16 px-6 relative">
        {/* Floating Social Media Icons */}
        {/* Left column: Instagram, Facebook, YouTube, Google Play */}
        <FloatingLogo top="22%" left="4%" delay={0}>
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
            <defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFDC80" /><stop offset="25%" stopColor="#F77737" /><stop offset="50%" stopColor="#E1306C" /><stop offset="75%" stopColor="#C13584" /><stop offset="100%" stopColor="#833AB4" /></linearGradient></defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="url(#ig)" />
          </svg>
        </FloatingLogo>
        <FloatingLogo top="40%" left="7%" delay={1}>
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </FloatingLogo>
        <FloatingLogo top="58%" left="3%" delay={0.8}>
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#FF0000">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </FloatingLogo>
        <FloatingLogo top="72%" left="10%" delay={2.2}>
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z" fill="#4285F4" />
            <path d="M16.894 15.205l-3.102-3.205 3.102-3.205 3.505 2.034c.63.365.63 1.387 0 1.752l-3.505 2.624z" fill="#FBBC04" />
            <path d="M3.609 22.186L13.792 12l3.102 3.205-10.937 6.333a1.08 1.08 0 01-2.348-.352z" fill="#EA4335" />
            <path d="M3.609 1.814a1.08 1.08 0 012.348-.352L16.894 7.795 13.792 12 3.609 1.814z" fill="#34A853" />
          </svg>
        </FloatingLogo>
        {/* Right column: X, TikTok, LinkedIn, Apple */}
        <FloatingLogo top="22%" right="4%" delay={0.5}>
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-900 dark:text-white" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </FloatingLogo>
        <FloatingLogo top="40%" right="7%" delay={1.5}>
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-900 dark:text-white" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.85 4.85 0 01-1-.15z" />
          </svg>
        </FloatingLogo>
        <FloatingLogo top="58%" right="3%" delay={2}>
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </FloatingLogo>
        <FloatingLogo top="72%" right="10%" delay={2.5}>
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-900 dark:text-white" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </FloatingLogo>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-5"
          >
            {t("landing.heroTagline")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-lg sm:text-xl text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto mb-12"
          >
            {t("landing.heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <HeroDemo />
          </motion.div>
        </div>
      </section>

      {/* Original Hero Section — Tabs + Post Carousel */}
      <section className="pt-20 pb-20 px-6 relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8"
          >
            {t("landing.heroTitle")} <br /> {t("landing.heroTitle2")}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-16"
          >
            <div className="bg-slate-100 dark:bg-neutral-800 p-1 rounded-full flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                    activeTab === tab.key
                      ? "bg-white dark:bg-neutral-700 shadow-sm text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Featured Posts Carousel */}
        {currentTab.posts.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden mt-12"
            >
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: "-15%" }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-8 px-8"
              >
                {currentTab.posts.map((item, i) => (
                  <motion.div
                    key={item._id + "-" + i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                    style={{ minWidth: currentTab.minW, flexShrink: 0 }}
                  >
                    <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={currentTab.size} aspect={currentTab.aspect} />
                    <div className="mt-4 flex items-center justify-between px-2">
                      <span className="font-bold text-sm">{item.label}</span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-neutral-700" />
                        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-neutral-700" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Feature Section 1: Automation */}
      <section className="py-32 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">{t("landing.automationTitle")}</h2>
          <p className="text-xl text-slate-500 dark:text-neutral-400 max-w-3xl mx-auto mb-20 leading-relaxed">
            {t("landing.automationDesc")}
          </p>

          <div className="relative flex items-end justify-center gap-4 md:gap-8 pt-20">
             {/* Device Stack Mockup */}
             <div className="w-[30%] aspect-video bg-slate-900 rounded-xl border-4 border-slate-800 shadow-2xl relative z-0 scale-125">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20" />
             </div>
             <div className="w-[15%] aspect-[9/19] bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl absolute -bottom-10 left-[20%] z-10 hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20" />
             </div>
             <div className="w-[18%] aspect-[9/19] bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl absolute -bottom-20 right-[25%] z-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-500/30" />
             </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Dark Cards */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a] px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Global Reach Card */}
          <div className="bg-black rounded-[2.5rem] p-12 text-white flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-4xl font-black mb-6 leading-tight">{t("landing.globalTitle")}</h3>
              <p className="text-slate-400 text-lg mb-12">{t("landing.globalDesc")}</p>
            </div>
            <div className="flex gap-4 items-end mt-12 -mb-20 overflow-hidden">
               {[
                 { color: "bg-emerald-500", text: "English" },
                 { color: "bg-purple-600", text: "Arabic" },
                 { color: "bg-yellow-400", text: "French" },
                 { color: "bg-orange-600", text: "German" },
               ].map((lang, i) => (
                 <div key={i} className={`flex-1 aspect-[9/16] ${lang.color} rounded-t-2xl p-4 flex flex-col justify-between`}>
                    <div className="w-full h-1 bg-white/30 rounded" />
                    <div className="space-y-2">
                       <div className="w-full h-2 bg-white/20 rounded" />
                       <div className="w-full h-2 bg-white/20 rounded" />
                       <div className="w-full h-2 bg-white/20 rounded" />
                       <div className="w-2/3 h-2 bg-white/20 rounded" />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Identity/Font Card */}
          <div className="bg-black rounded-[2.5rem] p-12 text-white flex flex-col justify-between overflow-hidden">
             <div>
                <h3 className="text-4xl font-black mb-6 leading-tight">{t("landing.fontTitle")}</h3>
                <p className="text-slate-400 text-lg mb-12">{t("landing.fontDesc")}</p>
             </div>
             <div className="bg-white rounded-2xl p-6 -mb-24 mt-12">
                <div className="flex gap-6 h-full">
                   <div className="w-1/3 space-y-4 text-slate-900">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{t("landing.fontSizeLabel")}</span>
                        <div className="h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold">150</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{t("landing.fontFamilyLabel")}</span>
                        <div className="h-10 border border-slate-200 rounded-lg px-3 flex items-center justify-between text-xs font-bold">
                           Bangers <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                        </div>
                      </div>
                   </div>
                   <div className="flex-1 bg-blue-600 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                      <h4 className="text-3xl font-black tracking-wider leading-none">LOG YOUR EXERCISES AND MONITOR PROGRESS</h4>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Library Grid: Popular Collections */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
           <h2 className="text-4xl font-black mb-12">{t("landing.collectionsTitle")}</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Behavioral UX Patterns", "Tactile", "(Empty) State of the art",
                "Animation", "Tracking", "Personalisation"
              ].map((title, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="aspect-[1.5] bg-slate-50 dark:bg-neutral-900 rounded-[2rem] p-6 border border-slate-100 dark:border-neutral-800 group-hover:bg-slate-100 dark:group-hover:bg-neutral-800 transition-colors relative overflow-hidden">
                      <div className="grid grid-cols-2 gap-4 h-full">
                         <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-100 dark:border-neutral-700" />
                         <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-100 dark:border-neutral-700 mt-8" />
                      </div>
                   </div>
                   <div className="mt-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-700 overflow-hidden" />
                      <span className="font-bold text-slate-700 dark:text-neutral-300">{title}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust / Action Split View */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a] px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-neutral-800">
           <div className="flex-1 bg-slate-900 p-12 md:p-20 text-white flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8">
                <span className="text-slate-900 font-black text-2xl">S</span>
              </div>
              <h2 className="text-5xl font-black mb-12">{t("landing.welcomeBack")}</h2>

              <div className="w-full max-w-sm space-y-4">
                <button className="w-full h-14 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
                   <div className="w-5 h-5 bg-blue-500 rounded" />
                   {t("landing.continueGoogle")}
                </button>
                <button className="w-full h-14 border border-white/20 rounded-xl font-bold hover:bg-white/5 transition-all">
                   {t("landing.seeOther")}
                </button>
                <div className="py-4 flex items-center gap-4 text-white/30 text-xs font-bold uppercase tracking-widest">
                   <div className="flex-1 h-px bg-white/10" /> {t("landing.or")} <div className="flex-1 h-px bg-white/10" />
                </div>
                <input
                  type="email"
                  placeholder={t("landing.enterEmail")}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button className="w-full h-14 bg-white text-slate-900 rounded-xl font-black text-lg">
                   {t("landing.continue")}
                </button>
              </div>
           </div>

           <div className="flex-1 bg-slate-50 dark:bg-neutral-900 relative overflow-hidden hidden md:block min-h-[500px]">
              {/* Featured post collage */}
              <div className="absolute inset-0 grid grid-cols-2 gap-4 p-8 rotate-12 scale-110 origin-center">
                {collageItems.map((item, i) => (
                  <div key={item._id + "-collage-" + i} className="aspect-square rounded-xl overflow-hidden">
                    <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={200} />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-l from-slate-50 dark:from-[#0a0a0a] via-transparent to-transparent" />
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold text-sm">
          <div />
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">{t("landing.twitter")}</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">{t("landing.linkedin")}</a>
            <a href="/terms" className="hover:text-slate-900 dark:hover:text-white">{t("landing.termsOfService")}</a>
            <a href="/privacy" className="hover:text-slate-900 dark:hover:text-white">{t("landing.privacyPolicy")}</a>
          </div>
          <p>{t("landing.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
