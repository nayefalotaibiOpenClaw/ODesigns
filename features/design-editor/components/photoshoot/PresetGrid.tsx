"use client";

import React, { useState } from "react";
import { Plus, Check, ChevronDown, ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

interface Preset {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  prompt: string;
  mode: "product" | "image-edit";
  group: "angles" | "social" | "lifestyle" | "creative" | "custom";
  scope: "global" | "workspace";
}

interface PresetGridProps {
  presets: Preset[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  mode: "product" | "image-edit";
  onCreateCustom: () => void;
}

const GROUP_ORDER = ["angles", "social", "lifestyle", "creative", "custom"] as const;
const GROUP_ICONS: Record<string, string> = {
  angles: "📐",
  social: "📱",
  lifestyle: "🏠",
  creative: "🎨",
  custom: "✨",
};

export default function PresetGrid({ presets, selectedSlugs, onToggle, mode, onCreateCustom }: PresetGridProps) {
  const { t } = useLocale();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  // Filter presets by current mode and group
  const filteredPresets = presets.filter(p => p.mode === mode);
  const grouped = GROUP_ORDER.map(group => ({
    group,
    presets: filteredPresets.filter(p => p.group === group),
  })).filter(g => g.presets.length > 0);

  return (
    <div className="space-y-3">
      {grouped.map(({ group, presets: groupPresets }) => {
        const isCollapsed = collapsedGroups.has(group);
        const selectedCount = groupPresets.filter(p => selectedSlugs.includes(p.slug)).length;
        const groupLabelKey = `photoshoot.${group}` as const;

        return (
          <div key={group}>
            <button
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-neutral-300 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>{GROUP_ICONS[group]}</span>
              <span>{t(groupLabelKey as TranslationKey)}</span>
              {selectedCount > 0 && (
                <span className="ml-auto bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {selectedCount}
                </span>
              )}
            </button>
            {!isCollapsed && (
              <div className="grid grid-cols-2 gap-1.5 px-1">
                {groupPresets.map(preset => {
                  const isSelected = selectedSlugs.includes(preset.slug);
                  return (
                    <button
                      key={preset._id}
                      onClick={() => onToggle(preset.slug)}
                      className={`relative px-3 py-2 rounded-lg text-left transition-all text-xs ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:border-slate-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      <span className="font-medium truncate block">{preset.name}</span>
                      {preset.scope === "workspace" && (
                        <span className="text-[9px] text-slate-400 dark:text-neutral-500">Custom</span>
                      )}
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Create Custom button */}
      <button
        onClick={onCreateCustom}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-neutral-600 text-slate-500 dark:text-neutral-400 hover:border-slate-400 dark:hover:border-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300 transition-colors text-xs font-medium"
      >
        <Plus size={14} />
        {t("photoshoot.createCustom" as TranslationKey)}
      </button>
    </div>
  );
}
