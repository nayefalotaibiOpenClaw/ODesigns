"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

interface CustomPresetDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    prompt: string;
    mode: "product" | "image-edit";
    group: "angles" | "social" | "lifestyle" | "creative" | "custom";
    description?: string;
  }) => Promise<void>;
}

const GROUPS = ["angles", "social", "lifestyle", "creative", "custom"] as const;

export default function CustomPresetDialog({ open, onClose, onSave }: CustomPresetDialogProps) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"product" | "image-edit">("product");
  const [group, setGroup] = useState<typeof GROUPS[number]>("custom");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prompt.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        prompt: prompt.trim(),
        mode,
        group,
        description: description.trim() || undefined,
      });
      setName("");
      setPrompt("");
      setMode("product");
      setGroup("custom");
      setDescription("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("photoshoot.createCustom" as TranslationKey)}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1 block">{t("photoshoot.customPresetName" as TranslationKey)}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              placeholder="e.g. Beach Scene"
              maxLength={100}
              required
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1 block">{t("photoshoot.customPresetPrompt" as TranslationKey)}</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
              rows={4}
              placeholder="Describe how the product should be photographed..."
              maxLength={2000}
              required
            />
          </div>

          {/* Mode */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1 block">{t("photoshoot.mode" as TranslationKey)}</label>
            <div className="flex gap-2">
              {(["product", "image-edit"] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    mode === m
                      ? "bg-slate-900 dark:bg-white text-white dark:text-black"
                      : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                  }`}
                >
                  {t(`photoshoot.mode${m === "product" ? "Product" : "ImageEdit"}` as TranslationKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Group */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1 block">{t("photoshoot.customPresetGroup" as TranslationKey)}</label>
            <select
              value={group}
              onChange={e => setGroup(e.target.value as typeof GROUPS[number])}
              className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
            >
              {GROUPS.map(g => (
                <option key={g} value={g}>{t(`photoshoot.${g}` as TranslationKey)}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {t("photoshoot.cancel" as TranslationKey)}
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !prompt.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {t("photoshoot.save" as TranslationKey)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
