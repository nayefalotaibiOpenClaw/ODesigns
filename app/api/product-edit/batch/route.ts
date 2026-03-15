import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { aiRateLimiter } from "@/lib/security/rate-limit";

/**
 * Gemini Batch API for product editing — 50% cost reduction.
 *
 * POST  — Create a batch job (multiple products × multiple angles)
 * GET   — Check job status / retrieve results
 *
 * Flow:
 *   1. Client sends array of products (each with imageBase64 + angles)
 *   2. We build JSONL, upload to Gemini File API, submit batch job
 *   3. Client polls GET with jobName until JOB_STATE_SUCCEEDED
 *   4. Results returned as array of { productKey, angle, imageBase64, mimeType }
 *
 * Designed for nightly cron triggers — not real-time UI.
 */

const MODEL = "gemini-3.1-flash-image-preview";
const API_BASE = "https://generativelanguage.googleapis.com";

// ─── Prompt builders (same as single route) ──────────────────────
function getSystemPrompt(mode: "product" | "image-edit"): string {
  if (mode === "image-edit") {
    return `You are a professional photographer and image editor. Your task is to re-render this image from a different camera angle while preserving the entire scene.

IMPORTANT RULES:
- Keep the EXACT same scene — same objects, background, environment, colors, lighting style, and mood
- Do NOT change the subject, do NOT add or remove objects
- Only change the CAMERA POSITION/ANGLE as instructed
- Output a high-quality, photorealistic image that looks like the same photo taken from a different angle
- Maintain the same aspect ratio and image quality`;
  }
  return `You are a professional product photographer and image editor. Your task is to transform product images into different angles and perspectives.

IMPORTANT RULES:
- Keep the EXACT same product — same colors, branding, labels, text, shape, and details
- Only change the viewing angle/perspective as instructed
- Output a high-quality, photorealistic image
- The product must be the clear focal point`;
}

// ─── Presets (duplicated to keep batch route self-contained) ──────
const PRODUCT_PRESETS: Record<string, string> = {
  "front-clean": "Show this exact product from a clean front-facing angle on a pure white background. Well-lit, centered, subtle shadow. Keep product exactly as-is.",
  "three-quarter": "Show from a 3/4 perspective angle (rotated ~45° right) on white background. Professional studio lighting with soft shadow. Keep all details exactly.",
  "side-view": "Show from a direct side profile view on white background. Professional studio lighting. Keep all details exactly.",
  "top-down": "Show from directly above (top-down / flat lay) on white background. Even lighting with soft shadow. Keep all details exactly.",
  "slight-tilt": "Show with a slight dynamic tilt (~15°) on white background. Energetic, modern feel. Studio lighting with cast shadow. Keep all details exactly.",
  "close-up": "Close-up detail shot focusing on the most interesting texture/material/design element. White background, macro photography feel. Keep all details exactly.",
  "lifestyle": "Place in a natural lifestyle setting matching its category. Premium, aspirational feel. Keep product exactly as-is.",
  "hero-angle": "Dramatic hero angle — slightly low camera looking up. Powerful, premium feel. White or subtle gradient background. Dramatic shadows. Keep all details exactly.",
  "hand-holding": "Realistic human hand elegantly holding/presenting this product. Soft bokeh background. Natural grip showing scale. Instagram-style lifestyle photography. Keep product exactly as-is.",
  "flat-lay-styled": "Beautiful flat lay composition with product as hero, surrounded by complementary category-matched props. Shot from above. Aesthetic, Instagram-worthy styling. Keep product exactly as-is.",
  "in-use": "Product being actively used in a natural, realistic way. Authentic, candid feel. Soft natural lighting, slightly blurred background. Keep product exactly as-is.",
  "gradient-bg": "Product on a smooth modern gradient background complementing its colors. Floating with soft reflection/shadow. Clean editorial feel. Keep all details exactly.",
  "splash-action": "Dynamic action shot with motion elements matching the product (water splash, powder burst, steam, light trails). Product sharp and in focus. High-speed photography feel. Keep all details exactly.",
  "minimal-shadow": "Product on clean white surface with only a long dramatic directional shadow. Ultra-minimal editorial style. Keep all details exactly.",
  "seasonal-autumn": "Product in warm autumn setting — golden/orange tones, fallen leaves, cozy textures, warm wood. Golden-hour lighting. Keep product exactly as-is.",
  "texture-surface": "Product on beautiful textured surface (marble, slate, wood, concrete, terrazzo). Simple composition, soft directional lighting. Premium editorial feel. Keep all details exactly.",
  "car-interior": "Hand holding product inside luxury car. Golden hour light through windshield, leather interior background. Cinematic bokeh. Keep product exactly as-is.",
  "car-hood": "Product placed on hood of classic/luxury car. Glossy reflective surface, warm cinematic lighting. Shallow depth of field. Keep product exactly as-is.",
  "car-window": "Hand holding product out car window against blue sky. Bright cheerful daylight, aspirational. Keep product exactly as-is.",
  "held-close-up": "Tight close-up of hands cradling product against solid-colored outfit. Editorial fashion photography. Keep product exactly as-is.",
  "person-holding": "Person holding product close to camera, slightly out of focus. Warm natural lighting, candid Instagram feel. Keep product exactly as-is.",
  "drive-thru": "Drive-thru handoff — hand passing product through car window. Moody urban lighting, car window framing. Keep product exactly as-is.",
  "group-table": "Overhead table with multiple hands reaching for product. Warm restaurant lighting, social dining. Keep product exactly as-is.",
  "sauce-pour": "Hand holding product while another pours sauce onto it. Clean light background, hard directional lighting. Keep product exactly as-is.",
  "pool-backdrop": "Hands holding product against blue pool water background. Bright summer daylight. Keep product exactly as-is.",
  "tray-serving": "Person serving product on metal tray. Restaurant setting, warm lighting. Keep product exactly as-is.",
  "velvet-backdrop": "Product on open palm against dark velvet curtain. Dramatic moody lighting, premium feel. Keep product exactly as-is.",
  "floating-product": "Product floating/levitating at multiple angles against cream background. Dynamic, editorial catalog style. Keep product exactly as-is.",
  "nails-grip": "Close-up of hand with painted nails gripping product against muted background. High-fashion editorial. Keep product exactly as-is.",
};

const IMAGE_EDIT_PRESETS: Record<string, string> = {
  "front-clean": "Re-render this scene from a straight-on front-facing camera angle. Keep the SAME background, environment, and all objects. Only change camera position.",
  "three-quarter": "Re-render this scene from a 3/4 perspective (~45° right). Keep SAME background, environment, lighting. Only change camera angle.",
  "side-view": "Re-render this scene from a direct side profile. Keep SAME background, environment, lighting. Only change camera.",
  "top-down": "Re-render this scene from directly above (bird's eye). Keep SAME background, objects, lighting. Only change camera.",
  "slight-tilt": "Re-render this scene with camera slightly tilted (~15°). Keep SAME background, environment. Add subtle Dutch angle for dynamic feel.",
  "close-up": "Re-render as a close-up shot, zooming in on the main subject. Keep SAME background, lighting, style. Only zoom in closer.",
  "lifestyle": "Re-render with same subject but enhance environment to feel more lifestyle/aspirational. Keep subject exactly as-is. Warmer, more premium feel.",
  "hero-angle": "Re-render from a dramatic low camera angle looking upward. Keep SAME background, environment, lighting. Hero perspective for powerful feel.",
  "hand-holding": "Re-render showing a hand elegantly holding the main subject. Keep SAME subject and color palette. Soft blurred background. Candid Instagram feel.",
  "flat-lay-styled": "Re-render as styled flat lay (top-down) with subject as hero, adding complementary props. Keep subject exactly as-is. Soft even lighting.",
  "in-use": "Re-render showing subject being actively used naturally. Keep subject exactly as-is. Authentic candid feel. Blurred background, natural lighting.",
  "gradient-bg": "Re-render replacing background with smooth modern gradient complementing subject's colors. Keep subject exactly as-is. Soft reflection/shadow. Editorial feel.",
  "splash-action": "Re-render with dynamic action elements (splash, burst, smoke). Subject must stay sharp and in focus. Keep all details. High-speed photography feel.",
  "minimal-shadow": "Re-render ultra-minimal — subject on clean white surface with dramatic directional shadow only. Keep subject exactly as-is. Editorial feel.",
  "seasonal-autumn": "Re-render in warm autumn setting — golden tones, fallen leaves, cozy textures. Keep subject exactly as-is. Golden-hour lighting.",
  "texture-surface": "Re-render placing subject on textured surface (marble, slate, wood, terrazzo). Keep subject exactly as-is. Simple composition, soft directional lighting.",
  "car-interior": "Re-render scene inside luxury car interior. Hand holds subject with golden hour light through windshield. Keep subject exactly as-is. Cinematic bokeh.",
  "car-hood": "Re-render scene with subject on hood of classic/luxury car. Glossy reflective surface, warm cinematic lighting. Keep subject exactly as-is.",
  "car-window": "Re-render scene with hand holding subject out car window against blue sky. Keep subject exactly as-is. Bright cheerful daylight.",
  "held-close-up": "Re-render as tight close-up of hands cradling subject against solid-colored outfit. Keep subject exactly as-is. Editorial fashion photography.",
  "person-holding": "Re-render with person holding subject close to camera. Keep subject exactly as-is. Warm natural lighting, candid feel.",
  "drive-thru": "Re-render as drive-thru handoff through car window. Keep subject exactly as-is. Moody urban lighting.",
  "group-table": "Re-render as overhead table with multiple hands reaching. Keep subject exactly as-is. Warm restaurant lighting.",
  "sauce-pour": "Re-render with hand pouring sauce onto subject. Clean light background, hard lighting. Keep subject exactly as-is.",
  "pool-backdrop": "Re-render with hands holding subject against blue pool water. Keep subject exactly as-is. Bright summer daylight.",
  "tray-serving": "Re-render with person serving subject on tray. Restaurant setting. Keep subject exactly as-is.",
  "velvet-backdrop": "Re-render with subject on open palm against dark velvet curtain. Keep subject exactly as-is. Dramatic moody lighting.",
  "floating-product": "Re-render with subject floating/levitating against cream background. Keep subject exactly as-is. Editorial catalog style.",
  "nails-grip": "Re-render as close-up of painted nails gripping subject. Muted background. Keep subject exactly as-is. High-fashion editorial.",
};

// ─── Types ───────────────────────────────────────────────────────
interface BatchProduct {
  key: string; // unique identifier for this product (e.g. asset ID)
  imageBase64: string;
  mimeType: string;
  angles: string[];
  customPrompt?: string;
}

interface BatchRequest {
  products: BatchProduct[];
  mode?: "product" | "image-edit";
  displayName?: string;
}

// ─── POST: Create batch job ──────────────────────────────────────
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const rateLimitRes = aiRateLimiter.check(req, user._id);
  if (rateLimitRes) return rateLimitRes;

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  try {
    const body: BatchRequest = await req.json();
    const { products, mode = "product", displayName } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "At least one product is required" }, { status: 400 });
    }

    if (products.length > 50) {
      return NextResponse.json({ error: "Maximum 50 products per batch" }, { status: 400 });
    }

    const systemPrompt = getSystemPrompt(mode);
    const presets = mode === "image-edit" ? IMAGE_EDIT_PRESETS : PRODUCT_PRESETS;

    // Build JSONL lines — one line per (product × angle)
    const jsonlLines: string[] = [];
    let totalRequests = 0;

    for (const product of products) {
      if (!product.imageBase64 || !product.mimeType || !product.key) continue;
      const angles = product.angles || ["front-clean"];

      for (const angle of angles) {
        let prompt: string | undefined;
        if (angle === "custom" && product.customPrompt) {
          prompt = `REFERENCE IMAGE: The attached image shows the EXACT product you must use. Study every detail — the packaging, colors, branding, labels, text, shape, and texture. You MUST use this exact product in the output, not a generic or imagined version.\n\nUSER REQUEST:\n${product.customPrompt}\n\nCRITICAL: The product in your output MUST match the attached reference image exactly. Do not invent or guess what the product looks like — copy it precisely from the reference image.`;
        } else {
          prompt = presets[angle];
        }
        if (!prompt) continue;

        const requestKey = `${product.key}__${angle}`;
        const line = JSON.stringify({
          key: requestKey,
          request: {
            contents: [
              {
                parts: [
                  { inlineData: { mimeType: product.mimeType, data: product.imageBase64 } },
                  { text: `${systemPrompt}\n\nINSTRUCTION:\n${prompt}` },
                ],
              },
            ],
            generation_config: {
              responseModalities: ["IMAGE", "TEXT"],
              temperature: 0.4,
            },
          },
        });

        jsonlLines.push(line);
        totalRequests++;
      }
    }

    if (totalRequests === 0) {
      return NextResponse.json({ error: "No valid product/angle combinations" }, { status: 400 });
    }

    const jsonlContent = jsonlLines.join("\n");
    const jsonlBytes = new TextEncoder().encode(jsonlContent);

    // Step 1: Upload JSONL to Gemini File API (resumable upload)
    // Start resumable upload
    const startRes = await fetch(`${API_BASE}/upload/v1beta/files`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(jsonlBytes.byteLength),
        "X-Goog-Upload-Header-Content-Type": "application/jsonl",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: {
          display_name: displayName || `product-edit-batch-${Date.now()}`,
        },
      }),
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      console.error("File upload start failed:", err);
      return NextResponse.json({ error: "Failed to start file upload" }, { status: 500 });
    }

    const uploadUrl = startRes.headers.get("X-Goog-Upload-URL");
    if (!uploadUrl) {
      return NextResponse.json({ error: "No upload URL returned" }, { status: 500 });
    }

    // Upload the JSONL content
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "X-Goog-Upload-Command": "upload, finalize",
        "X-Goog-Upload-Offset": "0",
        "Content-Type": "application/jsonl",
      },
      body: jsonlBytes,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("File upload failed:", err);
      return NextResponse.json({ error: "Failed to upload batch file" }, { status: 500 });
    }

    const uploadData = await uploadRes.json();
    const fileName = uploadData?.file?.name;
    if (!fileName) {
      return NextResponse.json({ error: "No file name returned from upload" }, { status: 500 });
    }

    // Step 2: Create batch job
    const batchRes = await fetch(
      `${API_BASE}/v1beta/models/${MODEL}:batchGenerateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batch: {
            display_name: displayName || `product-edit-${Date.now()}`,
            input_config: {
              file_name: fileName,
            },
          },
        }),
      }
    );

    if (!batchRes.ok) {
      const err = await batchRes.text();
      console.error("Batch creation failed:", err);
      return NextResponse.json({ error: "Failed to create batch job" }, { status: 500 });
    }

    const batchData = await batchRes.json();

    return NextResponse.json({
      jobName: batchData.name || batchData.batch?.name,
      state: batchData.state || batchData.batch?.state || "JOB_STATE_PENDING",
      totalRequests,
      productsCount: products.length,
      inputFile: fileName,
      message: `Batch job created with ${totalRequests} image generations across ${products.length} products. Poll GET /api/product-edit/batch?jobName={jobName} to check status.`,
    });
  } catch (err) {
    console.error("Batch creation error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ─── GET: Check status / retrieve results ────────────────────────
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  const jobName = req.nextUrl.searchParams.get("jobName");
  if (!jobName) {
    return NextResponse.json({ error: "jobName query param required" }, { status: 400 });
  }

  try {
    // Check job status
    const statusRes = await fetch(
      `${API_BASE}/v1beta/${jobName}`,
      {
        headers: { "x-goog-api-key": apiKey },
      }
    );

    if (!statusRes.ok) {
      const err = await statusRes.text();
      console.error("Status check failed:", err);
      return NextResponse.json({ error: "Failed to check job status" }, { status: 500 });
    }

    const statusData = await statusRes.json();
    const state = statusData.state || statusData.batch?.state;

    // If not done yet, return status only
    if (state !== "JOB_STATE_SUCCEEDED") {
      return NextResponse.json({
        jobName,
        state,
        // Suppress userId from response
        createTime: statusData.createTime,
        updateTime: statusData.updateTime,
      });
    }

    // Job succeeded — download results
    const responsesFile = statusData.responsesFile || statusData.batch?.responsesFile;

    if (!responsesFile) {
      // Try inline responses
      const inlined = statusData.inlinedResponses || statusData.batch?.inlinedResponses;
      if (inlined) {
        const results = parseInlineResults(inlined);
        return NextResponse.json({ jobName, state, results });
      }
      return NextResponse.json({ jobName, state, results: [], message: "No results found" });
    }

    // Download results file
    const resultsRes = await fetch(
      `${API_BASE}/download/v1beta/${responsesFile}:download?alt=media`,
      {
        headers: { "x-goog-api-key": apiKey },
      }
    );

    if (!resultsRes.ok) {
      return NextResponse.json({ jobName, state, error: "Failed to download results" }, { status: 500 });
    }

    const resultsText = await resultsRes.text();
    const results = parseJsonlResults(resultsText);

    // Aggregate usage
    const totalUsage = results.reduce(
      (acc, r) => ({
        promptTokens: acc.promptTokens + (r.promptTokens || 0),
        completionTokens: acc.completionTokens + (r.completionTokens || 0),
        totalTokens: acc.totalTokens + (r.totalTokens || 0),
      }),
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    );

    return NextResponse.json({
      jobName,
      state,
      results: results.map(({ promptTokens: _p, completionTokens: _c, totalTokens: _t, ...rest }) => rest),
      usage: { model: MODEL, ...totalUsage },
    });
  } catch (err) {
    console.error("Batch status error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ─── Result parsers ──────────────────────────────────────────────
interface ParsedResult {
  productKey: string;
  angle: string;
  imageBase64?: string;
  mimeType?: string;
  description?: string;
  error?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

function parseJsonlResults(text: string): ParsedResult[] {
  const results: ParsedResult[] = [];
  const lines = text.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      results.push(parseResultEntry(entry));
    } catch {
      // skip malformed lines
    }
  }
  return results;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseInlineResults(inlined: any[]): ParsedResult[] {
  return inlined.map((entry) => parseResultEntry(entry));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseResultEntry(entry: any): ParsedResult {
  const key = entry.key || "";
  const [productKey, angle] = key.includes("__") ? key.split("__", 2) : [key, "unknown"];

  const response = entry.response;
  if (!response || response.error) {
    return { productKey, angle, error: response?.error?.message || "Generation failed", promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  }

  const parts = response.candidates?.[0]?.content?.parts || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imagePart = parts.find((p: any) => p.inlineData);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textPart = parts.find((p: any) => p.text);

  const usage = response.usageMetadata;
  const promptTokens = usage?.promptTokenCount || 0;
  const completionTokens = usage?.candidatesTokenCount || 0;
  const totalTokens = usage?.totalTokenCount || (promptTokens + completionTokens);

  if (imagePart?.inlineData) {
    return {
      productKey,
      angle,
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
      description: textPart?.text || "",
      promptTokens,
      completionTokens,
      totalTokens,
    };
  }

  return { productKey, angle, error: "No image generated", promptTokens, completionTokens, totalTokens };
}
