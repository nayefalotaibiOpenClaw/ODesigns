"use client";

import React, { useState, useEffect } from "react";
import { Clock, Check, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

interface Preset {
  _id: string;
  name: string;
  slug: string;
  mode: "product" | "image-edit";
  group: string;
}

interface Preferences {
  defaultPresetSlugs: string[];
  defaultMode: "product" | "image-edit";
  schedule: "off" | "daily" | "weekly" | "monthly";
  scheduleDayOfWeek?: number;
  scheduleDayOfMonth?: number;
  scheduleHour?: number;
}

interface AutopilotSettingsProps {
  presets: Preset[];
  preferences: Preferences | null;
  onSave: (prefs: Omit<Preferences, "defaultPresetSlugs"> & { defaultPresetSlugs: string[] }) => Promise<void>;
}

const SCHEDULE_OPTIONS = ["off", "daily", "weekly", "monthly"] as const;
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AutopilotSettings({ presets, preferences, onSave }: AutopilotSettingsProps) {
  const { t } = useLocale();
  const [schedule, setSchedule] = useState<"off" | "daily" | "weekly" | "monthly">(preferences?.schedule || "off");
  const [dayOfWeek, setDayOfWeek] = useState(preferences?.scheduleDayOfWeek ?? 1);
  const [dayOfMonth, setDayOfMonth] = useState(preferences?.scheduleDayOfMonth ?? 1);
  const [hour, setHour] = useState(preferences?.scheduleHour ?? 9);
  const [mode, setMode] = useState<"product" | "image-edit">(preferences?.defaultMode || "product");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(preferences?.defaultPresetSlugs || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (preferences) {
      setSchedule(preferences.schedule);
      setDayOfWeek(preferences.scheduleDayOfWeek ?? 1);
      setDayOfMonth(preferences.scheduleDayOfMonth ?? 1);
      setHour(preferences.scheduleHour ?? 9);
      setMode(preferences.defaultMode);
      setSelectedSlugs(preferences.defaultPresetSlugs);
    }
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        defaultPresetSlugs: selectedSlugs,
        defaultMode: mode,
        schedule,
        scheduleDayOfWeek: schedule === "weekly" ? dayOfWeek : undefined,
        scheduleDayOfMonth: schedule === "monthly" ? dayOfMonth : undefined,
        scheduleHour: schedule !== "off" ? hour : undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const toggleSlug = (slug: string) => {
    setSelectedSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const filteredPresets = presets.filter(p => p.mode === mode);

  return (
    <div className="space-y-6 p-4">
      {/* Coming Soon banner */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={16} className="text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t("photoshoot.comingSoon" as TranslationKey)}</span>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400/80">{t("photoshoot.autopilotDesc" as TranslationKey)}</p>
      </div>

      {/* Schedule */}
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">{t("photoshoot.schedule" as TranslationKey)}</label>
        <div className="flex gap-1.5">
          {SCHEDULE_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setSchedule(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                schedule === opt
                  ? "bg-slate-900 dark:bg-white text-white dark:text-black"
                  : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"
              }`}
            >
              {t(`photoshoot.schedule${opt.charAt(0).toUpperCase() + opt.slice(1)}` as TranslationKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Day/Hour selectors */}
      {schedule !== "off" && (
        <div className="flex gap-3">
          {schedule === "weekly" && (
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase mb-1 block">Day</label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-neutral-300"
              >
                {DAYS_OF_WEEK.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
          )}
          {schedule === "monthly" && (
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase mb-1 block">Day</label>
              <select
                value={dayOfMonth}
                onChange={e => setDayOfMonth(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-neutral-300"
              >
                {Array.from({ length: 28 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase mb-1 block">Hour</label>
            <select
              value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-neutral-300"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Default Mode */}
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">{t("photoshoot.defaultMode" as TranslationKey)}</label>
        <div className="flex gap-1.5">
          {(["product", "image-edit"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-slate-900 dark:bg-white text-white dark:text-black"
                  : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"
              }`}
            >
              {t(`photoshoot.mode${m === "product" ? "Product" : "ImageEdit"}` as TranslationKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Default Presets */}
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">{t("photoshoot.defaultPresets" as TranslationKey)}</label>
        <div className="flex flex-wrap gap-1.5">
          {filteredPresets.map(preset => {
            const isSelected = selectedSlugs.includes(preset.slug);
            return (
              <button
                key={preset._id}
                onClick={() => toggleSlug(preset.slug)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isSelected
                    ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700"
                    : "bg-slate-50 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600"
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : saved ? (
          <>
            <Check size={14} />
            {t("photoshoot.preferencesSaved" as TranslationKey)}
          </>
        ) : (
          t("photoshoot.savePreferences" as TranslationKey)
        )}
      </button>
    </div>
  );
}
