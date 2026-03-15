"use client";

import React, { useRef, useEffect, useState } from "react";
import { Tag, X, Plus, Search, ImagePlus, Loader2, Settings2 } from "lucide-react";

interface BlogContentEditorProps {
  title: string;
  setTitle: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  excerpt: string;
  setExcerpt: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDescription: string;
  setSeoDescription: (v: string) => void;
  showPreview: boolean;
  onUploadImage?: (file: File) => Promise<string | null>;
}

// ─── Markdown Renderer (matching BlogDetailClient exactly) ────────

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let key = 0;

  const formatInline = (text: string): React.ReactNode[] => {
    // First split by images
    const imgParts = text.split(/(!\[[^\]]*\]\([^)]+\))/g);
    if (imgParts.length > 1) {
      const result: React.ReactNode[] = [];
      for (let i = 0; i < imgParts.length; i++) {
        const imgMatch = imgParts[i].match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          result.push(
            <img
              key={`img-${key}-${i}`}
              src={imgMatch[2]}
              alt={imgMatch[1]}
              className="rounded-xl max-w-full my-6"
            />
          );
        } else if (imgParts[i]) {
          result.push(...formatTextStyles(imgParts[i]));
        }
      }
      return result;
    }
    return formatTextStyles(text);
  };

  const formatTextStyles = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(
          <strong key={`b-${match.index}`} className="text-slate-800 dark:text-neutral-200 font-semibold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(<em key={`i-${match.index}`}>{match[3]}</em>);
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ");
      elements.push(
        <p key={key++} className="text-slate-600 dark:text-neutral-400 leading-relaxed text-lg mb-6">
          {formatInline(text)}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "ul") {
        elements.push(
          <ul key={key++} className="list-disc pl-6 my-4 space-y-2">
            {currentList.items.map((item, j) => (
              <li key={j} className="text-slate-600 dark:text-neutral-400 leading-relaxed text-lg">
                {formatInline(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={key++} className="list-decimal pl-6 my-4 space-y-2">
            {currentList.items.map((item, j) => (
              <li key={j} className="text-slate-600 dark:text-neutral-400 leading-relaxed text-lg">
                {formatInline(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Images on their own line
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushParagraph();
      flushList();
      elements.push(
        <img
          key={key++}
          src={imgMatch[2]}
          alt={imgMatch[1]}
          className="rounded-xl max-w-full my-6"
        />
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h3 key={key++} className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h1 key={key++} className="text-3xl font-black text-slate-900 dark:text-white mt-12 mb-6">
          {trimmed.slice(2)}
        </h1>
      );
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      elements.push(
        <blockquote key={key++} className="border-l-4 border-slate-300 dark:border-neutral-600 pl-6 my-6 italic text-slate-500 dark:text-neutral-400 text-lg">
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered list items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(trimmed.slice(2));
      continue;
    }

    // Ordered list items
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // Regular paragraph text
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return <>{elements}</>;
}

export default function BlogContentEditor({
  title, setTitle,
  content, setContent,
  excerpt, setExcerpt,
  tags, setTags,
  seoTitle, setSeoTitle,
  seoDescription, setSeoDescription,
  showPreview,
  onUploadImage,
}: BlogContentEditorProps) {
  const [tagInput, setTagInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current && !showPreview) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = Math.max(500, contentRef.current.scrollHeight) + "px";
    }
  }, [content, showPreview]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    e.target.value = "";
    setUploadingImage(true);
    try {
      const url = await onUploadImage(file);
      if (url && contentRef.current) {
        const textarea = contentRef.current;
        const pos = textarea.selectionStart ?? content.length;
        const before = content.slice(0, pos);
        const after = content.slice(pos);
        const imgMarkdown = `\n\n![image](${url})\n\n`;
        setContent(before + imgMarkdown + after);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="space-y-6">
      {showPreview ? (
        // ─── Rendered Blog View (matches BlogDetailClient) ─────
        <article>
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6 text-slate-900 dark:text-white">
            {title || "Untitled Blog Post"}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-sm text-slate-400 font-medium pb-10 border-b border-slate-100 dark:border-neutral-800 mb-10">
            <span>{wordCount} words</span>
            <span>{readTime} min read</span>
          </div>

          {/* Rendered content */}
          {content ? (
            <MarkdownContent content={content} />
          ) : (
            <p className="text-slate-300 dark:text-neutral-600 text-lg italic">
              No content yet. Switch to edit mode to start writing.
            </p>
          )}

          {/* Excerpt preview */}
          {excerpt && (
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-neutral-800">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Excerpt</p>
              <p className="text-slate-600 dark:text-neutral-400 text-lg italic">{excerpt}</p>
            </div>
          )}
        </article>
      ) : (
        // ─── Edit Mode (distraction-free) ──────────────────────
        <div className="space-y-6">
          {/* Editable title — styled to look like the rendered version */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Blog post title..."
            className="w-full text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white bg-transparent border-none outline-none placeholder:text-slate-300 dark:placeholder:text-neutral-600"
          />

          {/* Meta + image upload */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pb-6 border-b border-slate-100 dark:border-neutral-800">
            <span>{wordCount} words</span>
            <span>{readTime} min read</span>
            {onUploadImage && (
              <>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all disabled:opacity-40"
                >
                  {uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
                  {uploadingImage ? "Uploading..." : "Insert Image"}
                </button>
              </>
            )}
          </div>

          {/* Markdown editor — clean, distraction-free */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"Start writing your blog post in markdown...\n\n## Introduction\nYour opening paragraph here...\n\n## Main Section\nKey content here...\n\n## Conclusion\nWrap up with a call to action..."}
            className="w-full min-h-[500px] text-lg text-slate-700 dark:text-neutral-300 bg-transparent border-none outline-none resize-none leading-relaxed font-serif placeholder:text-slate-300 dark:placeholder:text-neutral-600"
          />

          {/* Post Settings (collapsible) */}
          <div className="border-t border-slate-200 dark:border-neutral-800 pt-6">
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors select-none">
                <Settings2 size={14} />
                Post Settings
              </summary>
              <div className="mt-6 space-y-6">
                {/* Tags */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-xs font-medium text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700"
                      >
                        <Tag size={10} />
                        {tag}
                        <button
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                          className="ml-0.5 hover:text-red-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Add tag..."
                        className="text-xs bg-transparent border-none outline-none text-slate-500 dark:text-neutral-400 placeholder:text-slate-300 dark:placeholder:text-neutral-600 w-24"
                      />
                      {tagInput.trim() && (
                        <button onClick={addTag} className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300">
                          <Plus size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Excerpt
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Write a short excerpt or summary..."
                    rows={2}
                    className="w-full text-sm text-slate-600 dark:text-neutral-300 bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-slate-400 dark:focus:border-neutral-500 placeholder:text-slate-300 dark:placeholder:text-neutral-600"
                  />
                </div>

                {/* SEO Title */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    <Search size={10} className="inline mr-1" />
                    SEO Title
                  </label>
                  <input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="SEO-optimized title (max 60 chars)"
                    maxLength={60}
                    className="w-full text-sm bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-slate-400 dark:focus:border-neutral-500 placeholder:text-slate-300 dark:placeholder:text-neutral-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">{seoTitle.length}/60</span>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    <Search size={10} className="inline mr-1" />
                    Meta Description
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Meta description (max 160 chars)"
                    maxLength={160}
                    rows={2}
                    className="w-full text-sm bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-slate-700 dark:text-neutral-300 resize-none focus:outline-none focus:border-slate-400 dark:focus:border-neutral-500 placeholder:text-slate-300 dark:placeholder:text-neutral-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">{seoDescription.length}/160</span>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
