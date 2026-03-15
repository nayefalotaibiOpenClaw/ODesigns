"use client";

import { useState, useCallback } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FloatingNav from "@/app/components/FloatingNav";
import {
  Loader2,
  Upload,
  RotateCcw,
  Eye,
  Camera,
  Box,
  ArrowUp,
  Sparkles,
  Star,
  Search,
  Download,
  Check,
  ChevronDown,
  Image as ImageIcon,
  X,
  Package,
  Pencil,
} from "lucide-react";

// ─── Angle presets ────────────────────────────────────────────────
const ANGLE_PRESETS = [
  { id: "front-clean", label: "Front Clean", icon: Eye, description: "Clean front view, white background" },
  { id: "three-quarter", label: "3/4 Angle", icon: Box, description: "45° perspective view" },
  { id: "side-view", label: "Side View", icon: RotateCcw, description: "Direct side profile" },
  { id: "top-down", label: "Top Down", icon: ArrowUp, description: "Bird's eye flat lay" },
  { id: "slight-tilt", label: "Dynamic Tilt", icon: Sparkles, description: "Energetic 15° tilt" },
  { id: "close-up", label: "Close-Up", icon: Search, description: "Macro detail shot" },
  { id: "lifestyle", label: "Lifestyle", icon: Camera, description: "In-context lifestyle setting" },
  { id: "hero-angle", label: "Hero Angle", icon: Star, description: "Dramatic low-angle hero shot" },
];

interface GeneratedImage {
  angle: string;
  imageBase64?: string;
  mimeType?: string;
  description?: string;
  error?: string;
}

export default function ProductEditPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const workspaces = useQuery(api.workspaces.listByUser, user ? {} : "skip");

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const [editMode, setEditMode] = useState<"product" | "image-edit">("product");
  const [sourceMode, setSourceMode] = useState<"upload" | "asset">("upload");
  const [sourceImage, setSourceImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<Id<"assets"> | null>(null);
  const [selectedAngles, setSelectedAngles] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

  // Get assets for selected workspace
  const assets = useQuery(
    api.assets.listForWorkspace,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : "skip"
  );

  // Auto-select first workspace
  const firstWs = workspaces?.[0]?._id;
  if (firstWs && !selectedWorkspaceId) {
    setSelectedWorkspaceId(firstWs);
  }

  // Product-type assets only
  const productAssets = assets?.filter((a) => !a.archived) || [];

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [header, base64] = dataUrl.split(",");
      const mimeType = header.match(/data:(.*?);/)?.[1] || "image/png";
      setSourceImage({ base64, mimeType, preview: dataUrl });
      setSelectedAssetId(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle asset selection
  const handleAssetSelect = useCallback(
    async (asset: { _id: Id<"assets">; url?: string | null; fileName: string }) => {
      if (!asset.url) return;
      setSelectedAssetId(asset._id);
      try {
        const resp = await fetch(asset.url);
        const blob = await resp.blob();
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const [header, base64] = dataUrl.split(",");
          const mimeType = header.match(/data:(.*?);/)?.[1] || "image/png";
          setSourceImage({ base64, mimeType, preview: dataUrl });
        };
        reader.readAsDataURL(blob);
      } catch {
        // ignore
      }
    },
    []
  );

  // Toggle angle selection
  const toggleAngle = (id: string) => {
    setSelectedAngles((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Select all / deselect all angles
  const selectAllAngles = () => {
    if (selectedAngles.length === ANGLE_PRESETS.length) {
      setSelectedAngles([]);
    } else {
      setSelectedAngles(ANGLE_PRESETS.map((a) => a.id));
    }
  };

  // Generate
  const handleGenerate = async () => {
    if (!sourceImage || selectedAngles.length === 0) return;
    setGenerating(true);
    setResults([]);

    try {
      const anglesToSend = useCustom ? [...selectedAngles, "custom"] : selectedAngles;

      const resp = await fetch("/api/product-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: sourceImage.base64,
          mimeType: sourceImage.mimeType,
          angles: anglesToSend,
          customPrompt: useCustom ? customPrompt : undefined,
          mode: editMode,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        console.error("Generation error:", err);
        return;
      }

      const data = await resp.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Download a generated image
  const downloadImage = (img: GeneratedImage) => {
    if (!img.imageBase64 || !img.mimeType) return;
    const link = document.createElement("a");
    link.href = `data:${img.mimeType};base64,${img.imageBase64}`;
    link.download = `product-${img.angle}.png`;
    link.click();
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <FloatingNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Angle Generator</h1>
              <p className="text-sm text-white/50">
                Generate different angles of any image using AI — powered by Gemini
              </p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setEditMode("product")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                editMode === "product"
                  ? "border-violet-500 bg-violet-500/15 text-violet-300"
                  : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70"
              }`}
            >
              <Package className="w-4 h-4" />
              Product Mode
              <span className="text-[10px] text-white/30 ml-1">Clean white BG</span>
            </button>
            <button
              onClick={() => setEditMode("image-edit")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                editMode === "image-edit"
                  ? "border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-300"
                  : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70"
              }`}
            >
              <Pencil className="w-4 h-4" />
              Image Edit Mode
              <span className="text-[10px] text-white/30 ml-1">Keep scene</span>
            </button>
          </div>

          {/* Workspace selector */}
          {workspaces && workspaces.length > 1 && (
            <div className="relative mt-4 w-fit">
              <button
                onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
              >
                {workspaces.find((w) => w._id === selectedWorkspaceId)?.name || "Select workspace"}
                <ChevronDown className="w-4 h-4 text-white/40" />
              </button>
              {showWorkspaceDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-neutral-900 border border-white/10 rounded-lg shadow-xl z-50 py-1">
                  {workspaces.map((w) => (
                    <button
                      key={w._id}
                      onClick={() => {
                        setSelectedWorkspaceId(w._id);
                        setShowWorkspaceDropdown(false);
                        setSelectedAssetId(null);
                        setSourceImage(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors ${
                        w._id === selectedWorkspaceId ? "text-violet-400" : "text-white/70"
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left: Source Image ───────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h2 className="text-sm font-semibold text-white/80 mb-3">Source Image</h2>

              {/* Mode toggle */}
              <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-4">
                <button
                  onClick={() => setSourceMode("upload")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                    sourceMode === "upload" ? "bg-violet-600 text-white" : "text-white/50 hover:text-white/70"
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setSourceMode("asset")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                    sourceMode === "asset" ? "bg-violet-600 text-white" : "text-white/50 hover:text-white/70"
                  }`}
                >
                  From Assets
                </button>
              </div>

              {sourceMode === "upload" ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-violet-500/50 transition-colors">
                    {sourceImage && !selectedAssetId ? (
                      <div className="relative">
                        <img
                          src={sourceImage.preview}
                          alt="Source"
                          className="max-h-52 mx-auto rounded-lg object-contain"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSourceImage(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-white/30 mb-2" />
                        <p className="text-sm text-white/40">Drop or click to upload</p>
                        <p className="text-xs text-white/20 mt-1">PNG, JPG, WebP — Max 10MB</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {productAssets.length === 0 ? (
                    <p className="text-sm text-white/30 text-center py-8">No assets in this workspace</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {productAssets.map((asset) => (
                        <button
                          key={asset._id}
                          onClick={() => handleAssetSelect(asset)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedAssetId === asset._id
                              ? "border-violet-500 ring-2 ring-violet-500/30"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          {asset.url && (
                            <img
                              src={asset.url}
                              alt={asset.label || asset.fileName}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {selectedAssetId === asset._id && (
                            <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-violet-300" />
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                            <p className="text-[10px] text-white/70 truncate">
                              {asset.label || asset.type}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview of selected source */}
              {sourceImage && sourceMode === "asset" && (
                <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={sourceImage.preview}
                    alt="Selected"
                    className="w-full max-h-44 object-contain bg-neutral-900"
                  />
                </div>
              )}
            </div>

            {/* ─── Angle Presets ────────────────────────────────── */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white/80">Angles</h2>
                <button
                  onClick={selectAllAngles}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {selectedAngles.length === ANGLE_PRESETS.length ? "Deselect all" : "Select all (8)"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ANGLE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const selected = selectedAngles.includes(preset.id);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => toggleAngle(preset.id)}
                      className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all ${
                        selected
                          ? "border-violet-500 bg-violet-500/10 text-white"
                          : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white/80"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${selected ? "text-violet-400" : ""}`} />
                      <div>
                        <p className="text-xs font-medium">{preset.label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{preset.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom prompt */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={useCustom}
                    onChange={(e) => setUseCustom(e.target.checked)}
                    className="accent-violet-500"
                  />
                  <span className="text-xs text-white/60">Add custom prompt</span>
                </label>
                {useCustom && (
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Show product floating with dramatic lighting and smoke effects..."
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
                  />
                )}
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!sourceImage || selectedAngles.length === 0 || generating}
                className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  !sourceImage || selectedAngles.length === 0 || generating
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/20"
                }`}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating {selectedAngles.length + (useCustom ? 1 : 0)} angle
                    {selectedAngles.length + (useCustom ? 1 : 0) !== 1 ? "s" : ""}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {selectedAngles.length + (useCustom ? 1 : 0)} Angle
                    {selectedAngles.length + (useCustom ? 1 : 0) !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ─── Right: Results ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 min-h-[500px]">
              <h2 className="text-sm font-semibold text-white/80 mb-4">Generated Angles</h2>

              {results.length === 0 && !generating ? (
                <div className="flex flex-col items-center justify-center py-24 text-white/20">
                  <ImageIcon className="w-12 h-12 mb-3" />
                  <p className="text-sm">Select an image and angles, then hit generate</p>
                </div>
              ) : generating ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
                  <p className="text-sm text-white/40">
                    {editMode === "image-edit"
                      ? "Re-rendering image from new angles with Gemini..."
                      : "Generating product angles with Gemini..."}
                  </p>
                  <p className="text-xs text-white/20 mt-1">This may take 30-60 seconds</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.map((result, i) => {
                    const preset = ANGLE_PRESETS.find((p) => p.id === result.angle);
                    return (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10 overflow-hidden bg-neutral-900 group"
                      >
                        {result.error ? (
                          <div className="aspect-square flex items-center justify-center bg-red-500/5">
                            <div className="text-center p-4">
                              <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                              <p className="text-sm text-red-400">{result.error}</p>
                              <p className="text-xs text-white/30 mt-1">{preset?.label || result.angle}</p>
                            </div>
                          </div>
                        ) : result.imageBase64 ? (
                          <>
                            <div
                              className="aspect-square relative cursor-pointer"
                              onClick={() =>
                                setPreviewImage(`data:${result.mimeType};base64,${result.imageBase64}`)
                              }
                            >
                              <img
                                src={`data:${result.mimeType};base64,${result.imageBase64}`}
                                alt={preset?.label || result.angle}
                                className="w-full h-full object-contain bg-white"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Eye className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="p-3 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{preset?.label || result.angle}</p>
                                {result.description && (
                                  <p className="text-xs text-white/30 mt-0.5 line-clamp-1">
                                    {result.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => downloadImage(result)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-white/60" />
                              </button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Full-screen preview modal ───────────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
