"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Loader2,
  ArrowUp,
  Paperclip,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Pencil,
  List,
  Eye,
  FileText,
  Lightbulb,
  Tag,
  BookOpen,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

// ─── Types ────────────────────────────────────────────────────────

interface ToolCallResult {
  tool: string;
  args: Record<string, unknown>;
  result?: string;
  status: "running" | "done" | "error";
  data?: Record<string, unknown>;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  toolCalls?: ToolCallResult[];
  status?: "thinking" | "done" | "error";
  images?: string[];
}

interface BlogSummary {
  title: string;
  status: string;
  excerpt?: string;
  tags: string[];
  updatedAt: number;
}

interface BlogAgentChatPanelProps {
  workspaceId: Id<"workspaces"> | null;
  workspace: { name: string; website?: string; industry?: string; defaultLanguage: "en" | "ar"; websiteInfo?: Record<string, unknown> } | null;
  branding: {
    brandName: string;
    tagline?: string;
    colors: Record<string, string>;
    fonts: { heading: string; body: string };
  } | null;
  blogTitle: string;
  blogContent: string;
  blogExcerpt: string;
  blogTags: string[];
  allBlogs: BlogSummary[];
  assets: { _id: string; url: string | null; type: string; fileName: string; label?: string; description?: string; aiAnalysis?: string }[];
  onBlogUpdated: (updates: { title?: string; content?: string; excerpt?: string; tags?: string[]; seoTitle?: string; seoDescription?: string }) => void;
  onMultipleBlogsGenerated?: (blogs: Array<{ title: string; content: string; excerpt: string; tags: string[]; seoTitle: string; seoDescription: string }>) => Promise<void>;
  onUsageLog: (usage: { model: string; promptTokens: number; completionTokens: number; totalTokens: number }) => void;
  generateModel: string;
  setGenerateModel: (m: string) => void;
  chatImages: { base64: string; mimeType: string; preview: string }[];
  setChatImages: React.Dispatch<React.SetStateAction<{ base64: string; mimeType: string; preview: string }[]>>;
  onChatImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  chatImageInputRef: React.RefObject<HTMLInputElement | null>;
}

// ─── Tool Icons ───────────────────────────────────────────────────

const TOOL_ICONS: Record<string, React.ReactNode> = {
  generate_blog: <Sparkles size={12} />,
  edit_content: <Pencil size={12} />,
  suggest_titles: <Lightbulb size={12} />,
  suggest_tags: <Tag size={12} />,
  generate_outline: <List size={12} />,
  read_blog: <Eye size={12} />,
  update_blog: <FileText size={12} />,
  list_all_blogs: <BookOpen size={12} />,
  generate_multiple_blogs: <Sparkles size={12} />,
};

const TOOL_LABELS: Record<string, string> = {
  generate_blog: "Writing blog",
  edit_content: "Editing content",
  suggest_titles: "Suggesting titles",
  suggest_tags: "Suggesting tags",
  generate_outline: "Creating outline",
  read_blog: "Reading blog",
  update_blog: "Updating blog",
  list_all_blogs: "Listing blogs",
  generate_multiple_blogs: "Writing multiple blogs",
};

// ─── Component ────────────────────────────────────────────────────

export default function BlogAgentChatPanel({
  workspaceId,
  workspace,
  branding,
  blogTitle,
  blogContent,
  blogExcerpt,
  blogTags,
  allBlogs,
  assets,
  onBlogUpdated,
  onMultipleBlogsGenerated,
  onUsageLog,
  generateModel,
  setGenerateModel,
  chatImages,
  setChatImages,
  onChatImageUpload,
  chatImageInputRef,
}: BlogAgentChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [chatView, setChatView] = useState<'full' | 'last' | 'collapsed'>('collapsed');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blogLanguage, setBlogLanguage] = useState<"en" | "ar">(workspace?.defaultLanguage || "en");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (chatView !== 'collapsed' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatView]);

  const expandOnFirstMessage = useCallback(() => {
    if (messages.length === 0) setChatView('last');
  }, [messages.length]);

  // ─── Send Message ─────────────────────────────────────────────

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isProcessing) return;

    expandOnFirstMessage();
    setChatView('last');
    setError(null);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
      images: chatImages.length > 0 ? chatImages.map((img) => img.preview) : undefined,
    };

    const thinkingMsg: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      status: "thinking",
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setInputValue("");
    setChatImages([]);
    setIsProcessing(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
        toolCalls: m.toolCalls?.map((tc) => ({
          tool: tc.tool,
          args: tc.args,
          result: tc.result,
        })),
      }));

      const res = await fetch("/api/blog-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          context: {
            brandName: branding?.brandName || workspace?.name,
            tagline: branding?.tagline,
            website: workspace?.website,
            industry: workspace?.industry,
            language: blogLanguage,
            targetAudience: (workspace?.websiteInfo as Record<string, unknown>)?.targetAudience,
            tone: (workspace?.websiteInfo as Record<string, unknown>)?.tone,
          },
          currentBlog: {
            title: blogTitle,
            content: blogContent,
            excerpt: blogExcerpt,
            tags: blogTags,
          },
          allBlogs: allBlogs.map(b => ({
            title: b.title,
            status: b.status,
            excerpt: b.excerpt,
            tags: b.tags,
            updatedAt: b.updatedAt,
          })),
          model: generateModel,
          referenceImages: chatImages.length > 0 ? chatImages.map(img => ({ base64: img.base64, mimeType: img.mimeType })) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      const toolCalls: ToolCallResult[] = (data.toolCalls || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tc: any) => ({ ...tc, status: tc.status || "done" })
      );

      // Execute client-side actions
      for (const tc of toolCalls) {
        if (!tc.data) continue;
        const action = tc.data.action as string;

        try {
          switch (action) {
            case "generate_blog":
            case "update_blog":
            case "edit_content": {
              const updates: Record<string, unknown> = {};
              if (tc.data.title !== undefined) updates.title = tc.data.title;
              if (tc.data.content !== undefined) updates.content = tc.data.content;
              if (tc.data.excerpt !== undefined) updates.excerpt = tc.data.excerpt;
              if (tc.data.tags !== undefined) updates.tags = tc.data.tags;
              if (tc.data.seoTitle !== undefined) updates.seoTitle = tc.data.seoTitle;
              if (tc.data.seoDescription !== undefined) updates.seoDescription = tc.data.seoDescription;
              onBlogUpdated(updates as Parameters<typeof onBlogUpdated>[0]);
              break;
            }
            case "generate_multiple_blogs": {
              const generatedBlogs = tc.data.blogs as Array<{
                title: string;
                content: string;
                excerpt: string;
                tags: string[];
                seoTitle: string;
                seoDescription: string;
              }>;
              if (onMultipleBlogsGenerated && generatedBlogs && generatedBlogs.length > 0) {
                await onMultipleBlogsGenerated(generatedBlogs);
              }
              break;
            }
            // suggest_titles, suggest_tags, read_blog, generate_outline, list_all_blogs
            // are read-only — the AI response text shows the results
          }
        } catch (err) {
          console.error(`Failed to execute ${action}:`, err);
          tc.status = "error";
          tc.result = `Failed: ${err instanceof Error ? err.message : "Unknown error"}`;
        }
      }

      // Log usage
      if (data.usage) {
        onUsageLog(data.usage);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsg.id
            ? { ...m, content: data.text || "Done.", toolCalls, status: "done" }
            : m
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMsg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsg.id
            ? { ...m, content: errorMsg, status: "error" }
            : m
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-full max-w-3xl px-0 md:px-4 z-[110]">
      <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Chat history — 3 states: full, last, collapsed */}
        {messages.length > 0 && chatView === 'collapsed' && (
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 dark:border-neutral-800">
            <button
              onClick={() => setChatView('last')}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors flex items-center gap-1.5"
            >
              {messages.filter((m) => m.role === "user").length} messages
              <ChevronUp size={10} />
            </button>
            <button
              onClick={() => { setMessages([]); setChatView('collapsed'); }}
              className="text-[10px] font-medium text-slate-400 hover:text-red-500 transition-colors px-2 py-0.5"
            >
              Clear
            </button>
          </div>
        )}

        {messages.length > 0 && chatView !== 'collapsed' && (
          <div className="border-b border-slate-100 dark:border-neutral-800">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-1">
                {chatView === 'last' && (
                  <button
                    onClick={() => setChatView('full')}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors flex items-center gap-1"
                  >
                    {messages.filter((m) => m.role === "user").length} messages
                    <ChevronUp size={10} />
                  </button>
                )}
                {chatView === 'full' && (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                    {messages.filter((m) => m.role === "user").length} messages
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setMessages([]); setChatView('collapsed'); }}
                  className="text-[10px] font-medium text-slate-400 hover:text-red-500 transition-colors px-2 py-0.5"
                >
                  Clear
                </button>
                <button
                  onClick={() => setChatView(chatView === 'full' ? 'last' : 'collapsed')}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className={`overflow-y-auto px-4 py-3 space-y-3 ${chatView === 'full' ? "max-h-[50vh]" : "max-h-[160px]"}`}
            >
              {(chatView === 'full' ? messages : messages.slice(-2)).map((msg) => (
                <div key={msg.id}>
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-[#1B4332] text-white px-3.5 py-2 rounded-2xl rounded-br-md text-sm">
                        {msg.content}
                        {msg.images && msg.images.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {msg.images.map((src, i) => (
                              <img key={i} src={src} alt={`Ref ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border border-white/20" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] space-y-1.5">
                        {/* Tool call indicators */}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.toolCalls.map((tc, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  tc.status === "error"
                                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                                    : tc.status === "running"
                                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                    : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                }`}
                              >
                                {tc.status === "running" ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  TOOL_ICONS[tc.tool] || <Sparkles size={10} />
                                )}
                                {TOOL_LABELS[tc.tool] || tc.tool}
                                {tc.status === "done" && <Check size={9} />}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Message content */}
                        {msg.status === "thinking" ? (
                          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-neutral-800 rounded-2xl rounded-bl-md">
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                            <span className="text-sm text-slate-400">Thinking...</span>
                          </div>
                        ) : msg.content ? (
                          <div
                            className={`px-3.5 py-2 rounded-2xl rounded-bl-md text-sm whitespace-pre-wrap ${
                              msg.status === "error"
                                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                : "bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200"
                            }`}
                          >
                            {msg.content}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input area */}
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && inputValue.trim() && !isProcessing) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Describe the blog post you want to write..."
          rows={2}
          className="w-full px-5 pt-4 pb-2 text-sm text-slate-900 dark:text-white resize-none focus:outline-none placeholder:text-slate-400 bg-transparent"
        />

        {/* Image previews */}
        {chatImages.length > 0 && (
          <div className="flex items-center gap-2 px-4 pb-2 pt-1 overflow-x-auto">
            {chatImages.map((img, i) => (
              <div key={i} className="relative flex-shrink-0 group">
                <img src={img.preview} alt={`Reference ${i + 1}`} className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-neutral-700" />
                <button
                  onClick={() => setChatImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom controls */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-1.5">
            {/* Attachment */}
            <button
              onClick={() => chatImageInputRef.current?.click()}
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 hover:border-slate-300 dark:hover:border-neutral-600 transition-colors"
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={chatImageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onChatImageUpload}
              className="hidden"
            />

            {/* Language switcher */}
            <div className="flex items-center border border-slate-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setBlogLanguage("en")}
                className={`px-2 py-1 text-[10px] font-bold transition-colors ${
                  blogLanguage === "en"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-black"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setBlogLanguage("ar")}
                className={`px-2 py-1 text-[10px] font-bold transition-colors ${
                  blogLanguage === "ar"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-black"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"
                }`}
              >
                AR
              </button>
            </div>

            {/* Model selector */}
            <select
              value={generateModel}
              onChange={(e) => setGenerateModel(e.target.value)}
              className="text-[10px] font-medium text-slate-400 bg-transparent border border-slate-200 dark:border-neutral-700 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="gemini-3.1-flash-lite-preview">Flash Lite</option>
              <option value="gemini-3-flash-preview">Flash</option>
              <option value="gemini-3.1-pro-preview">Pro</option>
            </select>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing}
            className="w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-all active:scale-95"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
