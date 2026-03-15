"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Loader2, Plus, Trash2, ArrowLeft, Check, Star,
} from "lucide-react";
import Link from "@/lib/i18n/LocaleLink";
import FeaturedPostPreview from "@/features/posts/shared/FeaturedPostPreview";
import { defaultTheme } from "@/contexts/ThemeContext";

type Category = "social" | "appstore" | "ads";

const THEME_PRESETS = [
  { name: "Green", theme: { ...defaultTheme } },
  {
    name: "Blue",
    theme: {
      primary: "#1e3a5f", primaryLight: "#e8f0fe", primaryDark: "#0d1f33",
      accent: "#3b82f6", accentLight: "#60a5fa", accentLime: "#67e8f9",
      accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#2a4a6f",
      font: "var(--font-cairo), 'Cairo', sans-serif",
    },
  },
  {
    name: "Purple",
    theme: {
      primary: "#3b1f6e", primaryLight: "#f3e8ff", primaryDark: "#1e0f3a",
      accent: "#8b5cf6", accentLight: "#a78bfa", accentLime: "#c4b5fd",
      accentGold: "#fbbf24", accentOrange: "#f97316", border: "#4c2d8a",
      font: "var(--font-cairo), 'Cairo', sans-serif",
    },
  },
  {
    name: "Rose",
    theme: {
      primary: "#881337", primaryLight: "#fff1f2", primaryDark: "#4c0519",
      accent: "#e11d48", accentLight: "#fb7185", accentLime: "#fda4af",
      accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#9f1239",
      font: "var(--font-cairo), 'Cairo', sans-serif",
    },
  },
  {
    name: "Teal",
    theme: {
      primary: "#134e4a", primaryLight: "#f0fdfa", primaryDark: "#042f2e",
      accent: "#14b8a6", accentLight: "#2dd4bf", accentLime: "#5eead4",
      accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#1a5c57",
      font: "var(--font-cairo), 'Cairo', sans-serif",
    },
  },
  {
    name: "Navy",
    theme: {
      primary: "#1e1b4b", primaryLight: "#eef2ff", primaryDark: "#0c0a26",
      accent: "#6366f1", accentLight: "#818cf8", accentLime: "#a5b4fc",
      accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#312e81",
      font: "var(--font-cairo), 'Cairo', sans-serif",
    },
  },
];

const CAT_STYLE: Record<Category, string> = {
  social: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  appstore: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  ads: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

export default function FeaturedPostsPage() {
  const featuredPosts = useQuery(api.featuredPosts.list, {});
  const allPosts = useQuery(api.featuredPosts.listAllPosts);
  const createFeatured = useMutation(api.featuredPosts.create);
  const removeFeatured = useMutation(api.featuredPosts.remove);

  const [category, setCategory] = useState<Category>("social");
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"current" | "add">("current");

  const handleAdd = async (post: { _id: Id<"posts">; title: string; componentCode: string }) => {
    setLoading(post._id);
    try {
      await createFeatured({
        label: post.title,
        componentCode: post.componentCode,
        category,
        theme: THEME_PRESETS[selectedTheme].theme,
      });
    } catch (err) {
      console.error("Failed to add featured post:", err);
    }
    setLoading(null);
  };

  const handleRemove = async (id: Id<"featuredPosts">) => {
    setLoading(id);
    try {
      await removeFeatured({ id });
    } catch (err) {
      console.error("Failed to remove:", err);
    }
    setLoading(null);
  };

  const catCounts = {
    social: featuredPosts?.filter((p) => p.category === "social").length ?? 0,
    appstore: featuredPosts?.filter((p) => p.category === "appstore").length ?? 0,
    ads: featuredPosts?.filter((p) => p.category === "ads").length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Featured Posts
            </h1>
            <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
              Social: {catCounts.social} &middot; App Store: {catCounts.appstore} &middot; Ads: {catCounts.ads}
            </p>
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-neutral-800 p-1 rounded-full flex gap-1">
          <button
            onClick={() => setTab("current")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              tab === "current"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-neutral-400"
            }`}
          >
            Current ({featuredPosts?.length ?? 0})
          </button>
          <button
            onClick={() => setTab("add")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === "add"
                ? "bg-white dark:bg-neutral-700 shadow-sm text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-neutral-400"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Posts
          </button>
        </div>
      </div>

      {/* Current Featured Posts */}
      {tab === "current" && (
        <div className="space-y-4">
          {(!featuredPosts || featuredPosts.length === 0) && (
            <div className="py-20 text-center text-slate-400 dark:text-neutral-600">
              <Star className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-bold">No featured posts yet</p>
              <p className="text-xs mt-1">Switch to &quot;Add Posts&quot; to pick posts from your workspaces</p>
            </div>
          )}

          {/* Group by category */}
          {(["social", "appstore", "ads"] as const).map((cat) => {
            const posts = featuredPosts?.filter((p) => p.category === cat) ?? [];
            if (posts.length === 0) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${CAT_STYLE[cat]}`}>
                    {cat} ({posts.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {posts.map((fp) => (
                    <div key={fp._id} className="group relative">
                      <FeaturedPostPreview
                        code={fp.componentCode}
                        theme={fp.theme}
                        size={200}
                        aspect={cat === "appstore" ? "9:16" : cat === "ads" ? "16:9" : "1:1"}
                      />
                      <div className="mt-2 flex items-center justify-between px-1">
                        <span className="text-[11px] font-bold truncate flex-1">{fp.label}</span>
                        <button
                          onClick={() => handleRemove(fp._id)}
                          disabled={loading === fp._id}
                          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          {loading === fp._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Posts Picker */}
      {tab === "add" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800/50 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-neutral-400">Category:</span>
              {(["social", "appstore", "ads"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                    category === cat
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : "bg-white dark:bg-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-neutral-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-neutral-400">Theme:</span>
              {THEME_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTheme(i)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    selectedTheme === i
                      ? "border-slate-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ring-slate-300 dark:ring-neutral-600"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: preset.theme.primary }}
                  title={preset.name}
                />
              ))}
              <span className="text-[10px] text-slate-400 dark:text-neutral-600 ml-1">
                {THEME_PRESETS[selectedTheme].name}
              </span>
            </div>
          </div>

          {/* Posts grid with previews */}
          {(!allPosts || allPosts.length === 0) ? (
            <div className="py-20 text-center text-slate-400 dark:text-neutral-600 text-sm">
              No workspace posts found.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {allPosts.map((post) => {
                const alreadyFeatured = featuredPosts?.some(
                  (fp) => fp.componentCode === post.componentCode
                );
                return (
                  <div key={post._id} className="group">
                    {/* Preview */}
                    <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800/50">
                      <FeaturedPostPreview
                        code={post.componentCode}
                        theme={THEME_PRESETS[selectedTheme].theme}
                        size={220}
                        aspect={category === "appstore" ? "9:16" : category === "ads" ? "16:9" : "1:1"}
                      />
                      {/* Overlay button */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <button
                          onClick={() => handleAdd(post)}
                          disabled={loading === post._id || alreadyFeatured}
                          className={`opacity-0 group-hover:opacity-100 transition-all px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                            alreadyFeatured
                              ? "bg-emerald-500 text-white cursor-default opacity-100"
                              : "bg-white text-slate-900 hover:bg-slate-100 active:scale-95"
                          }`}
                        >
                          {loading === post._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : alreadyFeatured ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Add to {category}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {/* Label */}
                    <div className="mt-2 px-1">
                      <p className="text-[11px] font-bold truncate">{post.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-600">
                        {post.language} &middot; {post.device}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
