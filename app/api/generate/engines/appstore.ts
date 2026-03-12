/**
 * Engine V6: App Store Preview (A)
 * Based on Wild's design quality but with MockupFrame + shared components.
 * Every post MUST use a device mockup with a screenshot — hard requirement.
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

const APPSTORE_MOODS = [
  'Premium & clean — Apple-style showcase, dark bg, centered device, minimal text, let the app speak',
  'Bold feature highlight — one feature, big headline, device showing it in action, accent-colored badge',
  'Social proof — star rating, user quote, device mockup validates the review, trustworthy and warm',
  'Step-by-step — numbered step badge, device showing that step, clean instructional feel',
  'Dramatic cinematic — near-black bg, glowing device, minimal text below, movie-poster energy',
  'Feature cards — device centered with floating annotation cards around it, each highlighting a feature',
  'Split layout — text/bullets on one side, device mockup on the other, balanced and informative',
  'Gradient showcase — rich diagonal gradient bg, device floating over it, single punchy headline',
];

// System prompt extension: adds MockupFrame + shared components to Wild base
const APPSTORE_SYSTEM_EXTENSION = `

## SHARED COMPONENTS (MANDATORY for App Store Preview)
\`\`\`tsx
import { MockupFrame, PostHeader, PostFooter, FloatingCard } from './shared';
\`\`\`

- **<PostHeader>** — Props: id, title (brand name), subtitle, badge (JSX), variant ("dark"|"light"), logoUrl. Always use at the top.
- **<PostFooter>** — Props: id, label (BRAND NAME), text, icon (JSX), variant ("dark"|"light"). Always use at the bottom.
- **<FloatingCard>** — Props: id, icon, label, value, className, rotate, borderColor, animation ("float"|"float-slow"|"none"). Place as siblings of MockupFrame inside the same relative container. Use absolute positioning: "absolute left-0 top-4".
- **<MockupFrame>** — Props: id, src (image URL), device ("phone"|"tablet"|"desktop", auto-detected if omitted). AUTO-SIZES for all ratios — do NOT wrap it in a fixed-size container. Just place it inside a flex-1 container and it fills the space.

## APP STORE MOCKUP LAYOUT (MANDATORY for every post)
Every post MUST include a device mockup. Use this EXACT structure:
\`\`\`tsx
<div className="relative z-10 w-full h-full flex flex-col overflow-hidden"
     style={{ padding: isTall ? '2rem' : '1.5rem' }}>
  {/* 1. Header */}
  <PostHeader id="header" title="Brand" />

  {/* 2. Short headline ABOVE the mockup */}
  <DraggableWrapper id="headline" className="mt-3">
    <h2 className="text-4xl font-black" style={{ color: t.primaryLight }}>
      <EditableText>Short Headline</EditableText>
    </h2>
  </DraggableWrapper>

  {/* 3. Mockup takes ALL remaining space — this is the hero */}
  <div className="flex-1 min-h-0 flex items-center justify-center relative mt-3">
    <MockupFrame id="mockup" src={screenshotUrl} />
    {/* FloatingCards as siblings, absolute positioned */}
    <FloatingCard id="card1" icon={...} label="Feature" value="Detail" className="absolute left-0 top-4" />
    <FloatingCard id="card2" icon={...} label="Feature" value="Detail" className="absolute right-0 bottom-8" />
  </div>

  {/* 4. Footer */}
  <PostFooter id="footer" label="BRAND" />
</div>
\`\`\`

### CRITICAL MOCKUP RULES:
1. MockupFrame goes inside \`flex-1 min-h-0 flex items-center justify-center relative\` — this makes it fill 60%+ of the post
2. Do NOT add any fixed width/height wrapper around MockupFrame — it auto-sizes
3. Keep headline to 3-6 words MAX, placed ABOVE the mockup container
4. FloatingCards are siblings of MockupFrame inside the same relative div
5. A post WITHOUT <MockupFrame> will be REJECTED`;

export async function generate(req: GenerateRequest): Promise<NextResponse> {
  try {
    const { prompt, context, count = 1, targetRatio, referenceImages } = req;
    const postCount = Math.min(Math.max(1, Number(count) || 1), 4);

    const shuffledMoods = shuffle(APPSTORE_MOODS);

    // Get screenshot assets for explicit URL injection
    const screenshotAssets = context?.assets?.filter(a =>
      ['screenshot', 'iphone', 'ipad', 'desktop'].includes(a.type)
    ) || [];
    const allUsableAssets = screenshotAssets.length > 0
      ? screenshotAssets
      : (context?.assets?.filter(a => a.type !== 'logo') || []);

    // Build per-post system prompt (Wild base + shared components + mockup rules)
    function buildSystemPrompt(postIndex: number): string {
      const sections: string[] = [];
      if (context) {
        const ctx = context as GenerationContext;
        if (ctx.brandName) sections.push(`Brand: ${ctx.brandName}`);
        if (ctx.language) sections.push(`Language: ${ctx.language === 'ar' ? 'Arabic (use dir="rtl" on DraggableWrapper, text-right on text)' : 'English'}`);
        if (ctx.logoUrl) sections.push(`Logo URL: ${ctx.logoUrl}`);

        // List all assets with usage instructions
        if (ctx.assets && ctx.assets.length > 0) {
          const shuffledAssets = shuffle(ctx.assets);
          const assetLines = shuffledAssets.map((a, idx) => {
            const isMockupType = ['screenshot', 'iphone', 'ipad', 'desktop'].includes(a.type);
            let line = `- ${a.type}: ${a.url}`;
            if (isMockupType) line += ' → USE WITH <MockupFrame src="..." />';
            else if (a.type === 'background') line += ' → USE AS background <img>';
            else if (a.type === 'product') line += ' → USE AS product <img>';
            else if (a.type === 'logo') line += ' → USE IN PostHeader logoUrl';
            if (idx === 0 && postCount > 1) line += ' ⭐ (FEATURED for this post)';
            if (a.label) line += `\n  Label: ${a.label}`;
            if (a.description) line += `\n  Description: ${a.description}`;
            if (a.aiAnalysis) line += `\n  AI Analysis: ${a.aiAnalysis}`;
            return line;
          }).join('\n');
          sections.push(`Available assets:\n${assetLines}`);
        }
      }

      const contextBlock = sections.length > 0
        ? `\n\n## CONTEXT\n${sections.join('\n')}`
        : '';

      return `${WILD_SYSTEM_PROMPT}${APPSTORE_SYSTEM_EXTENSION}${contextBlock}`;
    }

    return await runGeneration(
      postCount,
      (i) => buildSystemPrompt(i),
      (i) => {
        const mood = shuffledMoods[i % shuffledMoods.length];
        const asset = allUsableAssets.length > 0
          ? allUsableAssets[i % allUsableAssets.length]
          : null;
        const screenshotUrl = asset?.url || '';

        const assetMeta = asset ? [
          asset.label ? `Shows: ${asset.label}` : '',
          asset.description ? `Details: ${asset.description}` : '',
          asset.aiAnalysis ? `Analysis: ${asset.aiAnalysis}` : '',
        ].filter(Boolean).join('\n') : '';

        return `## APP STORE PREVIEW POST ${i + 1}/${postCount}
Topic: ${prompt}
Creative mood: ${mood}

## YOUR SCREENSHOT (MUST USE)
URL: ${screenshotUrl}
${assetMeta}

Use <MockupFrame id="mockup" src="${screenshotUrl}" /> as the HERO element.
Write a short headline (3-6 words) that describes what the screenshot shows.
Add 1-3 FloatingCards to highlight key features visible in the screenshot.
Keep text minimal — this is an app store listing, not a blog.${buildDistinctNote(i, postCount)}${buildRatioNote(targetRatio)}`;
      },
      referenceImages,
    );
  } catch (error) {
    return handleGenerationError(error);
  }
}
