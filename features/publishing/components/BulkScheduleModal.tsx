"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import DynamicPost from "@/app/components/DynamicPost";
import PostWrapper from "@/app/components/PostWrapper";
import {
  Grid3X3,
  Instagram,
  Facebook,
  Send,
  ChevronRight,
  X,
  Check,
  Loader2,
  Image,
  Images,
  Film,
  Square,
  CheckCheck,
} from "lucide-react";

interface SocialAccount {
  _id: Id<"socialAccounts">;
  provider: "facebook" | "instagram" | "tiktok" | "twitter";
  providerAccountName: string;
  status: "active" | "expired" | "revoked";
}

type ContentType = "image" | "carousel" | "story" | "reel";
type BulkStep = "select" | "type" | "schedule" | "channels" | "caption" | "preview";

const CONTENT_TYPES: { value: ContentType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "image", label: "Post", icon: <Image className="w-5 h-5" />, desc: "Single image post" },
  { value: "carousel", label: "Carousel", icon: <Images className="w-5 h-5" />, desc: "Multi-slide carousel (2-10 images)" },
  { value: "story", label: "Story", icon: <Square className="w-5 h-5" />, desc: "24-hour story" },
  { value: "reel", label: "Reel", icon: <Film className="w-5 h-5" />, desc: "Short-form video" },
];

function getProviderIcon(provider: string) {
  switch (provider) {
    case "instagram": return <Instagram className="w-4 h-4 text-pink-400" />;
    case "facebook": return <Facebook className="w-4 h-4 text-blue-400" />;
    default: return <Send className="w-4 h-4 text-neutral-400" />;
  }
}

export default function BulkScheduleModal({
  workspaceId,
  accounts,
  onClose,
}: {
  workspaceId: Id<"workspaces">;
  accounts: SocialAccount[];
  onClose: () => void;
}) {
  const [step, setStep] = useState<BulkStep>("select");
  const [selectedPostIds, setSelectedPostIds] = useState<Set<Id<"posts">>>(new Set());
  const [contentType, setContentType] = useState<ContentType>("image");
  const [frequency, setFrequency] = useState<"daily" | "every_x" | "weekly">("daily");
  const [everyXDays, setEveryXDays] = useState(2);
  const [timesPerDay, setTimesPerDay] = useState(["09:00", "18:00"]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<Id<"socialAccounts">>>(new Set());
  const [captionMode, setCaptionMode] = useState<"shared" | "per-post">("shared");
  const [sharedCaption, setSharedCaption] = useState("");
  const [perPostCaptions, setPerPostCaptions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Refs for hidden post rendering (for image capture)
  const captureRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Load ALL posts from workspace (not limited to 3 collections)
  const allPosts = useQuery(api.posts.listByWorkspace, { workspaceId });
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const scheduleBulk = useMutation(api.publishing.scheduleBulk);

  const togglePost = (id: Id<"posts">) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!allPosts) return;
    if (selectedPostIds.size === allPosts.length) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(allPosts.map((p) => p._id)));
    }
  };

  const toggleAccount = (id: Id<"socialAccounts">) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectedPosts = useMemo(() => {
    if (!allPosts) return [];
    const ids = Array.from(selectedPostIds);
    return ids.map((id) => allPosts.find((p) => p._id === id)).filter(Boolean) as typeof allPosts;
  }, [allPosts, selectedPostIds]);

  const timeline = useMemo(() => {
    const items: { postIndex: number; postId: Id<"posts">; postTitle: string; dateTime: Date; accountName: string; accountId: Id<"socialAccounts"> }[] = [];
    const postIds = Array.from(selectedPostIds);
    const accountIds = Array.from(selectedAccountIds);
    const sortedTimes = [...timesPerDay].sort();

    if (postIds.length === 0 || accountIds.length === 0 || sortedTimes.length === 0) return items;

    const start = new Date(startDate + "T00:00:00");
    let dayOffset = 0;
    let postIndex = 0;

    while (postIndex < postIds.length) {
      const date = new Date(start);
      date.setDate(date.getDate() + dayOffset);

      for (const time of sortedTimes) {
        if (postIndex >= postIds.length) break;
        const [hours, minutes] = time.split(":").map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes, 0, 0);

        const post = allPosts?.find((p) => p._id === postIds[postIndex]);

        for (const accountId of accountIds) {
          const account = accounts.find((a) => a._id === accountId);
          items.push({
            postIndex: postIndex + 1,
            postId: postIds[postIndex],
            postTitle: post?.title || `Post ${postIndex + 1}`,
            dateTime,
            accountName: account?.providerAccountName || "Unknown",
            accountId,
          });
        }
        postIndex++;
      }

      switch (frequency) {
        case "daily": dayOffset += 1; break;
        case "every_x": dayOffset += everyXDays; break;
        case "weekly": dayOffset += 7; break;
      }
    }

    return items;
  }, [selectedPostIds, selectedAccountIds, timesPerDay, startDate, frequency, everyXDays, allPosts, accounts]);

  const handleConfirm = useCallback(async () => {
    if (isSubmitting) return;

    const now = Date.now();
    const hasPastDates = timeline.some((item) => item.dateTime.getTime() <= now);
    if (hasPastDates) {
      setError("Some scheduled times are in the past. Please adjust your start date or times.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Step 1: Capture all selected posts as PNGs and upload to storage
      const postMediaMap = new Map<string, Id<"_storage">[]>();
      const uniquePostIds = Array.from(selectedPostIds);

      setSubmitProgress(`Capturing ${uniquePostIds.length} post images...`);

      const { toPng } = await import("html-to-image");

      for (let i = 0; i < uniquePostIds.length; i++) {
        const postId = uniquePostIds[i];
        setSubmitProgress(`Capturing post ${i + 1} of ${uniquePostIds.length}...`);

        const el = captureRefs.current.get(postId);
        if (!el) {
          throw new Error(`Post element not found for capture. Please try again.`);
        }

        const dataUrl = await toPng(el, { pixelRatio: 2 });
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        const uploadUrl = await generateUploadUrl();
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/png" },
          body: blob,
        });
        const { storageId } = await uploadRes.json();
        postMediaMap.set(postId, [storageId]);
      }

      // Step 2: Build schedule entries and submit in bulk
      setSubmitProgress("Scheduling posts...");

      const batchId = `bulk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const entries = timeline.map((item) => ({
        postId: item.postId,
        socialAccountId: item.accountId,
        contentType,
        caption: captionMode === "per-post"
          ? (perPostCaptions[item.postId] || sharedCaption)
          : sharedCaption,
        mediaFileIds: postMediaMap.get(item.postId) || [],
        scheduledFor: item.dateTime.getTime(),
        timezone,
      }));

      await scheduleBulk({ workspaceId, batchId, entries });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule posts");
    } finally {
      setIsSubmitting(false);
      setSubmitProgress("");
    }
  }, [isSubmitting, timeline, selectedPostIds, contentType, captionMode, perPostCaptions, sharedCaption, generateUploadUrl, scheduleBulk, workspaceId, timezone, onClose]);

  const steps: { key: BulkStep; label: string }[] = [
    { key: "select", label: "Select Posts" },
    { key: "type", label: "Content Type" },
    { key: "schedule", label: "Schedule" },
    { key: "channels", label: "Channels" },
    { key: "caption", label: "Caption" },
    { key: "preview", label: "Preview" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const canProceed = () => {
    switch (step) {
      case "select": return selectedPostIds.size > 0;
      case "type": return true;
      case "schedule": return timesPerDay.length > 0 && startDate;
      case "channels": return selectedAccountIds.size > 0;
      case "caption": return true;
      case "preview": return timeline.length > 0;
      default: return false;
    }
  };

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) setStep(steps[currentStepIndex + 1].key);
  };
  const goPrev = () => {
    if (currentStepIndex > 0) setStep(steps[currentStepIndex - 1].key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">Schedule Posts</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-neutral-800 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <button
                onClick={() => i <= currentStepIndex && setStep(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  s.key === step ? "bg-blue-500/20 text-blue-400"
                    : i < currentStepIndex ? "text-neutral-300 hover:bg-neutral-800"
                    : "text-neutral-600"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  s.key === step ? "bg-blue-500 text-white"
                    : i < currentStepIndex ? "bg-green-500 text-white"
                    : "bg-neutral-700 text-neutral-400"
                }`}>
                  {i < currentStepIndex ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-neutral-700 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Posts */}
          {step === "select" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400">
                  Select the posts you want to schedule. ({selectedPostIds.size} selected)
                </p>
                {allPosts && allPosts.length > 0 && (
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    {selectedPostIds.size === allPosts.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
              {allPosts === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                </div>
              ) : allPosts.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No posts found in this workspace</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allPosts.map((post) => {
                    const isSelected = selectedPostIds.has(post._id);
                    return (
                      <button
                        key={post._id}
                        onClick={() => togglePost(post._id)}
                        className={`relative rounded-xl border p-1.5 text-left transition-all ${
                          isSelected ? "border-blue-500 bg-blue-500/10" : "border-neutral-800 bg-neutral-800/50 hover:border-neutral-700"
                        }`}
                      >
                        {/* Live post thumbnail */}
                        <div className="aspect-square rounded-lg overflow-hidden bg-neutral-800 mb-1.5">
                          <div className="w-full h-full" style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%", height: "400%" }}>
                            <DynamicPost code={post.componentCode} />
                          </div>
                        </div>
                        <p className="text-xs text-neutral-300 truncate font-medium px-1">{post.title}</p>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Content Type */}
          {step === "type" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-400">Choose how these posts will be published.</p>
              <div className="grid grid-cols-2 gap-3">
                {CONTENT_TYPES.map((ct) => {
                  const isSelected = contentType === ct.value;
                  const isDisabled = ct.value === "carousel" && selectedPostIds.size < 2;
                  return (
                    <button
                      key={ct.value}
                      onClick={() => !isDisabled && setContentType(ct.value)}
                      disabled={isDisabled}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : isDisabled
                            ? "border-neutral-800 bg-neutral-800/30 text-neutral-600 cursor-not-allowed"
                            : "border-neutral-800 bg-neutral-800/50 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      {ct.icon}
                      <span className="text-sm font-bold">{ct.label}</span>
                      <span className="text-[10px] text-neutral-500">{ct.desc}</span>
                      {isDisabled && (
                        <span className="text-[10px] text-amber-500">Need 2+ posts</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {contentType === "carousel" && (
                <p className="text-xs text-neutral-500">
                  All {selectedPostIds.size} selected posts will be combined into a single carousel.
                </p>
              )}
              {contentType === "story" && (
                <p className="text-xs text-amber-500/80">
                  Note: Stories don&apos;t support captions on Instagram.
                </p>
              )}
            </div>
          )}

          {/* Step 3: Configure Schedule */}
          {step === "schedule" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Frequency</label>
                <div className="flex gap-2">
                  {([
                    { value: "daily" as const, label: "Daily" },
                    { value: "every_x" as const, label: "Every X days" },
                    { value: "weekly" as const, label: "Weekly" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFrequency(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        frequency === opt.value
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {frequency === "every_x" && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-neutral-400">Every</span>
                    <input
                      type="number" min={2} max={30} value={everyXDays}
                      onChange={(e) => setEveryXDays(parseInt(e.target.value) || 2)}
                      className="w-16 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm text-center focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-sm text-neutral-400">days</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-300">Times per day</label>
                  <button onClick={() => setTimesPerDay((prev) => [...prev, "12:00"])} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    + Add time
                  </button>
                </div>
                <div className="space-y-2">
                  {timesPerDay.map((time, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time" value={time}
                        onChange={(e) => setTimesPerDay((prev) => prev.map((t, j) => j === i ? e.target.value : t))}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      {timesPerDay.length > 1 && (
                        <button
                          onClick={() => setTimesPerDay((prev) => prev.filter((_, j) => j !== i))}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Start date</label>
                <input
                  type="date" value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Timezone</label>
                <p className="text-sm text-neutral-400 bg-neutral-800 rounded-lg px-3 py-2 border border-neutral-700">{timezone}</p>
              </div>
            </div>
          )}

          {/* Step 4: Select Channels */}
          {step === "channels" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-400">Select which accounts to publish to. ({selectedAccountIds.size} selected)</p>
              {accounts.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No connected accounts</p>
                  <p className="text-xs text-neutral-600 mt-1">Connect accounts from the Channels tab first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {accounts.filter((a) => a.status === "active").map((account) => {
                    const isSelected = selectedAccountIds.has(account._id);
                    return (
                      <button
                        key={account._id}
                        onClick={() => toggleAccount(account._id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                          isSelected ? "border-blue-500 bg-blue-500/10" : "border-neutral-800 bg-neutral-800/50 hover:border-neutral-700"
                        }`}
                      >
                        {getProviderIcon(account.provider)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-200 truncate">{account.providerAccountName}</p>
                          <p className="text-xs text-neutral-500 capitalize">{account.provider}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-blue-500 border-blue-500" : "border-neutral-600"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Caption */}
          {step === "caption" && (
            <div className="space-y-4">
              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCaptionMode("shared")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    captionMode === "shared"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                  }`}
                >
                  Same caption for all
                </button>
                <button
                  onClick={() => setCaptionMode("per-post")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    captionMode === "per-post"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                  }`}
                >
                  Per-post captions
                </button>
              </div>

              {captionMode === "shared" ? (
                <div>
                  <textarea
                    value={sharedCaption}
                    onChange={(e) => setSharedCaption(e.target.value)}
                    placeholder="Write your caption here... (leave blank for no caption)"
                    rows={6}
                    maxLength={2200}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-neutral-600 text-right mt-1">{sharedCaption.length}/2200</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {selectedPosts.map((post) => (
                    <div key={post._id} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-neutral-800 shrink-0">
                          <div className="w-full h-full" style={{ transform: "scale(0.08)", transformOrigin: "top left", width: "1250%", height: "1250%" }}>
                            <DynamicPost code={post.componentCode} />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-neutral-300 truncate">{post.title}</p>
                      </div>
                      <textarea
                        value={perPostCaptions[post._id] || ""}
                        onChange={(e) => setPerPostCaptions((prev) => ({ ...prev, [post._id]: e.target.value }))}
                        placeholder="Caption for this post..."
                        rows={3}
                        maxLength={2200}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Preview Timeline */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400">Review the schedule. ({timeline.length} items)</p>
                <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded-md capitalize">{contentType}</span>
              </div>
              {timeline.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">No items. Go back and check settings.</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {timeline.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 bg-neutral-800 rounded-lg border border-neutral-700/50">
                        <span className="text-xs font-mono text-neutral-500 w-6">#{item.postIndex}</span>
                        {/* Mini thumbnail */}
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-neutral-700 shrink-0">
                          {(() => {
                            const post = allPosts?.find((p) => p._id === item.postId);
                            if (!post) return <Grid3X3 className="w-4 h-4 text-neutral-500 m-auto" />;
                            return (
                              <div className="w-full h-full" style={{ transform: "scale(0.08)", transformOrigin: "top left", width: "1250%", height: "1250%" }}>
                                <DynamicPost code={post.componentCode} />
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-200 truncate">{item.postTitle}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getProviderIcon(accounts.find((a) => a._id === item.accountId)?.provider || "")}
                          <span className="text-xs text-neutral-400 whitespace-nowrap">
                            {item.dateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                            {item.dateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-3">
                    This will create {timeline.length} scheduled post{timeline.length !== 1 ? "s" : ""}. Posts will be captured as images and uploaded before scheduling.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800">
          <div className="flex-1 min-w-0">
            {error && <p className="text-xs text-red-400 truncate">{error}</p>}
            {isSubmitting && submitProgress && <p className="text-xs text-blue-400 truncate">{submitProgress}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={currentStepIndex === 0 ? onClose : goPrev}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {currentStepIndex === 0 ? "Cancel" : "Back"}
            </button>

            {step === "preview" ? (
              <button
                onClick={handleConfirm}
                disabled={isSubmitting || timeline.length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? "Scheduling..." : "Confirm & Schedule"}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canProceed()}
                className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden render area for capturing post images at full resolution */}
      {(step === "preview" || isSubmitting) && (
        <div
          className="fixed"
          style={{ left: "-9999px", top: 0, width: "1080px", opacity: 0, pointerEvents: "none" }}
          aria-hidden="true"
        >
          {selectedPosts.map((post) => (
            <div
              key={post._id}
              ref={(el) => {
                if (el) captureRefs.current.set(post._id, el);
                else captureRefs.current.delete(post._id);
              }}
              style={{ width: "1080px", height: "1080px" }}
            >
              <PostWrapper aspectRatio="1:1" filename={post.title}>
                <DynamicPost code={post.componentCode} />
              </PostWrapper>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
