"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Ratio,
  Sparkles,
  Check,
  MousePointer2,
} from "lucide-react";
import { PostPreview, socialPosts } from "./shared";

/* ─── Input Card ─── */
function InputCard({
  label,
  children,
  delay,
}: {
  label: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex-1 min-w-[130px] bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-700/60 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-neutral-300">
          {label}
        </span>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: "spring", stiffness: 300 }}
          className="w-5 h-5 rounded-md border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
      </div>
      {children}
    </motion.div>
  );
}

/* ─── Connector Lines ─── */
function ConnectorLines() {
  return (
    <div className="hidden md:flex items-center justify-center py-3">
      <svg
        width="400"
        height="40"
        viewBox="0 0 400 40"
        fill="none"
        className="text-slate-300 dark:text-neutral-600"
      >
        {/* 4 lines converging from card positions to center */}
        <path
          d="M60 0 Q60 20 200 38"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d="M150 0 Q150 15 200 38"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d="M250 0 Q250 15 200 38"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d="M340 0 Q340 20 200 38"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      </svg>
    </div>
  );
}

function ConnectorLinesDown() {
  return (
    <div className="hidden md:flex items-center justify-center py-3">
      <svg
        width="400"
        height="40"
        viewBox="0 0 400 40"
        fill="none"
        className="text-slate-300 dark:text-neutral-600"
      >
        <path
          d="M200 0 Q200 20 100 38"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d="M200 0 Q200 15 200 38"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d="M200 0 Q200 20 300 38"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      </svg>
    </div>
  );
}

/* ─── Main Component ─── */
export default function HeroVisual() {
  const previewPosts = socialPosts.slice(0, 3);
  const brandColors = ["#1B4332", "#2D6A4F", "#52B788", "#D8F3DC"];

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Soft glow background */}
      <div className="absolute inset-0 -m-8 rounded-[3rem] bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-neutral-900/60 dark:via-neutral-950/40 dark:to-transparent blur-sm -z-10" />

      {/* ── Outer card ── */}
      <div className="bg-gradient-to-b from-slate-50/80 to-white/60 dark:from-neutral-900/50 dark:to-neutral-950/30 backdrop-blur-sm rounded-[2rem] border border-slate-200/60 dark:border-neutral-700/40 p-6 md:p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
        {/* ── Top: Input Cards Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Website */}
          <InputCard label="Website" delay={0.1}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  summit-saas.com
                </p>
                <p className="text-[10px] text-slate-400 dark:text-neutral-500">
                  Scanned
                </p>
              </div>
            </div>
          </InputCard>

          {/* Card 2: Brand */}
          <InputCard label="Brand" delay={0.2}>
            <div className="flex items-center gap-1.5">
              {brandColors.map((color, i) => (
                <motion.div
                  key={color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.5 + i * 0.08,
                    type: "spring",
                    stiffness: 400,
                  }}
                  className="w-6 h-6 rounded-lg shadow-sm border border-black/5"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </InputCard>

          {/* Card 3: Format */}
          <InputCard label="Format" delay={0.3}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                <Ratio className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Post
                </p>
                <p className="text-[10px] text-slate-400 dark:text-neutral-500">
                  1080 x 1080
                </p>
              </div>
            </div>
          </InputCard>

          {/* Card 4: Style */}
          <InputCard label="Style" delay={0.4}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  Bold
                </p>
                <p className="text-[10px] text-slate-400 dark:text-neutral-500">
                  SaaS Creative
                </p>
              </div>
            </div>
          </InputCard>
        </div>

        {/* ── Connector lines top ── */}
        <ConnectorLines />

        {/* ── Generate Button ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="px-10 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-base font-bold shadow-lg shadow-slate-900/20 dark:shadow-white/10">
              Generate
            </div>
            {/* Cursor icon */}
            <motion.div
              initial={{ opacity: 0, x: -10, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="absolute -bottom-3 -right-4"
            >
              <MousePointer2 className="w-5 h-5 text-slate-900 dark:text-white fill-white dark:fill-slate-900 drop-shadow-md" />
            </motion.div>
          </div>
        </motion.div>

        {/* ── Connector lines bottom ── */}
        <ConnectorLinesDown />

        {/* ── Bottom: Generated Posts ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-center text-sm font-bold text-slate-900 dark:text-white mb-4">
            AI Generated Posts
          </p>
          <div className="flex gap-4 justify-center items-start">
            {previewPosts.map((post, i) => (
              <motion.div
                key={post.label}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
                className="flex flex-col items-center"
              >
                {/* Quality badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 1.3 + i * 0.15,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 rounded-full px-3 py-1 mb-2 shadow-sm border border-slate-200 dark:border-neutral-700"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-neutral-300">
                    {["On-brand", "Ready to post", "Optimized"][i]}
                  </span>
                </motion.div>
                {/* Post preview */}
                <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-neutral-700/30">
                  <PostPreview theme={post.theme} size={160} aspect="1:1">
                    {post.component}
                  </PostPreview>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-2 font-medium">
                  {post.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
