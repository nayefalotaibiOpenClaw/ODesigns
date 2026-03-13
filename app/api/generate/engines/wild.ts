/**
 * Engine V4: Wild (W)
 * Minimal system prompt, mood variations, maximum creativity.
 * Per-post system prompts with shuffled assets.
 */
import { NextResponse } from "next/server";
import { WILD_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt-wild";
import type { GenerationContext } from "@/lib/ai/types";
import {
  type GenerateRequest,
  runGeneration,
  handleGenerationError,
  shuffle,
  buildRatioNote,
  buildDistinctNote,
} from "../_shared";

const WILD_MOODS = [
  'Bold & dramatic — big typography, strong contrast, dark background, powerful single statement',
  'Minimal & elegant — lots of white space, light background, delicate typography, understated luxury',
  'Energetic & vibrant — bright accent colors, dynamic angles, playful layout, movement and energy',
  'Editorial & sophisticated — magazine-style layout, refined typography, structured grid, premium feel',
  'Warm & emotional — soft gradients, warm tones, personal touch, heartfelt message',
  'Modern & geometric — clean shapes, asymmetric layout, tech-inspired, contemporary design',
  'Organic & natural — flowing shapes, soft curves, nature-inspired decorations, calming mood',
  'Retro & bold — chunky text, strong borders, nostalgic feel, eye-catching patterns',
];

export async function generate(req: GenerateRequest): Promise<NextResponse> {
  try {
    const { prompt, context, count = 1, targetRatio, referenceImages, model } = req;
    const postCount = Math.min(Math.max(1, Number(count) || 1), 8);

    const shuffledMoods = shuffle(WILD_MOODS);

    // Split assets by type for smarter per-post assignment
    const allAssets = context?.assets || [];
    const backgrounds = shuffle(allAssets.filter(a => a.type === 'background'));
    const screenshots = shuffle(allAssets.filter(a => ['iphone', 'ipad', 'desktop', 'screenshot'].includes(a.type)));
    const products = shuffle(allAssets.filter(a => a.type === 'product'));
    const logoUrl = (context as GenerationContext)?.logoUrl;

    // Build per-post system prompt — only brand context, NO full asset list
    function buildWildSystemPrompt(): string {
      const wildContext: string[] = [];
      if (context) {
        const ctx = context as GenerationContext;
        if (ctx.brandName) wildContext.push(`Brand: ${ctx.brandName}`);
        if (ctx.language) wildContext.push(`Language: ${ctx.language === 'ar' ? 'Arabic (use dir="rtl" on DraggableWrapper, text-right on text)' : 'English'}`);
        if (ctx.websiteInfo) {
          const wi = ctx.websiteInfo;
          if (wi.companyName) wildContext.push(`Company: ${wi.companyName}`);
          if (wi.description) wildContext.push(`About: ${wi.description}`);
          if (wi.features?.length) wildContext.push(`Features: ${wi.features.join(', ')}`);
        }
        if (logoUrl) wildContext.push(`Logo URL: ${logoUrl}`);
      }
      return wildContext.length > 0
        ? `${WILD_SYSTEM_PROMPT}\n\n## BRAND CONTEXT\n${wildContext.join('\n')}`
        : WILD_SYSTEM_PROMPT;
    }

    return await runGeneration(
      postCount,
      () => buildWildSystemPrompt(),
      (i) => {
        const mood = shuffledMoods[i % shuffledMoods.length];

        // List all assets — AI picks what fits its design
        const assetLines: string[] = [];
        for (const a of shuffle([...backgrounds, ...screenshots, ...products])) {
          const typeLabel = ['iphone', 'ipad', 'desktop', 'screenshot'].includes(a.type)
            ? 'screenshot' : a.type;
          assetLines.push(`- ${typeLabel}: ${a.url}${a.aiAnalysis ? ` — ${a.aiAnalysis}` : ''}`);
        }
        const assetNote = assetLines.length > 0
          ? `\n\nAvailable images (pick ONE that fits your design — do NOT use multiple):\n${assetLines.join('\n')}`
          : '';

        return `Brand/Topic: ${prompt}

Creative mood: ${mood}

Write original copy for this brand — a bold headline and supporting message that tells a story or sells a vision. Then design a post around that copy. Do NOT just list features. Think like a creative agency.${assetNote}${buildDistinctNote(i, postCount)}${buildRatioNote(targetRatio)}`;
      },
      referenceImages,
      model,
    );
  } catch (error) {
    return handleGenerationError(error);
  }
}
