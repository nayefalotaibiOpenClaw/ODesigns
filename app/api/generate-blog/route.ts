import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { requireAuth } from "@/lib/auth/api-auth";
import { aiRateLimiter } from "@/lib/security/rate-limit";

// ─── Gemini Client ───────────────────────────────────────────────
const ALLOWED_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
];
const DEFAULT_MODEL = "gemini-3.1-flash-lite-preview";

function getModel(modelId?: string) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("API key not configured");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = modelId && ALLOWED_MODELS.includes(modelId) ? modelId : DEFAULT_MODEL;
  return { client: genAI.getGenerativeModel({ model }), modelId: model };
}

// ─── System Prompt ───────────────────────────────────────────────

interface BlogContext {
  brandName?: string;
  industry?: string;
  tagline?: string;
  targetAudience?: string;
  tone?: string;
  website?: string;
  language?: "en" | "ar";
}

function buildBlogSystemPrompt(context: BlogContext): string {
  return `You are a sharp, experienced content writer for "${context.brandName || "a business"}". You write like a founder who's been in the trenches — not like a content mill, academic, or generic AI.

## Brand Context
- Brand: ${context.brandName || "Not specified"}
- Industry: ${context.industry || "Not specified"}
- Tagline: ${context.tagline || "Not specified"}
- Target Audience: ${context.targetAudience || "General audience"}
- Tone: ${context.tone || "Professional and engaging"}
- Website: ${context.website || "Not specified"}

## Writing Voice
- Founder voice — conversational, direct, opinionated, experienced
- Start with the problem or a hook. NEVER "In today's world..." or "In this article we will explore..."
- Use first person naturally ("We found...", "Here's what actually works...", "I've seen teams waste hours on...")
- Every paragraph earns its place — if it doesn't teach, surprise, or convince, cut it
- Concrete examples, real numbers, specific scenarios — never abstract advice
- Short paragraphs (2-4 sentences). Break up walls of text
- **Bold key takeaways** so skimmers get value
- End with a specific actionable step, not a fluffy conclusion
- NO filler, NO obvious statements, NO academic hedging, NO passive voice

## SEO Strategy
- Title: keyword-rich, under 70 chars, the kind of thing people actually Google
- Front-load the primary keyword in the first paragraph
- Use the target keyword in at least 2 H2 headings naturally
- Weave in related long-tail keywords throughout (not stuffed)
- Structure H2s as questions or statements that could become featured snippets
- Tags should be real search terms people use, not made-up categories
- Excerpt: write a hook that creates curiosity or urgency, not a dry summary

## Content That Converts
Write content that makes readers take action:
- Solve painful problems people are actively Googling
- Compare alternatives honestly — show what makes things different
- Share insights competitors can't replicate
- Teach specific workflows with step-by-step advice
- Challenge conventional wisdom with strong, backed-up takes

## Format
- Target 800-1500 words unless specified otherwise
- Write in ${context.language === "ar" ? "Arabic" : "English"}
${context.language === "ar" ? "- Use right-to-left friendly formatting" : ""}
- Use markdown: ## headings, **bold**, *italic*, - lists, > blockquotes

## Response Format
Return a JSON object:
{
  "title": "Keyword-rich blog title (under 70 chars)",
  "excerpt": "2-3 sentence hook that makes people click — not a summary",
  "content": "Full markdown content — engaging, actionable, founder-voice",
  "tags": ["actual-search-terms", "people-google-this"],
  "seoTitle": "SEO title with primary keyword (max 60 chars)",
  "seoDescription": "Curiosity or urgency driven description (max 160 chars)"
}

IMPORTANT: Return ONLY valid JSON, no markdown code fences, no extra text.`;
}

// ─── Main Handler ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const rateLimitResponse = aiRateLimiter.check(req, authResult.user._id);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const subscription = await fetchQuery(
      api.subscriptions.getActive,
      {},
      { token }
    );

    if (!subscription) {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
    }

    if (subscription.aiTokensUsed >= subscription.aiTokensLimit) {
      return NextResponse.json({ error: "AI token limit reached for current billing period" }, { status: 403 });
    }

    const body = await req.json();
    const { prompt, context, model: modelId, mode = "draft", existingContent, referenceImages } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required and must be a string" }, { status: 400 });
    }

    if (prompt.length > 5000) {
      return NextResponse.json({ error: "Prompt exceeds maximum length of 5000 characters" }, { status: 400 });
    }

    const { client: model, modelId: usedModel } = getModel(modelId);
    let systemPrompt = buildBlogSystemPrompt(context || {});

    // Add image instruction if reference images are provided
    const hasImages = Array.isArray(referenceImages) && referenceImages.length > 0;
    if (hasImages) {
      systemPrompt += "\n\nThe user has attached reference images. Describe them and incorporate relevant details into the blog content.";
    }

    let userPrompt = "";

    switch (mode) {
      case "outline":
        userPrompt = `Create a detailed blog post outline for: "${prompt}"\n\nReturn a JSON object with:\n{"title": "...", "excerpt": "...", "content": "## Section 1\\n- Key point 1\\n- Key point 2\\n\\n## Section 2\\n...", "tags": [...], "seoTitle": "...", "seoDescription": "..."}`;
        break;
      case "expand":
        userPrompt = `Expand and improve this blog content:\n\n${prompt}\n\nMake it more detailed, add examples, statistics, and practical advice. Keep the same structure but enrich it significantly.`;
        break;
      case "rewrite":
        userPrompt = `Rewrite and improve this blog content:\n\n${prompt}\n\nMake it more engaging, better structured, and more professional while keeping the core message.`;
        break;
      case "draft":
      default:
        userPrompt = `Write a comprehensive blog post about: "${prompt}"`;
        break;
    }

    // Add existing content context if provided
    if (existingContent && typeof existingContent === "string" && mode !== "draft") {
      userPrompt += `\n\nExisting content for reference:\n${existingContent.slice(0, 10000)}`;
    }

    // Build user parts with optional inline images
    const userParts: Part[] = [{ text: userPrompt }];
    if (hasImages) {
      for (const img of referenceImages.slice(0, 4)) {
        if (img.base64 && img.mimeType) {
          userParts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
        }
      }
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: userParts }],
      systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Failed to parse blog AI response:", text.slice(0, 500));
        return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json({
      title: parsed.title || "Untitled",
      excerpt: parsed.excerpt || "",
      content: parsed.content || "",
      tags: parsed.tags || [],
      seoTitle: parsed.seoTitle || parsed.title || "",
      seoDescription: parsed.seoDescription || parsed.excerpt || "",
      usage: {
        model: usedModel,
        promptTokens: usage?.promptTokenCount || 0,
        completionTokens: usage?.candidatesTokenCount || 0,
        totalTokens: usage?.totalTokenCount || 0,
      },
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();

    if (lower.includes("api key")) {
      return NextResponse.json({ error: "AI service is not properly configured." }, { status: 500 });
    }
    if (lower.includes("quota") || lower.includes("rate limit") || lower.includes("resource_exhausted") || lower.includes("429")) {
      return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again in a moment." }, { status: 429 });
    }
    if (lower.includes("safety") || lower.includes("blocked") || lower.includes("content_filter")) {
      return NextResponse.json({ error: "Your prompt was blocked by safety filters. Try rephrasing your description." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
