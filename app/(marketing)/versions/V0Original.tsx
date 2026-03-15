"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MousePointerClick,
  Send,
  Palette,
  Globe,
  Wand2,
  Play,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FloatingNav from "@/app/components/FloatingNav";
import HeroDemo from "./HeroDemo";
import FeaturedPostPreview from "@/features/posts/shared/FeaturedPostPreview";
import Link from "@/lib/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/context";
import type { AspectRatioType } from "@/contexts/EditContext";

type TabKey = "social" | "appstore";

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

/* ─── Social Platform Icons (for integrations section) ─── */
const socialPlatforms = [
  { name: "Instagram", color: "from-purple-500 to-pink-500", icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )},
  { name: "Facebook", color: "from-blue-500 to-blue-600", icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )},
  { name: "X", color: "from-neutral-700 to-neutral-900", icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )},
  { name: "Threads", color: "from-neutral-800 to-black", icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.724 2.104-1.14 3.54-1.205 1.078-.05 2.07.034 2.958.248-.085-1.16-.547-2.005-1.373-2.516-.89-.551-2.1-.752-3.237-.51l-.487-1.94c1.598-.34 3.27-.132 4.597.572 1.237.657 2.1 1.77 2.49 3.245l.013.052c.597.274 1.133.617 1.598 1.025 1.06.93 1.752 2.17 1.99 3.572.3 1.774-.07 3.727-1.103 5.5C19.27 22.28 16.603 23.966 12.186 24zm-.09-8.266c-1.025.047-1.827.31-2.38.782-.522.446-.77.996-.74 1.635.032.62.335 1.14.852 1.475.57.37 1.335.555 2.155.51 1.108-.06 1.968-.46 2.557-1.19.457-.568.783-1.356.964-2.348-.87-.297-1.87-.47-2.972-.47-.148 0-.294.003-.437.009z" />
    </svg>
  )},
  { name: "TikTok", color: "from-neutral-900 to-black", icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.85 4.85 0 01-1-.15z" />
    </svg>
  )},
  { name: "LinkedIn", color: "from-blue-600 to-blue-700", icon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )},
];

export default function V0Original() {
  const [activeTab, setActiveTab] = useState<TabKey>("social");
  const { t } = useLocale();

  const allFeatured = useQuery(api.featuredPosts.list, {});

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

  const tabs: { key: TabKey; label: string }[] = [
    { key: "social", label: t("landing.tabSocial") },
    { key: "appstore", label: t("landing.tabAppStore") },
  ];

  const howItWorksSteps = [
    { icon: Globe, titleKey: "landing.howItWorksStep1Title" as const, descKey: "landing.howItWorksStep1Desc" as const, num: "01" },
    { icon: Wand2, titleKey: "landing.howItWorksStep2Title" as const, descKey: "landing.howItWorksStep2Desc" as const, num: "02" },
    { icon: Send, titleKey: "landing.howItWorksStep3Title" as const, descKey: "landing.howItWorksStep3Desc" as const, num: "03" },
  ];

  const features = [
    { icon: Sparkles, titleKey: "landing.feature1Title" as const, descKey: "landing.feature1Desc" as const },
    { icon: MousePointerClick, titleKey: "landing.feature2Title" as const, descKey: "landing.feature2Desc" as const },
    { icon: Send, titleKey: "landing.feature3Title" as const, descKey: "landing.feature3Desc" as const },
    { icon: Palette, titleKey: "landing.feature4Title" as const, descKey: "landing.feature4Desc" as const },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      <FloatingNav activePage="home" />

      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — Tagline + HeroDemo
      ═══════════════════════════════════════════════════════════════ */}
      <section className="pt-36 pb-16 px-6 relative">
        {/* Floating Social Media Icons — Left */}
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
        {/* Floating Social Media Icons — Right */}
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

      {/* ═══════════════════════════════════════════════════════════════
          2. HOW IT WORKS — 3 Step Cards
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-center mb-12"
          >
            {t("landing.howItWorksTitle")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Step 1: Describe / URL */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 border border-slate-100 dark:border-transparent text-slate-900 dark:text-white overflow-hidden flex flex-col min-h-[320px]"
            >
              <div className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-4">01</div>
              <h4 className="text-xl font-bold mb-2">{t("landing.howItWorksStep1Title")}</h4>
              <p className="text-slate-500 dark:text-neutral-400 text-sm leading-relaxed mb-6">{t("landing.howItWorksStep1Desc")}</p>
              {/* Visual: URL bar mockup */}
              <div className="mt-auto bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400/60" />
                    <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                    <div className="w-2 h-2 rounded-full bg-green-400/60" />
                  </div>
                  <div className="flex-1 h-7 bg-slate-50 dark:bg-white/5 rounded-lg flex items-center px-3 gap-2">
                    <Globe className="w-3 h-3 text-slate-400 dark:text-neutral-500" />
                    <motion.span
                      className="text-xs text-slate-400 dark:text-neutral-400"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                    >
                      your-brand.com
                    </motion.span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[0.7, 0.5, 0.85].map((w, i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${w * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Step 2: AI Designs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 border border-slate-100 dark:border-transparent text-slate-900 dark:text-white overflow-hidden flex flex-col min-h-[320px]"
            >
              <div className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-4">02</div>
              <h4 className="text-xl font-bold mb-2">{t("landing.howItWorksStep2Title")}</h4>
              <p className="text-slate-500 dark:text-neutral-400 text-sm leading-relaxed mb-6">{t("landing.howItWorksStep2Desc")}</p>
              {/* Visual: Mini generated posts */}
              <div className="mt-auto flex gap-3 items-end">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex-1 aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="w-6 h-6 rounded-md bg-white/20" />
                  <div className="space-y-1">
                    <div className="h-1.5 bg-white/30 rounded w-full" />
                    <div className="h-1.5 bg-white/20 rounded w-2/3" />
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="w-[30%] aspect-[9/16] bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-2 flex flex-col justify-between"
                >
                  <div className="h-1 bg-white/25 rounded w-3/4" />
                  <div className="w-full aspect-video bg-white/10 rounded-md" />
                  <div className="h-1 bg-white/20 rounded w-1/2 mx-auto" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  className="flex-1 aspect-square bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex justify-between">
                    <div className="w-5 h-5 rounded-full bg-white/20" />
                    <div className="w-4 h-4 rounded bg-white/15" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-white/35 rounded w-full" />
                    <div className="h-1.5 bg-white/20 rounded w-4/5" />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Step 3: Edit & Publish */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-50 dark:bg-black rounded-[2rem] p-8 border border-slate-100 dark:border-transparent text-slate-900 dark:text-white overflow-hidden flex flex-col min-h-[320px]"
            >
              <div className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-4">03</div>
              <h4 className="text-xl font-bold mb-2">{t("landing.howItWorksStep3Title")}</h4>
              <p className="text-slate-500 dark:text-neutral-400 text-sm leading-relaxed mb-6">{t("landing.howItWorksStep3Desc")}</p>
              {/* Visual: Publish channels */}
              <div className="mt-auto space-y-3">
                {[
                  { name: "Instagram", color: "from-purple-500 to-pink-500" },
                  { name: "Facebook", color: "from-blue-500 to-blue-600" },
                  { name: "X", color: "from-neutral-600 to-neutral-800" },
                ].map((ch, i) => (
                  <motion.div
                    key={ch.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.12 }}
                    className="flex items-center gap-3 bg-white dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/5"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ch.color} flex items-center justify-center shrink-0`}>
                      <div className="w-4 h-4 rounded bg-white/30" />
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-neutral-300 flex-1">{ch.name}</span>
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 + i * 0.15, type: "spring" }}
                      className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. DEMO VIDEO — AI Content Generation
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              {t("landing.demoVideoTitle")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto"
            >
              {t("landing.demoVideoDesc")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aspect-video bg-slate-100 dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 flex items-center justify-center overflow-hidden"
          >
            {/* Replace this placeholder with your actual video embed */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-slate-400 dark:text-neutral-500 ms-1" />
              </div>
              <p className="text-slate-400 dark:text-neutral-500 font-medium">{t("landing.demoVideoPlaceholder")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. BENTO GRID — Features
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-center mb-16"
          >
            {t("landing.featuresTitle")}
          </motion.h2>

          {/* Row 1: Wide card (span 7) + Tall card (span 5) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

            {/* ── Card 1: AI-Powered Design (wide) ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7 bg-black rounded-[2rem] p-10 text-white flex flex-col justify-between overflow-hidden min-h-[420px] relative"
            >
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{t("landing.feature1Title")}</h3>
                <p className="text-slate-400 text-lg max-w-md leading-relaxed">{t("landing.feature1Desc")}</p>
              </div>
              {/* Visual: Floating post mockups */}
              <div className="relative mt-8 flex gap-4 items-end -mb-16">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[140px] aspect-square bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-4 flex flex-col justify-between"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20" />
                  <div className="space-y-2">
                    <div className="h-2 bg-white/30 rounded w-full" />
                    <div className="h-2 bg-white/20 rounded w-3/4" />
                    <div className="h-3 bg-white/40 rounded w-1/2 mt-3" />
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="w-[120px] aspect-[9/16] bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl shadow-2xl p-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-white/30 rounded w-full" />
                    <div className="h-1.5 bg-white/20 rounded w-2/3" />
                  </div>
                  <div className="w-full aspect-video bg-white/10 rounded-lg" />
                  <div className="h-2 bg-white/30 rounded w-1/2 mx-auto" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="w-[160px] aspect-square bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl shadow-2xl p-4 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full bg-white/20" />
                    <div className="w-6 h-6 rounded-md bg-white/15" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/40 rounded w-full font-bold" />
                    <div className="h-2 bg-white/20 rounded w-5/6" />
                    <div className="h-2 bg-white/20 rounded w-2/3" />
                  </div>
                </motion.div>
              </div>
              {/* Subtle glow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-indigo-500/10 blur-3xl rounded-full" />
            </motion.div>

            {/* ── Card 2: Brand Consistency (tall) ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-5 bg-black rounded-[2rem] p-10 text-white flex flex-col justify-between overflow-hidden min-h-[420px]"
            >
              <div>
                <h3 className="text-3xl font-black mb-4 leading-tight">{t("landing.feature4Title")}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{t("landing.feature4Desc")}</p>
              </div>
              {/* Visual: Color palette + font preview */}
              <div className="mt-8 space-y-5">
                <div className="flex gap-3">
                  {[
                    { color: "#6366f1", label: "Primary" },
                    { color: "#8b5cf6", label: "Accent" },
                    { color: "#f97316", label: "Warm" },
                    { color: "#10b981", label: "Success" },
                    { color: "#0ea5e9", label: "Info" },
                  ].map((swatch, i) => (
                    <motion.div
                      key={swatch.label}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className="w-10 h-10 rounded-xl shadow-lg" style={{ backgroundColor: swatch.color }} />
                      <span className="text-[10px] text-neutral-500">{swatch.label}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Font</div>
                    <div className="text-sm text-white font-semibold">Inter</div>
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">Aa Bb Cc 123</div>
                </div>
              </div>
            </motion.div>

            {/* ── Card 3: Visual Editor (wide, left) ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="md:col-span-5 bg-black rounded-[2rem] p-10 text-white flex flex-col justify-between overflow-hidden min-h-[380px]"
            >
              <div>
                <h3 className="text-3xl font-black mb-4 leading-tight">{t("landing.feature2Title")}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{t("landing.feature2Desc")}</p>
              </div>
              {/* Visual: Editor mockup */}
              <div className="mt-8 bg-white/5 rounded-xl border border-white/10 p-4 -mb-10">
                <div className="flex gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-400/70" />
                  <div className="w-2 h-2 rounded-full bg-amber-400/70" />
                  <div className="w-2 h-2 rounded-full bg-green-400/70" />
                </div>
                <div className="flex gap-3">
                  {/* Sidebar */}
                  <div className="w-12 space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-full aspect-square rounded-lg ${i === 0 ? "bg-indigo-500/40 ring-1 ring-indigo-400/50" : "bg-white/5"}`} />
                    ))}
                  </div>
                  {/* Canvas */}
                  <div className="flex-1 aspect-video bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-lg border border-white/10 p-3 relative">
                    <motion.div
                      animate={{ x: [0, 4, 0], y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-3 start-3 w-20 h-6 bg-white/20 rounded border border-dashed border-indigo-400/50"
                    />
                    <div className="absolute bottom-3 start-3 end-3 space-y-1.5">
                      <div className="h-1.5 bg-white/15 rounded w-3/4" />
                      <div className="h-1.5 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Card 4: Multi-Platform Publishing (wide, right) ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-7 bg-black rounded-[2rem] p-10 text-white flex flex-col justify-between overflow-hidden min-h-[380px] relative"
            >
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{t("landing.feature3Title")}</h3>
                <p className="text-slate-400 text-lg max-w-lg leading-relaxed">{t("landing.feature3Desc")}</p>
              </div>
              {/* Visual: Platform icons floating in grid */}
              <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 gap-4">
                {socialPlatforms.map((platform, i) => (
                  <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg`}>
                      {platform.icon}
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium">{platform.name}</span>
                  </motion.div>
                ))}
              </div>
              {/* Connecting lines effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-3xl rounded-full" />
            </motion.div>


          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. DEMO VIDEO — Publishing Flow
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 dark:bg-neutral-950 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              {t("landing.demoVideoPublishTitle")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto"
            >
              {t("landing.demoVideoPublishDesc")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="aspect-video bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 flex items-center justify-center overflow-hidden"
          >
            {/* Replace this placeholder with your actual video embed */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-slate-400 dark:text-neutral-500 ms-1" />
              </div>
              <p className="text-slate-400 dark:text-neutral-500 font-medium">{t("landing.demoVideoPlaceholder")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. SHOWCASE — Featured Posts, Two-Row Marquee
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-4"
          >
            {t("landing.showcaseTitle")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto mb-10"
          >
            {t("landing.showcaseDesc")}
          </motion.p>

          <div className="flex items-center justify-center gap-2 mb-12">
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
          </div>
        </div>

        {currentTab.posts.length > 0 && (() => {
          const mid = Math.ceil(currentTab.posts.length / 2);
          const row1 = currentTab.posts.slice(0, mid);
          const row2 = currentTab.posts.slice(mid);

          return (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full overflow-hidden space-y-6"
              >
                {/* Row 1 — scrolls left */}
                <div className="overflow-hidden">
                  <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex gap-6"
                  >
                    {[...row1, ...row1].map((item, i) => (
                      <div
                        key={item._id + "-r1-" + i}
                        style={{ minWidth: currentTab.minW, flexShrink: 0 }}
                      >
                        <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={currentTab.size} aspect={currentTab.aspect} />
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Row 2 — scrolls right */}
                <div className="overflow-hidden">
                  <motion.div
                    initial={{ x: "-50%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="flex gap-6"
                  >
                    {[...row2, ...row2].map((item, i) => (
                      <div
                        key={item._id + "-r2-" + i}
                        style={{ minWidth: currentTab.minW, flexShrink: 0 }}
                      >
                        <FeaturedPostPreview code={item.componentCode} theme={item.theme} size={currentTab.size} aspect={currentTab.aspect} />
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          );
        })()}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. SOCIAL PROOF — Stats
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black mb-16"
          >
            {t("landing.proofTitle")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: "10,000+", label: t("landing.proofStat1") },
              { value: "6+", label: t("landing.proofStat2") },
              { value: "20+", label: t("landing.proofStat3") },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8"
              >
                <div className="text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-slate-500 dark:text-neutral-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          9. FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto relative">
          {/* Glow effects */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/15 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 left-1/4 w-[300px] h-[200px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-neutral-50 dark:to-white rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden border border-white/5 dark:border-slate-200">
            {/* Decorative grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

            {/* Decorative accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-white/10 dark:bg-slate-900/10 rounded-full px-4 py-1.5 mb-8"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-300 dark:text-indigo-600">AI-Powered</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-black text-white dark:text-slate-900 mb-6 leading-tight"
              >
                {t("landing.ctaTitle")}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-slate-400 dark:text-slate-500 max-w-xl mx-auto mb-10"
              >
                {t("landing.ctaDesc")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  href="/login"
                  className="px-10 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/10 dark:shadow-slate-900/20"
                >
                  {t("landing.ctaButton")}
                </Link>
                <Link
                  href="/pricing"
                  className="px-10 py-4 border border-white/20 dark:border-slate-300 text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:bg-white/5 dark:hover:bg-slate-100 transition-all"
                >
                  {t("landing.ctaPricing")}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          10. FOOTER
      ═══════════════════════════════════════════════════════════════ */}
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
