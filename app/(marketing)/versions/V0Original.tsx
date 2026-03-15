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

type TabKey = "social" | "appstore" | "ads";

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
  social:   { aspect: "1:1",  size: 280, minW: "280px" },
  appstore: { aspect: "9:16", size: 280, minW: "168px" },
  ads:      { aspect: "16:9", size: 280, minW: "336px" },
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
  const { socialPosts, appStorePosts, adsPosts } = useMemo(() => {
    if (!allFeatured || allFeatured.length === 0) {
      return { socialPosts: [], appStorePosts: [], adsPosts: [] };
    }
    return {
      socialPosts: shuffle(allFeatured.filter((p) => p.category === "social")),
      appStorePosts: shuffle(allFeatured.filter((p) => p.category === "appstore")),
      adsPosts: shuffle(allFeatured.filter((p) => p.category === "ads")),
    };
  }, [allFeatured]);

  const tabPostsMap: Record<TabKey, { posts: typeof socialPosts; aspect: AspectRatioType; size: number; minW: string }> = {
    social:   { posts: socialPosts,   ...aspectMap.social },
    appstore: { posts: appStorePosts, ...aspectMap.appstore },
    ads:      { posts: adsPosts,      ...aspectMap.ads },
  };

  const currentTab = tabPostsMap[activeTab];
  const collageItems = useMemo(() => shuffle(socialPosts).slice(0, 6), [socialPosts]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "social", label: t("landing.tabSocial") },
    { key: "appstore", label: t("landing.tabAppStore") },
    { key: "ads", label: t("landing.tabAds") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      <FloatingNav activePage="home" />

      {/* Hero Demo Section — Interactive Demo with Floating Icons */}
      <section className="pt-36 pb-16 px-6 relative">
        {/* Floating Logo Animations */}
        <FloatingLogo top="12%" left="12%" delay={0}><div className="w-full h-full bg-indigo-300 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="30%" left="6%" delay={1}><div className="w-full h-full bg-pink-500 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="10%" right="8%" delay={0.5}><div className="w-full h-full bg-yellow-400 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="35%" right="10%" delay={1.5}><div className="w-full h-full bg-emerald-500 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="55%" left="10%" delay={0.8}><div className="w-full h-full bg-orange-400 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="50%" right="14%" delay={2}><div className="w-full h-full bg-sky-400 rounded-lg" /></FloatingLogo>

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
                className="flex gap-6 px-6"
              >
                {currentTab.posts.map((item, i) => (
                  <motion.div
                    key={item._id + "-" + i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                    style={{ minWidth: currentTab.minW }}
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
              <div className="absolute inset-0 grid grid-cols-2 gap-3 p-6 rotate-12 scale-125 origin-center">
                {collageItems.map((item, i) => (
                  <div key={item._id + "-collage-" + i} className="aspect-square">
                    <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={220} />
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
