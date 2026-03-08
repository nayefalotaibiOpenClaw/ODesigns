import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// ─── STATIC TECHNICAL SECTION (never changes) ───────────────────────────────

const STATIC_PROMPT = `You are an expert React component generator for social media posts. Generate a SINGLE visually stunning, UNIQUE React component. Every post you create must have a DIFFERENT layout and visual approach.

## IMPORTS
Always start with these. Only import what you actually use:
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
// Only import shared components you need — don't import all of them:
// import { PostHeader, PostFooter, FloatingCard, IPhoneMockup, IPadMockup, DesktopMockup } from './shared';
// Only import icons you actually use:
// import { Heart, Star, Flower2 } from 'lucide-react';

## THEME (MANDATORY - never hardcode colors)
const t = useTheme();
Colors: t.primary (dark), t.primaryLight (light bg), t.primaryDark (darkest), t.accent (medium), t.accentLight, t.accentLime (bright), t.accentGold, t.accentOrange, t.border, t.font (font family)
Apply via style props: style={{ backgroundColor: t.primary, color: t.primaryLight }}
NEVER use Tailwind color classes like bg-[#1B4332].

## ASPECT RATIO (MANDATORY)
const ratio = useAspectRatio();
const isTall = ratio === '9:16' || ratio === '3:4';

## AVAILABLE COMPONENTS (use only what the design needs)

**<PostHeader>** — Optional top bar with brand logo. Props: id, title, subtitle, badge (JSX), variant ("dark"|"light"), logoUrl
**<PostFooter>** — Optional bottom bar. Props: id, label, text, icon (JSX), variant ("dark"|"light")
**<FloatingCard>** — Optional floating stat card. Props: id, icon, label, value, className, rotate, borderColor, animation ("float"|"float-slow"|"none")
**<EditableText>** — MANDATORY: wrap ALL visible text. Props: as ("h2"|"p"|"span"), className, style
**<DraggableWrapper>** — MANDATORY: wrap all moveable content sections. Props: id (unique), className, variant ("mockup" for devices), dir

Device mockups (only use when matching asset type is available):
**<IPhoneMockup>** — Props: src, alt, notch ("pill"|"notch")
**<IPadMockup>** — Props: src, alt, orientation ("landscape"|"portrait")
**<DesktopMockup>** — Props: src, alt, url, trafficLights

## SIZING REFERENCE
Device mockup wrapper sizes:
- IPhoneMockup: isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'
- IPadMockup landscape: isTall ? 'w-[420px] h-[300px]' : 'w-[320px] h-[220px]'
- IPadMockup portrait: isTall ? 'w-[260px] h-[360px]' : 'w-[200px] h-[280px]'
- DesktopMockup: isTall ? 'w-[420px] h-[280px]' : 'w-[360px] h-[240px]'

Root div: className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}
Content wrapper: className="relative z-10 w-full h-full flex flex-col p-8"

## ASSET TYPE RULES (CRITICAL)
- **background** → Full-bleed: <img src={url} className="absolute inset-0 w-full h-full object-cover" /> + overlay on top. NEVER in device mockups.
- **screenshot/iphone** → ONLY inside <IPhoneMockup>. NEVER as background.
- **screenshot/ipad** → ONLY inside <IPadMockup>. NEVER as background.
- **screenshot/desktop** → ONLY inside <DesktopMockup>. NEVER as background.
- **product** → Hero image: <img src={url} className="w-64 h-64 object-contain drop-shadow-2xl" />
- **logo** → Pass to PostHeader logoUrl prop.
- NEVER put background images in mockups. NEVER use screenshots as backgrounds.

## DESIGN VARIETY (be creative, never repeat)
Pick a DIFFERENT layout each time:
A) Hero Image — full-bleed photo bg with text overlay
B) Device Showcase — mockup + floating cards
C) Split — half image, half text
D) Bold Typography — oversized text, no images, patterns + icons
E) Card Grid — 2-3 info cards with icons
F) Centered Product — product image hero
G) Magazine — photo 60-70% with text panel
H) Minimal — light bg, clean hierarchy, whitespace
I) Diagonal — clip-path angles, overlapping sections
J) Quote — large decorative quote text

Also vary: light vs dark bg, text position, number of cards (0-3), icon choices, font sizes.

## OUTPUT
Return ONLY the component code. No markdown, no backticks, no explanation.`;

// ─── DYNAMIC CONTEXT BUILDER ─────────────────────────────────────────────────

interface AssetInfo {
  id: string;
  url: string;
  type: string;
  label?: string;
  description?: string;
  aiAnalysis?: string;
}

interface WebsiteInfo {
  companyName?: string;
  description?: string;
  industry?: string;
  features?: string[];
  targetAudience?: string;
  tone?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    socialMedia?: string[];
  };
  content?: string;
}

interface GenerationContext {
  brandName?: string;
  tagline?: string;
  website?: string;
  industry?: string;
  language: "en" | "ar";
  logoUrl?: string;
  websiteInfo?: WebsiteInfo;
  assets: AssetInfo[];
}

function buildDynamicPrompt(context: GenerationContext): string {
  const {
    brandName = "Brand",
    tagline,
    website,
    industry,
    language,
    logoUrl,
    websiteInfo,
    assets,
  } = context;

  const isArabic = language === "ar";

  const sections: string[] = [];

  // ── Brand context ──
  const brandLines: string[] = [`- Brand: ${brandName}`];
  if (tagline) brandLines.push(`- Tagline: ${tagline}`);
  if (industry) brandLines.push(`- Industry: ${industry}`);
  if (website) brandLines.push(`- Website: ${website}`);
  brandLines.push(
    `- Language: ${
      isArabic
        ? "Use Arabic text for ALL content (headings, descriptions, labels). English only for numbers/stats."
        : "Use English for all text"
    }`
  );

  sections.push(`## BRAND CONTEXT\n${brandLines.join("\n")}`);

  // ── Logo ──
  if (logoUrl) {
    sections.push(
      `## LOGO (MANDATORY)\nBrand logo URL: ${logoUrl}\nYou MUST pass it to PostHeader: <PostHeader id="..." title="${brandName}" logoUrl="${logoUrl}" ... />`
    );
  }

  // ── Available assets — grouped by type with usage instructions ──
  if (assets && assets.length > 0) {
    const grouped: Record<string, AssetInfo[]> = {};
    for (const a of assets) {
      const key = a.type || "other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(a);
    }

    const assetSections: string[] = [];

    for (const [type, items] of Object.entries(grouped)) {
      const lines = items.map((a) => {
        let line = `  - URL: ${a.url}`;
        if (a.label) line += `\n    Label: ${a.label}`;
        if (a.description) line += `\n    Description: ${a.description}`;
        if (a.aiAnalysis) line += `\n    AI Analysis: ${a.aiAnalysis}`;
        return line;
      }).join("\n");

      let usage = "";
      switch (type) {
        case "background":
          usage = "USE AS: Full-bleed background image with <img src={url} className=\"absolute inset-0 w-full h-full object-cover\" /> then add a dark/light overlay div on top. NEVER put these inside device mockups.";
          break;
        case "iphone":
        case "screenshot":
          usage = "USE AS: Screenshot inside <IPhoneMockup src={url} /> or <DesktopMockup src={url} />. NEVER use as background.";
          break;
        case "ipad":
          usage = "USE AS: Screenshot inside <IPadMockup src={url} />. NEVER use as background.";
          break;
        case "desktop":
          usage = "USE AS: Screenshot inside <DesktopMockup src={url} />. NEVER use as background.";
          break;
        case "product":
          usage = "USE AS: Hero product image with <img src={url} className=\"w-64 h-64 object-contain drop-shadow-2xl\" />. Position creatively — centered, offset, or with text wrapping around it.";
          break;
        case "logo":
          usage = "USE AS: Pass to PostHeader via logoUrl prop.";
          break;
        default:
          usage = "USE AS: Choose the best placement based on the AI analysis above.";
      }

      assetSections.push(`### ${type.toUpperCase()} assets (${items.length}):\n${usage}\n${lines}`);
    }

    sections.push(
      `## AVAILABLE ASSETS (MANDATORY — use these, NEVER use /1.jpg or hardcoded paths)\n${assetSections.join("\n\n")}`
    );
  } else {
    sections.push(
      `## ASSETS\nNo assets uploaded. Create CSS-only visuals — use gradients, geometric shapes, lucide-react icons, and patterns. Do NOT use IPhoneMockup, IPadMockup, or DesktopMockup. Focus on bold typography, icon compositions, and creative CSS layouts.`
    );
  }

  // ── Product info from website ──
  if (websiteInfo) {
    const infoLines: string[] = [];
    if (websiteInfo.companyName) infoLines.push(`Company: ${websiteInfo.companyName}`);
    if (websiteInfo.description) infoLines.push(`About: ${websiteInfo.description}`);
    if (websiteInfo.industry) infoLines.push(`Industry: ${websiteInfo.industry}`);
    if (websiteInfo.features && websiteInfo.features.length > 0) {
      infoLines.push(`Key Features: ${websiteInfo.features.join(", ")}`);
    }
    if (websiteInfo.targetAudience) infoLines.push(`Target Audience: ${websiteInfo.targetAudience}`);
    if (websiteInfo.tone) infoLines.push(`Brand Tone: ${websiteInfo.tone}`);
    if (websiteInfo.contact) {
      const contactParts: string[] = [];
      if (websiteInfo.contact.phone) contactParts.push(`Phone: ${websiteInfo.contact.phone}`);
      if (websiteInfo.contact.email) contactParts.push(`Email: ${websiteInfo.contact.email}`);
      if (websiteInfo.contact.address) contactParts.push(`Address: ${websiteInfo.contact.address}`);
      if (contactParts.length > 0) infoLines.push(`Contact: ${contactParts.join(", ")}`);
    }
    if (websiteInfo.content) infoLines.push(`Website Content: ${websiteInfo.content}`);
    if (infoLines.length > 0) {
      sections.push(
        `## COMPANY INFO (from website analysis)\nUse this info to write relevant, specific copy — not generic placeholder text:\n${infoLines.join("\n")}`
      );
    }
  }

  // ── Component conventions ──
  const footerSubtitle = isArabic ? "للأعمال" : "Platform";
  const dirAttr = isArabic ? ' dir="rtl"' : "";
  const textAlign = isArabic ? "text-right" : "text-left";

  sections.push(`## COMPONENT CONVENTIONS (CRITICAL)
- ALWAYS use title="${brandName}" in PostHeader — NEVER use "SYLO" or any other name
${logoUrl ? `- ALWAYS pass logoUrl="${logoUrl}" to PostHeader` : ""}
- For PostFooter: use label="${brandName.toUpperCase()} ${footerSubtitle}" with relevant text in ${isArabic ? "Arabic" : "English"}
${isArabic ? `- Use dir="rtl" on DraggableWrapper elements for Arabic layout\n- Text alignment: ${textAlign}` : ""}
- Use ${dirAttr ? `dir="rtl" and ` : ""}className="${textAlign}" on text containers

## CREATIVITY INSTRUCTIONS
- Do NOT copy the example layout below — use it only to understand the code structure
- Pick a random layout family from the DESIGN VARIETY section above
- Use the brand's actual features/products in your copy, not generic text
- Vary background treatments: photo backgrounds, gradients, split designs, minimal white
- If background assets are available, strongly prefer using them as full-bleed backgrounds with overlays`);

  sections.push(`Now create something visually DIFFERENT and CREATIVE. Surprise me with the layout.`);

  return sections.join("\n\n");
}

// ─── API ROUTE ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { prompt, context, count = 1 } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const postCount = Math.min(Math.max(1, Number(count) || 1), 4);

    // Build the full system prompt: static technical docs + dynamic brand context
    const dynamicSection = context
      ? buildDynamicPrompt(context as GenerationContext)
      : "";
    const systemPrompt = dynamicSection
      ? `${STATIC_PROMPT}\n\n${dynamicSection}`
      : STATIC_PROMPT;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    function cleanCode(raw: string): string {
      return raw.replace(/^```(?:tsx?|jsx?|javascript|typescript)?\n?/gm, '').replace(/```$/gm, '').trim();
    }

    if (postCount === 1) {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Generate a social media post component for: ${prompt}\n\nIMPORTANT: Be creative with the layout. Pick a unique visual approach.` },
      ]);
      const code = cleanCode(result.response.text());
      return NextResponse.json({ code, codes: [code] });
    }

    // Generate multiple posts in parallel
    const layoutHints = [
      "Use Layout A (Hero Image) or Layout G (Magazine Style) — full-bleed photo background with text overlay",
      "Use Layout D (Bold Typography) or Layout H (Minimal & Clean) — no device mockups, focus on large text and icons",
      "Use Layout E (Card Grid) or Layout I (Diagonal/Angular) — creative geometric layout with stats",
      "Use Layout C (Split Composition) or Layout F (Centered Product) — half image, half text design",
    ];

    const promises = Array.from({ length: postCount }, (_, i) =>
      model.generateContent([
        { text: systemPrompt },
        { text: `Generate a social media post component for: ${prompt}\n\n${layoutHints[i % layoutHints.length]}\n\nPost ${i + 1} of ${postCount} — make this one VISUALLY DISTINCT from the others.` },
      ]).then(r => cleanCode(r.response.text()))
        .catch(err => {
          console.error(`Generation ${i + 1} failed:`, err);
          return null;
        })
    );

    const results = await Promise.all(promises);
    const codes = results.filter((c): c is string => c !== null);

    if (codes.length === 0) {
      return NextResponse.json({ error: "All generations failed" }, { status: 500 });
    }

    return NextResponse.json({ code: codes[0], codes });
  } catch (error: unknown) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
