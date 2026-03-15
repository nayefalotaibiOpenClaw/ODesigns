"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Camera, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MobileNavMenu from "./MobileNavMenu";
import { type SidebarTab } from "./Sidebar";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";
import PresetGrid from "./photoshoot/PresetGrid";
import ProductSelector from "./photoshoot/ProductSelector";
import ResultGallery from "./photoshoot/ResultGallery";
import AutopilotSettings from "./photoshoot/AutopilotSettings";
import CustomPresetDialog from "./photoshoot/CustomPresetDialog";

interface PhotoshootPageProps {
  workspaceId: Id<"workspaces">;
  userId: Id<"users">;
  activeTab: SidebarTab;
  onTabClick: (tab: SidebarTab) => void;
  workspaces?: { _id: string; name: string }[];
  currentWorkspaceId?: string;
  currentWorkspaceName?: string;
}

export default function PhotoshootPage({
  workspaceId,
  userId,
  activeTab,
  onTabClick,
  workspaces,
  currentWorkspaceId,
  currentWorkspaceName,
}: PhotoshootPageProps) {
  const { t } = useLocale();
  const [subTab, setSubTab] = useState<"studio" | "autopilot">("studio");
  const [mode, setMode] = useState<"product" | "image-edit">("product");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Convex queries
  const assets = useQuery(api.assets.listForWorkspace, { workspaceId });
  const presets = useQuery(api.photoshootPresets.listForWorkspace, { workspaceId });
  const results = useQuery(api.photoshootResults.listByWorkspace, { workspaceId });
  const preferences = useQuery(api.photoshootPreferences.getByWorkspace, { workspaceId });
  const usage = useQuery(api.subscriptions.getUsage);
  const canPhotoshoot = useQuery(api.subscriptions.canPhotoshoot, { imagesCount: Math.max(1, selectedSlugs.length) });

  // Convex mutations
  const createResult = useMutation(api.photoshootResults.create);
  const saveToAssets = useMutation(api.photoshootResults.saveToAssets);
  const archiveResult = useMutation(api.photoshootResults.archive);
  const createPreset = useMutation(api.photoshootPresets.create);
  const upsertPreferences = useMutation(api.photoshootPreferences.upsert);
  const incrementPhotoshoot = useMutation(api.subscriptions.incrementPhotoshoot);
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);

  // Computed values
  const selectedAsset = useMemo(() => {
    if (!selectedAssetId || !assets) return null;
    return assets.find(a => a._id === selectedAssetId) || null;
  }, [selectedAssetId, assets]);

  const photoshootedAssetIds = useMemo(() => {
    if (!results) return new Set<string>();
    return new Set(results.map(r => r.sourceAssetId));
  }, [results]);

  // Results with URLs (resolved server-side by Convex query)
  const resultsWithUrls = useMemo(() => {
    if (!results) return [];
    return results.map(r => ({
      ...r,
      resultFileUrl: r.resultFileUrl || undefined,
    }));
  }, [results]);

  const togglePreset = useCallback((slug: string) => {
    setSelectedSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  }, []);

  // Generate photoshoot images
  const handleGenerate = async () => {
    if (!selectedAsset || selectedSlugs.length === 0 || generating) return;

    // Guard: ensure presets are loaded before resolving
    if (!presets) {
      setGenerateError("Loading presets, please try again...");
      return;
    }

    // Guard: asset must have a URL
    if (!selectedAsset.url) {
      setGenerateError("Selected asset has no URL available");
      return;
    }

    // Check limits
    if (canPhotoshoot && !canPhotoshoot.allowed) {
      setShowLimitModal(true);
      return;
    }

    setGenerating(true);
    setGenerateError(null);

    try {
      // Get the asset URL and fetch its base64
      const assetUrl = selectedAsset.url;

      const imgRes = await fetch(assetUrl);
      const blob = await imgRes.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      const mimeType = blob.type || "image/png";

      // Resolve preset slugs to prompts from Convex-stored presets
      const presetMap = new Map((presets || []).map(p => [p.slug, p]));
      const resolvedPrompts: Record<string, string> = {};
      for (const slug of selectedSlugs) {
        if (slug === "custom") continue;
        const preset = presetMap.get(slug);
        if (preset) resolvedPrompts[slug] = preset.prompt;
      }

      // Call the API with resolved prompts
      const res = await fetch("/api/product-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          angles: selectedSlugs,
          prompts: resolvedPrompts,
          customPrompt: customPrompt || undefined,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      // Upload results to Convex storage and create records
      const genResults = data.results || [];
      let successCount = 0;

      for (const result of genResults) {
        if (result.error) {
          await createResult({
            workspaceId,
            sourceAssetId: selectedAssetId as Id<"assets">,
            presetSlug: result.angle,
            mode,
            status: "failed",
            errorMessage: result.error,
          });
          continue;
        }

        if (result.imageBase64) {
          try {
            // Upload image to Convex storage
            const uploadUrl = await generateUploadUrl();
            const imageBytes = Uint8Array.from(atob(result.imageBase64), c => c.charCodeAt(0));
            const imageBlob = new Blob([imageBytes], { type: result.mimeType || "image/png" });

            const uploadRes = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": imageBlob.type },
              body: imageBlob,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const { storageId } = await uploadRes.json();

            await createResult({
              workspaceId,
              sourceAssetId: selectedAssetId as Id<"assets">,
              resultFileId: storageId,
              presetSlug: result.angle,
              customPrompt: result.angle === "custom" ? customPrompt : undefined,
              mode,
              status: "completed",
            });
            successCount++;
          } catch (err) {
            console.error("Failed to save result:", err);
            await createResult({
              workspaceId,
              sourceAssetId: selectedAssetId as Id<"assets">,
              presetSlug: result.angle,
              mode,
              status: "failed",
              errorMessage: "Failed to save image",
            });
          }
        }
      }

      // Increment usage
      if (successCount > 0) {
        try {
          const usageResult = await incrementPhotoshoot({ imagesGenerated: successCount });
          if (usageResult?.limitReached) {
            setShowLimitModal(true);
          }
        } catch {
          // Usage tracking failure is non-fatal
        }
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  // Save result to assets
  const handleSaveToAssets = async (resultId: string) => {
    setSavingIds(prev => new Set(prev).add(resultId));
    try {
      await saveToAssets({
        id: resultId as Id<"photoshootResults">,
        fileName: `photoshoot-${Date.now()}.png`,
      });
    } catch (err) {
      console.error("Failed to save to assets:", err);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(resultId);
        return next;
      });
    }
  };

  // Archive result
  const handleArchive = async (resultId: string) => {
    try {
      await archiveResult({ id: resultId as Id<"photoshootResults"> });
    } catch (err) {
      console.error("Failed to archive:", err);
    }
  };

  // Download result
  const handleDownload = async (_resultId: string, url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `photoshoot-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // Download failure is non-fatal
    }
  };

  // Create custom preset
  const handleCreatePreset = async (data: {
    name: string;
    prompt: string;
    mode: "product" | "image-edit";
    group: "angles" | "social" | "lifestyle" | "creative" | "custom";
    description?: string;
  }) => {
    await createPreset({
      workspaceId,
      name: data.name,
      prompt: data.prompt,
      mode: data.mode,
      group: data.group,
      description: data.description,
    });
  };

  // Save autopilot preferences
  const handleSavePreferences = async (prefs: {
    defaultPresetSlugs: string[];
    defaultMode: "product" | "image-edit";
    schedule: "off" | "daily" | "weekly" | "monthly";
    scheduleDayOfWeek?: number;
    scheduleDayOfMonth?: number;
    scheduleHour?: number;
  }) => {
    await upsertPreferences({
      workspaceId,
      ...prefs,
    });
  };

  const photoshootUsed = usage?.photoshootImagesUsed || 0;
  const photoshootLimit = usage?.photoshootImagesLimit || 0;

  return (
    <div className="flex-1 bg-white dark:bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Floating nav */}
      <div className="shrink-0 pt-4 pb-2 px-6 relative z-[90]">
        <nav className="max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-700/50 rounded-full shadow-sm px-5 h-14 flex items-center gap-4">
          <div className="md:hidden">
            <MobileNavMenu
              activeTab={activeTab}
              onTabClick={onTabClick}
              workspaces={workspaces}
              currentWorkspaceId={currentWorkspaceId}
              currentWorkspaceName={currentWorkspaceName}
            />
          </div>
          <span className="hidden md:flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white shrink-0">
            <Camera size={14} />
            {t("photoshoot.title" as TranslationKey)}
          </span>

          <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700" />

          {/* Sub-tab switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-neutral-800 rounded-full p-0.5">
            {(["studio", "autopilot"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  subTab === tab
                    ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300"
                }`}
              >
                {t(`photoshoot.${tab}` as TranslationKey)}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Usage indicator */}
          {photoshootLimit > 0 && (
            <span className="hidden sm:inline text-xs text-slate-400 dark:text-neutral-500">
              {t("photoshoot.imagesUsed" as TranslationKey).replace("{used}", String(photoshootUsed)).replace("{limit}", String(photoshootLimit))}
            </span>
          )}
        </nav>
      </div>

      {/* Content */}
      {subTab === "studio" ? (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Controls */}
              <div className="lg:col-span-4 space-y-5">
                {/* Mode toggle */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">{t("photoshoot.mode" as TranslationKey)}</label>
                  <div className="flex gap-1.5">
                    {(["product", "image-edit"] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
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

                {/* Product selector */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">{t("photoshoot.selectProduct" as TranslationKey)}</label>
                  <ProductSelector
                    assets={(assets || []).map(a => ({
                      _id: a._id,
                      fileName: a.fileName,
                      url: a.url || undefined,
                      type: a.type,
                      label: a.label || undefined,
                    }))}
                    selectedAssetId={selectedAssetId}
                    onSelect={setSelectedAssetId}
                    photoshootedAssetIds={photoshootedAssetIds}
                  />
                </div>

                {/* Preset grid */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                    {t("photoshoot.selectPresets" as TranslationKey)}
                    {selectedSlugs.length > 0 && (
                      <span className="ml-2 text-emerald-600 dark:text-emerald-400 normal-case">
                        {t("photoshoot.selected" as TranslationKey).replace("{count}", String(selectedSlugs.length))}
                      </span>
                    )}
                  </label>
                  <PresetGrid
                    presets={(presets || []).map(p => ({
                      _id: p._id,
                      name: p.name,
                      slug: p.slug,
                      description: p.description || undefined,
                      prompt: p.prompt,
                      mode: p.mode,
                      group: p.group,
                      scope: p.scope,
                    }))}
                    selectedSlugs={selectedSlugs}
                    onToggle={togglePreset}
                    mode={mode}
                    onCreateCustom={() => setShowCustomDialog(true)}
                  />
                </div>

                {/* Custom prompt */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">{t("photoshoot.customPrompt" as TranslationKey)}</label>
                  <textarea
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder={t("photoshoot.customPromptPlaceholder" as TranslationKey)}
                    className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                    rows={3}
                    maxLength={2000}
                  />
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={!selectedAsset || selectedSlugs.length === 0 || generating}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t("photoshoot.generating" as TranslationKey)}
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      {t("photoshoot.generate" as TranslationKey)} ({selectedSlugs.length})
                    </>
                  )}
                </button>

                {/* Error */}
                {generateError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 dark:text-red-400">{generateError}</p>
                  </div>
                )}
              </div>

              {/* Right: Results */}
              <div className="lg:col-span-8">
                <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-3 block">{t("photoshoot.results" as TranslationKey)}</label>
                <ResultGallery
                  results={resultsWithUrls}
                  savingIds={savingIds}
                  onSave={handleSaveToAssets}
                  onArchive={handleArchive}
                  onDownload={handleDownload}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <AutopilotSettings
              presets={(presets || []).map(p => ({
                _id: p._id,
                name: p.name,
                slug: p.slug,
                mode: p.mode,
                group: p.group,
              }))}
              preferences={preferences ? {
                defaultPresetSlugs: preferences.defaultPresetSlugs,
                defaultMode: preferences.defaultMode,
                schedule: preferences.schedule,
                scheduleDayOfWeek: preferences.scheduleDayOfWeek,
                scheduleDayOfMonth: preferences.scheduleDayOfMonth,
                scheduleHour: preferences.scheduleHour,
              } : null}
              onSave={handleSavePreferences}
            />
          </div>
        </div>
      )}

      {/* Custom Preset Dialog */}
      <CustomPresetDialog
        open={showCustomDialog}
        onClose={() => setShowCustomDialog(false)}
        onSave={handleCreatePreset}
      />

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLimitModal(false)} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-700 p-6 max-w-sm mx-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t("photoshoot.limitReached" as TranslationKey)}</h3>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mb-4">
              {t("photoshoot.imagesUsed" as TranslationKey).replace("{used}", String(photoshootUsed)).replace("{limit}", String(photoshootLimit))}
            </p>
            <button
              onClick={() => setShowLimitModal(false)}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
