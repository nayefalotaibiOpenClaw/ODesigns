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

// Presets are now stored in Convex (photoshootPresets table).
// Client resolves preset slug → prompt via Convex query and sends prompts directly.

// ─── Types ───────────────────────────────────────────────────────
interface BatchProduct {
  key: string; // unique identifier for this product (e.g. asset ID)
  imageBase64: string;
  mimeType: string;
  angles: string[];
  prompts?: Record<string, string>; // angle slug → prompt text (resolved by client from Convex)
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

    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const systemPrompt = getSystemPrompt(mode);

    // Build JSONL lines — one line per (product × angle)
    const jsonlLines: string[] = [];
    let totalRequests = 0;

    for (const product of products) {
      if (!product.imageBase64 || !product.mimeType || !product.key) continue;
      if (!ALLOWED_MIME_TYPES.includes(product.mimeType)) continue;
      if (product.customPrompt && product.customPrompt.length > 2000) continue;
      const angles = product.angles || ["front-clean"];

      for (const angle of angles) {
        let prompt: string | undefined;
        if (angle === "custom" && product.customPrompt) {
          prompt = `REFERENCE IMAGE: The attached image shows the EXACT product you must use. Study every detail — the packaging, colors, branding, labels, text, shape, and texture. You MUST use this exact product in the output, not a generic or imagined version.\n\nUSER REQUEST:\n${product.customPrompt}\n\nCRITICAL: The product in your output MUST match the attached reference image exactly. Do not invent or guess what the product looks like — copy it precisely from the reference image.`;
        } else if (product.prompts && product.prompts[angle]) {
          prompt = product.prompts[angle];
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
