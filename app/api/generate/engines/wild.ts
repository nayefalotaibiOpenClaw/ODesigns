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
    const availableAssets = context?.assets?.filter(a => a.type !== 'logo') || [];

    // Build per-post system prompt with shuffled assets
    function buildWildSystemPrompt(postIndex: number): string {
      const wildContext: string[] = [];
      if (context) {
        const ctx = context as GenerationContext;
        if (ctx.brandName) wildContext.push(`Brand: ${ctx.brandName}`);
        if (ctx.language) wildContext.push(`Language: ${ctx.language === 'ar' ? 'Arabic (use dir="rtl" on DraggableWrapper, text-right on text)' : 'English'}`);
        if (ctx.assets && ctx.assets.length > 0) {
          const shuffledAssets = shuffle(ctx.assets);
          const assetLines = shuffledAssets.map((a) => {
            let line = `- ${a.type}: ${a.url}`;
            if (a.label) line += ` — ${a.label}`;
            if (a.aiAnalysis) line += `\n  Shows: ${a.aiAnalysis}`;
            return line;
          }).join('\n');
          wildContext.push(`Available images (optional — use only if they fit your design):\n${assetLines}`);
        }
        if (ctx.logoUrl) wildContext.push(`Logo URL: ${ctx.logoUrl}`);
      }
      return wildContext.length > 0
        ? `${WILD_SYSTEM_PROMPT}\n\n## CONTEXT\n${wildContext.join('\n')}`
        : WILD_SYSTEM_PROMPT;
    }

    return await runGeneration(
      postCount,
      (i) => buildWildSystemPrompt(i),
      (i) => {
        const mood = shuffledMoods[i % shuffledMoods.length];

        let assetNote = '';
        if (availableAssets.length > 0) {
          const asset = availableAssets[i % availableAssets.length];
          const details: string[] = [];
          if (asset.label) details.push(asset.label);
          if (asset.description) details.push(asset.description);
          if (asset.aiAnalysis) details.push(asset.aiAnalysis);
          assetNote = details.length > 0
            ? `\n\nAvailable image (optional — use only if it fits): ${asset.url}\nContext: ${details.join('. ')}`
            : `\n\nAvailable image (optional): ${asset.url}`;
        }

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
