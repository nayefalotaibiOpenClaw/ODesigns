"use client";

import { useState, useCallback, useEffect } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
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
  Hand,
  LayoutGrid,
  Play,
  Palette,
  Zap,
  Square,
  Leaf,
  Layers,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Timer,
} from "lucide-react";

// ─── Angle presets ────────────────────────────────────────────────
const ANGLE_PRESETS = [
  { id: "front-clean", label: "Front Clean", icon: Eye, description: "Clean front view, white background", group: "angles" },
  { id: "three-quarter", label: "3/4 Angle", icon: Box, description: "45° perspective view", group: "angles" },
  { id: "side-view", label: "Side View", icon: RotateCcw, description: "Direct side profile", group: "angles" },
  { id: "top-down", label: "Top Down", icon: ArrowUp, description: "Bird's eye flat lay", group: "angles" },
  { id: "slight-tilt", label: "Dynamic Tilt", icon: Sparkles, description: "Energetic 15° tilt", group: "angles" },
  { id: "close-up", label: "Close-Up", icon: Search, description: "Macro detail shot", group: "angles" },
  { id: "lifestyle", label: "Lifestyle", icon: Camera, description: "In-context lifestyle setting", group: "angles" },
  { id: "hero-angle", label: "Hero Angle", icon: Star, description: "Dramatic low-angle hero shot", group: "angles" },
  { id: "hand-holding", label: "Hand Model", icon: Hand, description: "Hand holding/presenting product", group: "social" },
  { id: "flat-lay-styled", label: "Styled Flat Lay", icon: LayoutGrid, description: "Aesthetic flat lay with props", group: "social" },
  { id: "in-use", label: "In Use", icon: Play, description: "Product being used naturally", group: "social" },
  { id: "gradient-bg", label: "Gradient BG", icon: Palette, description: "Modern vibrant gradient backdrop", group: "social" },
  { id: "splash-action", label: "Action Splash", icon: Zap, description: "Dynamic splash/motion effects", group: "social" },
  { id: "minimal-shadow", label: "Minimal Shadow", icon: Square, description: "Ultra-clean with dramatic shadow", group: "social" },
  { id: "seasonal-autumn", label: "Autumn Vibes", icon: Leaf, description: "Warm fall/cozy seasonal feel", group: "social" },
  { id: "texture-surface", label: "Texture Surface", icon: Layers, description: "Marble, wood, slate backdrop", group: "social" },
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
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [pollingJobId, setPollingJobId] = useState<Id<"batchJobs"> | null>(null);
  const [batchResults, setBatchResults] = useState<GeneratedImage[]>([]);
  const [showBatchPanel, setShowBatchPanel] = useState(false);

  const logAndIncrement = useMutation(api.aiUsage.logAndIncrement);
  const createBatchJob = useMutation(api.batchJobs.create);
  const updateBatchState = useMutation(api.batchJobs.updateState);

  // Batch jobs list (real-time from Convex)
  const batchJobs = useQuery(
    api.batchJobs.listByUser,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : {}
  );

  // Get assets for selected workspace
  const assets = useQuery(
    api.assets.listForWorkspace,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : "skip"
  );

  // Auto-select first workspace
  useEffect(() => {
    if (workspaces?.[0]?._id && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0]._id);
    }
  }, [workspaces, selectedWorkspaceId]);

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

      // Log AI usage for cost tracking
      if (data.usage && selectedWorkspaceId) {
        const successCount = (data.results || []).filter((r: GeneratedImage) => r.imageBase64).length;
        logAndIncrement({
          workspaceId: selectedWorkspaceId,
          category: "product_editing",
          model: data.usage.model || "gemini-3.1-flash-image-preview",
          promptTokens: data.usage.promptTokens || 0,
          completionTokens: data.usage.completionTokens || 0,
          totalTokens: data.usage.totalTokens || 0,
          endpoint: "/api/product-edit",
          metadata: JSON.stringify({
            imagesGenerated: successCount,
            anglesRequested: anglesToSend.length,
            mode: editMode,
            angles: anglesToSend,
          }),
        }).catch(console.error);
      }
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

  // ─── Batch: Submit job (50% cost) ──────────────────────────────
  const handleBatchSubmit = async () => {
    if (!sourceImage || selectedAngles.length === 0) return;
    setSubmittingBatch(true);

    try {
      const anglesToSend = useCustom ? [...selectedAngles, "custom"] : selectedAngles;
      const productKey = selectedAssetId || `upload-${Date.now()}`;

      const resp = await fetch("/api/product-edit/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: [
            {
              key: productKey,
              imageBase64: sourceImage.base64,
              mimeType: sourceImage.mimeType,
              angles: anglesToSend,
              customPrompt: useCustom ? customPrompt : undefined,
            },
          ],
          mode: editMode,
          displayName: `product-edit-${new Date().toISOString().slice(0, 10)}`,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        console.error("Batch error:", err);
        return;
      }

      const data = await resp.json();

      // Save to Convex
      await createBatchJob({
        workspaceId: selectedWorkspaceId || undefined,
        jobName: data.jobName,
        displayName: data.message || `Batch: ${anglesToSend.length} angles`,
        state: data.state || "JOB_STATE_PENDING",
        mode: editMode,
        totalRequests: data.totalRequests,
        productsCount: data.productsCount,
        inputFile: data.inputFile,
      });

      setShowBatchPanel(true);
    } catch (err) {
      console.error("Batch submit failed:", err);
    } finally {
      setSubmittingBatch(false);
    }
  };

  // ─── Batch: Poll job status ────────────────────────────────────
  const handlePollJob = async (jobId: Id<"batchJobs">, jobName: string) => {
    setPollingJobId(jobId);

    try {
      const resp = await fetch(`/api/product-edit/batch?jobName=${encodeURIComponent(jobName)}`);
      if (!resp.ok) {
        console.error("Poll error:", await resp.text());
        return;
      }

      const data = await resp.json();

      // Update state in Convex
      const updates: {
        id: Id<"batchJobs">;
        state: string;
        results?: string;
        usage?: string;
        completedAt?: number;
        errorMessage?: string;
      } = {
        id: jobId,
        state: data.state,
      };

      if (data.state === "JOB_STATE_SUCCEEDED" && data.results) {
        // Store only metadata (not base64 images — too large for Convex docs).
        // To view results again, we re-fetch from Gemini via the batch GET endpoint.
        const resultsSummary = data.results.map((r: { productKey?: string; angle: string; error?: string }) => ({
          productKey: r.productKey,
          angle: r.angle,
          error: r.error,
          success: !r.error,
        }));
        updates.results = JSON.stringify(resultsSummary);
        updates.completedAt = Date.now();
        if (data.usage) updates.usage = JSON.stringify(data.usage);

        // Show results in the UI
        setBatchResults(
          data.results.map((r: { productKey?: string; angle: string; imageBase64?: string; mimeType?: string; description?: string; error?: string }) => ({
            angle: r.angle,
            imageBase64: r.imageBase64,
            mimeType: r.mimeType,
            description: r.description,
            error: r.error,
          }))
        );

        // Log AI usage
        if (data.usage && selectedWorkspaceId) {
          const successCount = data.results.filter((r: { imageBase64?: string }) => r.imageBase64).length;
          logAndIncrement({
            workspaceId: selectedWorkspaceId,
            category: "product_editing",
            model: data.usage.model || "gemini-3.1-flash-image-preview",
            promptTokens: data.usage.promptTokens || 0,
            completionTokens: data.usage.completionTokens || 0,
            totalTokens: data.usage.totalTokens || 0,
            endpoint: "/api/product-edit/batch",
            metadata: JSON.stringify({
              imagesGenerated: successCount,
              mode: editMode,
              batch: true,
            }),
          }).catch(console.error);
        }
      } else if (data.state === "JOB_STATE_FAILED") {
        updates.errorMessage = "Batch job failed";
      }

      await updateBatchState(updates);
    } catch (err) {
      console.error("Poll failed:", err);
    } finally {
      setPollingJobId(null);
    }
  };

  // ─── Batch: View saved results ─────────────────────────────────
  const handleViewResults = async (jobId: Id<"batchJobs">) => {
    // Re-fetch results from Gemini batch API (images not stored in Convex due to size)
    const jobName = batchJobs?.find((j) => j._id === jobId)?.jobName;
    if (!jobName) return;
    try {
      const resp = await fetch(`/api/product-edit/batch?jobName=${encodeURIComponent(jobName)}`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.results) {
        setBatchResults(
          data.results.map((r: { angle: string; imageBase64?: string; mimeType?: string; description?: string; error?: string }) => ({
            angle: r.angle,
            imageBase64: r.imageBase64,
            mimeType: r.mimeType,
            description: r.description,
            error: r.error,
          }))
        );
        setResults([]);
      }
    } catch {
      // ignore
    }
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
                <h2 className="text-sm font-semibold text-white/80">Presets</h2>
                <div className="flex items-center gap-2">
                  {selectedAngles.length > 0 && (
                    <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                      {selectedAngles.length} selected
                    </span>
                  )}
                  <button
                    onClick={selectAllAngles}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {selectedAngles.length === ANGLE_PRESETS.length ? "Deselect all" : "Select all"}
                  </button>
                </div>
              </div>

              {/* Camera Angles */}
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Camera Angles</p>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {ANGLE_PRESETS.filter((p) => p.group === "angles").map((preset) => {
                  const Icon = preset.icon;
                  const selected = selectedAngles.includes(preset.id);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => toggleAngle(preset.id)}
                      className={`flex items-start gap-2 p-2 rounded-lg border text-left transition-all ${
                        selected
                          ? "border-violet-500 bg-violet-500/10 text-white"
                          : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white/80"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${selected ? "text-violet-400" : ""}`} />
                      <div>
                        <p className="text-xs font-medium">{preset.label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{preset.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Social Media Styles */}
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Social Media Styles</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ANGLE_PRESETS.filter((p) => p.group === "social").map((preset) => {
                  const Icon = preset.icon;
                  const selected = selectedAngles.includes(preset.id);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => toggleAngle(preset.id)}
                      className={`flex items-start gap-2 p-2 rounded-lg border text-left transition-all ${
                        selected
                          ? "border-fuchsia-500 bg-fuchsia-500/10 text-white"
                          : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white/80"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${selected ? "text-fuchsia-400" : ""}`} />
                      <div>
                        <p className="text-xs font-medium">{preset.label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{preset.description}</p>
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

              {/* Generate buttons */}
              <div className="mt-4 space-y-2">
                {/* Instant generate */}
                <button
                  onClick={handleGenerate}
                  disabled={!sourceImage || selectedAngles.length === 0 || generating}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
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
                      Generate Instant
                    </>
                  )}
                </button>

                {/* Batch generate (50% off) */}
                <button
                  onClick={handleBatchSubmit}
                  disabled={!sourceImage || selectedAngles.length === 0 || submittingBatch}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
                    !sourceImage || selectedAngles.length === 0 || submittingBatch
                      ? "bg-white/5 text-white/20 cursor-not-allowed border-white/5"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {submittingBatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting batch...
                    </>
                  ) : (
                    <>
                      <Timer className="w-4 h-4" />
                      Batch Generate
                      <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded-full">50% off</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ─── Batch Jobs Panel ───────────────────────────────── */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <button
                onClick={() => setShowBatchPanel(!showBatchPanel)}
                className="flex items-center justify-between w-full"
              >
                <h2 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Batch Jobs
                  {batchJobs && batchJobs.length > 0 && (
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-white/40">
                      {batchJobs.length}
                    </span>
                  )}
                </h2>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${showBatchPanel ? "rotate-180" : ""}`} />
              </button>

              {showBatchPanel && (
                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {!batchJobs || batchJobs.length === 0 ? (
                    <p className="text-xs text-white/30 text-center py-4">No batch jobs yet</p>
                  ) : (
                    batchJobs.map((job) => {
                      const isSucceeded = job.state === "JOB_STATE_SUCCEEDED";
                      const isFailed = job.state === "JOB_STATE_FAILED" || job.state === "JOB_STATE_EXPIRED";
                      const isPending = job.state === "JOB_STATE_PENDING" || job.state === "JOB_STATE_RUNNING";
                      const isPolling = pollingJobId === job._id;

                      return (
                        <div
                          key={job._id}
                          className="p-3 rounded-lg border border-white/10 bg-white/[0.02]"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {isSucceeded ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              ) : isFailed ? (
                                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                              ) : (
                                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                              )}
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                isSucceeded ? "bg-emerald-500/15 text-emerald-400"
                                : isFailed ? "bg-red-500/15 text-red-400"
                                : "bg-amber-500/15 text-amber-400"
                              }`}>
                                {job.state.replace("JOB_STATE_", "").toLowerCase()}
                              </span>
                            </div>
                            <span className="text-[10px] text-white/30">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-1.5">
                            <div className="text-[11px] text-white/50">
                              {job.totalRequests} images · {job.mode}
                              {job.usage && (() => {
                                try {
                                  const u = JSON.parse(job.usage);
                                  return ` · ${u.totalTokens?.toLocaleString()} tok`;
                                } catch { return ""; }
                              })()}
                            </div>

                            <div className="flex items-center gap-1">
                              {isPending && (
                                <button
                                  onClick={() => handlePollJob(job._id, job.jobName)}
                                  disabled={isPolling}
                                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                                  title="Check status"
                                >
                                  {isPolling ? (
                                    <Loader2 className="w-3.5 h-3.5 text-white/40 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3.5 h-3.5 text-white/40" />
                                  )}
                                </button>
                              )}
                              {isSucceeded && (
                                <button
                                  onClick={() => handleViewResults(job._id)}
                                  className="p-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                                  title="View results"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ─── Right: Results ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white/80">Generated Angles</h2>
                {batchResults.length > 0 && (
                  <button
                    onClick={() => setBatchResults([])}
                    className="text-[10px] text-white/30 hover:text-white/50"
                  >
                    Clear batch results
                  </button>
                )}
              </div>

              {/* Show batch results if any */}
              {batchResults.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-2 font-medium flex items-center gap-1">
                    <Timer className="w-3 h-3" /> Batch Results (50% off)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {batchResults.map((result, i) => {
                      const preset = ANGLE_PRESETS.find((p) => p.id === result.angle);
                      return (
                        <div key={`batch-${i}`} className="rounded-xl border border-emerald-500/20 overflow-hidden bg-neutral-900 group">
                          {result.error ? (
                            <div className="aspect-square flex items-center justify-center bg-red-500/5">
                              <div className="text-center p-4">
                                <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                <p className="text-sm text-red-400">{result.error}</p>
                              </div>
                            </div>
                          ) : result.imageBase64 ? (
                            <>
                              <div
                                className="aspect-square relative cursor-pointer"
                                onClick={() => setPreviewImage(`data:${result.mimeType};base64,${result.imageBase64}`)}
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
                                <p className="text-sm font-medium">{preset?.label || result.angle}</p>
                                <button onClick={() => downloadImage(result)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" title="Download">
                                  <Download className="w-4 h-4 text-white/60" />
                                </button>
                              </div>
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.length === 0 && batchResults.length === 0 && !generating ? (
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
