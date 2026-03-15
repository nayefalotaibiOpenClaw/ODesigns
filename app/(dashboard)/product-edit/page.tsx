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
  Car,
  CircleDot,
  User,
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
  { id: "car-interior", label: "Car Interior", icon: Car, description: "Held inside luxury car, golden hour", group: "lifestyle" },
  { id: "car-hood", label: "Car Hood", icon: Car, description: "Product on classic car hood", group: "lifestyle" },
  { id: "car-window", label: "Car Window", icon: CircleDot, description: "Held out car window, blue sky", group: "lifestyle" },
  { id: "held-close-up", label: "Held Close-Up", icon: Hand, description: "Hands cradling product, editorial", group: "lifestyle" },
  { id: "person-holding", label: "Person Holding", icon: User, description: "Candid person holding product", group: "lifestyle" },
  { id: "drive-thru", label: "Drive-Thru", icon: Car, description: "Handoff through car window", group: "lifestyle" },
  { id: "group-table", label: "Group Table", icon: LayoutGrid, description: "Overhead table, many hands reaching", group: "lifestyle" },
  { id: "sauce-pour", label: "Sauce Pour", icon: Zap, description: "Action sauce drizzle, clean backdrop", group: "lifestyle" },
  { id: "pool-backdrop", label: "Pool Backdrop", icon: Palette, description: "Hands up against blue pool water", group: "lifestyle" },
  { id: "tray-serving", label: "Tray Serving", icon: Square, description: "Served on tray, restaurant feel", group: "lifestyle" },
  { id: "velvet-backdrop", label: "Velvet Backdrop", icon: Star, description: "Open palm, dark velvet curtain", group: "lifestyle" },
  { id: "floating-product", label: "Floating", icon: ArrowUp, description: "Levitating on cream background", group: "lifestyle" },
  { id: "nails-grip", label: "Nails Grip", icon: Hand, description: "Painted nails gripping, editorial", group: "lifestyle" },
  { id: "stacked-cross", label: "Stacked Cross", icon: Layers, description: "Vertical stack, cut cross-sections", group: "creative" },
  { id: "hands-compete", label: "Hands Compete", icon: Zap, description: "Multiple hands reaching, bold bg", group: "creative" },
  { id: "color-block", label: "Color Block", icon: Palette, description: "Two-tone split background, pop art", group: "creative" },
  { id: "wall-punch", label: "Wall Punch", icon: Sparkles, description: "Hands through torn paper wall", group: "creative" },
  { id: "duo-compare", label: "Duo Compare", icon: LayoutGrid, description: "Two hands holding, side by side", group: "creative" },
  { id: "extreme-macro", label: "Extreme Macro", icon: Search, description: "Ultra close-up textures and drips", group: "creative" },
  { id: "outfit-match", label: "Outfit Match", icon: User, description: "Monochrome outfit color story", group: "creative" },
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
  const [angleCounts, setAngleCounts] = useState<Record<string, number>>({});
  const [customPrompt, setCustomPrompt] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [customCount, setCustomCount] = useState(1);
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

  // Angle count helpers
  const getCount = (id: string) => angleCounts[id] || 0;
  const totalImages = Object.values(angleCounts).reduce((sum, c) => sum + c, 0);
  const selectedPresets = Object.keys(angleCounts).filter((k) => angleCounts[k] > 0);

  const incrementAngle = (id: string) => {
    setAngleCounts((prev) => ({ ...prev, [id]: Math.min((prev[id] || 0) + 1, 5) }));
  };
  const decrementAngle = (id: string) => {
    setAngleCounts((prev) => {
      const next = (prev[id] || 0) - 1;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };
  const toggleAngle = (id: string) => {
    if (getCount(id) > 0) {
      setAngleCounts((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    } else {
      incrementAngle(id);
    }
  };

  // Select all (1 each) / deselect all
  const selectAllAngles = () => {
    if (selectedPresets.length === ANGLE_PRESETS.length) {
      setAngleCounts({});
    } else {
      const all: Record<string, number> = {};
      ANGLE_PRESETS.forEach((a) => { all[a.id] = Math.max(angleCounts[a.id] || 0, 1); });
      setAngleCounts(all);
    }
  };

  // Build angles array with repeats from counts
  const buildAnglesArray = () => {
    const angles: string[] = [];
    for (const [id, count] of Object.entries(angleCounts)) {
      for (let i = 0; i < count; i++) angles.push(id);
    }
    if (useCustom) {
      for (let i = 0; i < customCount; i++) angles.push("custom");
    }
    return angles;
  };

  // Generate
  const handleGenerate = async () => {
    if (!sourceImage || totalImages === 0) return;
    setGenerating(true);
    setResults([]);

    try {
      const anglesToSend = buildAnglesArray();

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
            angleCounts,
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
    if (!sourceImage || totalImages === 0) return;
    setSubmittingBatch(true);

    try {
      const anglesToSend = buildAnglesArray();
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
          <div>
            <h1 className="text-2xl font-bold">AI Angle Generator</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Generate different angles of any image using AI
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setEditMode("product")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                editMode === "product"
                  ? "bg-white text-black border-white"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              }`}
            >
              <Package className="w-4 h-4" />
              Product Mode
            </button>
            <button
              onClick={() => setEditMode("image-edit")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                editMode === "image-edit"
                  ? "bg-white text-black border-white"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              }`}
            >
              <Pencil className="w-4 h-4" />
              Image Edit
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
                        w._id === selectedWorkspaceId ? "text-white" : "text-white/70"
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
              <div className="flex gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg mb-4">
                <button
                  onClick={() => setSourceMode("upload")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                    sourceMode === "upload" ? "bg-white text-black" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setSourceMode("asset")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors ${
                    sourceMode === "asset" ? "bg-white text-black" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  From Assets
                </button>
              </div>

              {sourceMode === "upload" ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-neutral-800 rounded-xl p-6 text-center hover:border-neutral-600 transition-colors">
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
                              ? "border-white ring-2 ring-white/20"
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
                            <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
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
                  {totalImages > 0 && (
                    <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                      {totalImages} image{totalImages !== 1 ? "s" : ""}
                    </span>
                  )}
                  <button
                    onClick={selectAllAngles}
                    className="text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    {selectedPresets.length === ANGLE_PRESETS.length ? "Deselect all" : "Select all"}
                  </button>
                </div>
              </div>

              {/* Camera Angles */}
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Camera Angles</p>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {ANGLE_PRESETS.filter((p) => p.group === "angles").map((preset) => {
                  const Icon = preset.icon;
                  const count = getCount(preset.id);
                  return (
                    <div
                      key={preset.id}
                      className={`rounded-lg border text-left transition-all ${
                        count > 0
                          ? "border-neutral-500 bg-neutral-800"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <button
                        onClick={() => toggleAngle(preset.id)}
                        className="flex items-start gap-2 p-2 w-full text-left"
                      >
                        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${count > 0 ? "text-white" : "text-white/60"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${count > 0 ? "text-white" : "text-white/60"}`}>{preset.label}</p>
                          <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{preset.description}</p>
                        </div>
                      </button>
                      {count > 0 && (
                        <div className="flex items-center justify-end gap-1 px-2 pb-2 -mt-1">
                          <button onClick={() => decrementAngle(preset.id)} className="w-5 h-5 rounded bg-neutral-700 hover:bg-neutral-600 text-white/70 text-xs flex items-center justify-center">−</button>
                          <span className="text-xs text-white/80 w-4 text-center tabular-nums">{count}</span>
                          <button onClick={() => incrementAngle(preset.id)} className="w-5 h-5 rounded bg-neutral-700 hover:bg-neutral-600 text-white/70 text-xs flex items-center justify-center">+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Social Media Styles */}
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2 font-medium">Social Media Styles</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ANGLE_PRESETS.filter((p) => p.group === "social").map((preset) => {
                  const Icon = preset.icon;
                  const count = getCount(preset.id);
                  return (
                    <div
                      key={preset.id}
                      className={`rounded-lg border text-left transition-all ${
                        count > 0
                          ? "border-neutral-500 bg-neutral-800"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <button
                        onClick={() => toggleAngle(preset.id)}
                        className="flex items-start gap-2 p-2 w-full text-left"
                      >
                        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${count > 0 ? "text-white" : "text-white/60"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${count > 0 ? "text-white" : "text-white/60"}`}>{preset.label}</p>
                          <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{preset.description}</p>
                        </div>
                      </button>
                      {count > 0 && (
                        <div className="flex items-center justify-end gap-1 px-2 pb-2 -mt-1">
                          <button onClick={() => decrementAngle(preset.id)} className="w-5 h-5 rounded bg-neutral-700 hover:bg-neutral-600 text-white/70 text-xs flex items-center justify-center">−</button>
                          <span className="text-xs text-white/80 w-4 text-center tabular-nums">{count}</span>
                          <button onClick={() => incrementAngle(preset.id)} className="w-5 h-5 rounded bg-neutral-700 hover:bg-neutral-600 text-white/70 text-xs flex items-center justify-center">+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Lifestyle Scenes */}
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2 mt-4 font-medium">Lifestyle Scenes</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ANGLE_PRESETS.filter((p) => p.group === "lifestyle").map((preset) => {
                  const Icon = preset.icon;
                  const count = getCount(preset.id);
                  return (
                    <div
                      key={preset.id}
                      className={`rounded-lg border text-left transition-all ${
                        count > 0
                          ? "border-neutral-500 bg-neutral-800"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <button
                        onClick={() => toggleAngle(preset.id)}
                        className="flex items-start gap-2 p-2 w-full text-left"
                      >
                        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${count > 0 ? "text-white" : "text-white/60"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${count > 0 ? "text-white" : "text-white/60"}`}>{preset.label}</p>
                          <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{preset.description}</p>
                        </div>
                      </button>
                      {count > 0 && (
                        <div className="flex items-center justify-end gap-1 px-2 pb-2 -mt-1">
                          <button onClick={() => decrementAngle(preset.id)} className="w-5 h-5 rounded bg-neutral-700 hover:bg-neutral-600 text-white/70 text-xs flex items-center justify-center">−</button>
                          <span className="text-xs text-white/80 w-4 text-center tabular-nums">{count}</span>
                          <button onClick={() => incrementAngle(preset.id)} className="w-5 h-5 rounded bg-neutral-700 hover:bg-neutral-600 text-white/70 text-xs flex items-center justify-center">+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Creative / Editorial */}
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2 mt-4 font-medium">Creative / Editorial</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ANGLE_PRESETS.filter((p) => p.group === "creative").map((preset) => {
                  const Icon = preset.icon;
                  const count = getCount(preset.id);
                  return (
                    <div
                      key={preset.id}
                      className={`rounded-lg border text-left transition-all ${
                        count > 0
                          ? "border-neutral-500 bg-neutral-800"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <button
                        onClick={() => toggleAngle(preset.id)}
                        className="flex items-start gap-2 p-2 w-full text-left"
                      >
                        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${count > 0 ? "text-white" : "text-white/60"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${count > 0 ? "text-white" : "text-white/60"}`}>{preset.label}</p>
                          <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{preset.description}</p>
                        </div>
                      </button>
                      {count > 0 && (
                        <div className="flex items-center justify-end gap-1 px-2 pb-2 -mt-1">
                          <button onClick={() => decrementAngle(preset.id)} className="w-5 h-5 rounded bg-neutral-700 hover:bg-neutral-600 text-white/70 text-xs flex items-center justify-center">−</button>
                          <span className="text-xs text-white/80 w-4 text-center tabular-nums">{count}</span>
                          <button onClick={() => incrementAngle(preset.id)} className="w-5 h-5 rounded bg-neutral-700 hover:bg-neutral-600 text-white/70 text-xs flex items-center justify-center">+</button>
                        </div>
                      )}
                    </div>
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
                    className="accent-neutral-400"
                  />
                  <span className="text-xs text-white/60">Add custom prompt</span>
                </label>
                {useCustom && (
                  <>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g. Show product floating with dramatic lighting and smoke effects..."
                      rows={3}
                      maxLength={1000}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-neutral-600 resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-white/30">Variations</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCustomCount((c) => Math.max(1, c - 1))}
                          className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 text-white/70 text-xs flex items-center justify-center"
                        >−</button>
                        <span className="text-xs text-white/80 w-4 text-center tabular-nums">{customCount}</span>
                        <button
                          onClick={() => setCustomCount((c) => Math.min(5, c + 1))}
                          className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 text-white/70 text-xs flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Generate buttons */}
              <div className="mt-4 space-y-2">
                {/* Instant generate */}
                <button
                  onClick={handleGenerate}
                  disabled={!sourceImage || totalImages === 0 || generating}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    !sourceImage || totalImages === 0 || generating
                      ? "bg-white/5 text-white/20 cursor-not-allowed"
                      : "bg-white text-black hover:bg-neutral-200"
                  }`}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating {totalImages + (useCustom ? customCount : 0)} image
                      {totalImages + (useCustom ? customCount : 0) !== 1 ? "s" : ""}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate {totalImages > 0 ? `${totalImages + (useCustom ? customCount : 0)} Image${totalImages + (useCustom ? customCount : 0) !== 1 ? "s" : ""}` : "Instant"}
                    </>
                  )}
                </button>

                {/* Batch generate (50% off) */}
                <button
                  onClick={handleBatchSubmit}
                  disabled={!sourceImage || totalImages === 0 || submittingBatch}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
                    !sourceImage || totalImages === 0 || submittingBatch
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
                  <Loader2 className="w-10 h-10 animate-spin text-white mb-3" />
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
