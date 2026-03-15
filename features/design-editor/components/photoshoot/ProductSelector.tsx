"use client";

import React from "react";
import { Check, Package } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

interface ProductAsset {
  _id: string;
  fileName: string;
  url?: string;
  type: string;
  label?: string;
}

interface ProductSelectorProps {
  assets: ProductAsset[];
  selectedAssetId: string | null;
  onSelect: (assetId: string) => void;
  photoshootedAssetIds?: Set<string>;
}

export default function ProductSelector({ assets, selectedAssetId, onSelect, photoshootedAssetIds }: ProductSelectorProps) {
  const { t } = useLocale();

  const productAssets = assets.filter(a => a.type === "product" && a.url);

  if (productAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <Package size={20} className="text-slate-400 dark:text-neutral-500" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-neutral-400">{t("photoshoot.noProducts" as TranslationKey)}</p>
        <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">{t("photoshoot.noProductsDesc" as TranslationKey)}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {productAssets.map(asset => {
        const isSelected = selectedAssetId === asset._id;
        const hasPhotoshoot = photoshootedAssetIds?.has(asset._id);
        return (
          <button
            key={asset._id}
            onClick={() => onSelect(asset._id)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              isSelected
                ? "border-emerald-500 ring-2 ring-emerald-500/20"
                : "border-transparent hover:border-slate-300 dark:hover:border-neutral-600"
            }`}
          >
            {asset.url && (
              <img
                src={asset.url}
                alt={asset.label || asset.fileName}
                className="w-full h-full object-cover"
              />
            )}
            {isSelected && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              </div>
            )}
            {hasPhotoshoot && !isSelected && (
              <div className="absolute top-1 right-1">
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
              <p className="text-[10px] text-white truncate">{asset.label || asset.fileName}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
