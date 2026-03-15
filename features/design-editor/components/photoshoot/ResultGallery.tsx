"use client";

import React from "react";
import { Check, Download, Archive, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

interface PhotoshootResult {
  _id: string;
  presetSlug: string;
  status: "completed" | "failed" | "saved";
  resultFileUrl?: string;
  errorMessage?: string;
  createdAt: number;
}

interface ResultGalleryProps {
  results: PhotoshootResult[];
  savingIds: Set<string>;
  onSave: (resultId: string) => void;
  onArchive: (resultId: string) => void;
  onDownload: (resultId: string, url: string) => void;
}

export default function ResultGallery({ results, savingIds, onSave, onArchive, onDownload }: ResultGalleryProps) {
  const { t } = useLocale();

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <p className="text-sm text-slate-400 dark:text-neutral-500">{t("photoshoot.results" as TranslationKey)}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {results.map(result => {
        const isSaved = result.status === "saved";
        const isSaving = savingIds.has(result._id);

        if (result.status === "failed") {
          return (
            <div key={result._id} className="aspect-square rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 flex flex-col items-center justify-center p-3">
              <p className="text-xs text-red-500 text-center">{result.errorMessage || "Failed"}</p>
              <p className="text-[10px] text-red-400 mt-1">{result.presetSlug}</p>
            </div>
          );
        }

        return (
          <div key={result._id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-700">
            {result.resultFileUrl ? (
              <img
                src={result.resultFileUrl}
                alt={result.presetSlug}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            )}

            {/* Saved overlay */}
            {isSaved && (
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Check size={10} />
                  {t("photoshoot.saved" as TranslationKey)}
                </div>
              </div>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {!isSaved && result.resultFileUrl && (
                <button
                  onClick={() => onSave(result._id)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {t("photoshoot.saveToAssets" as TranslationKey)}
                </button>
              )}
              {result.resultFileUrl && (
                <button
                  onClick={() => onDownload(result._id, result.resultFileUrl!)}
                  className="w-8 h-8 rounded-lg bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-800 transition-colors shadow-lg"
                >
                  <Download size={14} className="text-slate-700 dark:text-neutral-300" />
                </button>
              )}
              <button
                onClick={() => onArchive(result._id)}
                className="w-8 h-8 rounded-lg bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-800 transition-colors shadow-lg"
              >
                <Archive size={14} className="text-slate-700 dark:text-neutral-300" />
              </button>
            </div>

            {/* Preset label */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-[10px] text-white/80">{result.presetSlug}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
