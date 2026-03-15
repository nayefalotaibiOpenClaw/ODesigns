import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { aiRateLimiter } from "@/lib/security/rate-limit";

const MODEL = "gemini-3.1-flash-image-preview";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const rateLimitRes = aiRateLimiter.check(req, user._id);
  if (rateLimitRes) return rateLimitRes;

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { imageBase64, mimeType, angles, prompts, customPrompt, mode } = body as {
      imageBase64: string;
      mimeType: string;
      angles: string[];
      prompts?: Record<string, string>;
      customPrompt?: string;
      mode?: "product" | "image-edit";
    };

    const editMode = mode || "product";

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Validate MIME type
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported image format" },
        { status: 400 }
      );
    }

    // Validate custom prompt length
    if (customPrompt && customPrompt.length > 2000) {
      return NextResponse.json(
        { error: "Custom prompt exceeds 2000 characters" },
        { status: 400 }
      );
    }

    if (!angles || !Array.isArray(angles) || angles.length === 0) {
      return NextResponse.json(
        { error: "At least one angle preset is required" },
        { status: 400 }
      );
    }

    if (angles.length > 19) {
      return NextResponse.json(
        { error: "Maximum 19 angles per request" },
        { status: 400 }
      );
    }

    // Generate each angle in parallel
    const results = await Promise.all(
      angles.map(async (angle) => {
        let prompt: string | undefined;
        if (angle === "custom" && customPrompt) {
          prompt = `REFERENCE IMAGE: The attached image shows the EXACT product you must use. Study every detail — the packaging, colors, branding, labels, text, shape, and texture. You MUST use this exact product in the output, not a generic or imagined version.

USER REQUEST:
${customPrompt}

CRITICAL: The product in your output MUST match the attached reference image exactly. Do not invent or guess what the product looks like — copy it precisely from the reference image.`;
        } else if (prompts && prompts[angle]) {
          prompt = prompts[angle];
        }

        if (!prompt) {
          return { angle, error: "Unknown angle preset" };
        }

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        inlineData: {
                          mimeType,
                          data: imageBase64,
                        },
                      },
                      {
                        text: editMode === "image-edit"
                          ? `You are a professional photographer and image editor. Your task is to re-render this image from a different camera angle while preserving the entire scene.

IMPORTANT RULES:
- Keep the EXACT same scene — same objects, background, environment, colors, lighting style, and mood
- Do NOT change the subject, do NOT add or remove objects
- Only change the CAMERA POSITION/ANGLE as instructed
- Output a high-quality, photorealistic image that looks like the same photo taken from a different angle
- Maintain the same aspect ratio and image quality

INSTRUCTION:
${prompt}`
                          : `You are a professional product photographer and image editor. Your task is to transform product images into different angles and perspectives.

IMPORTANT RULES:
- Keep the EXACT same product — same colors, branding, labels, text, shape, and details
- Only change the viewing angle/perspective as instructed
- Output a high-quality, photorealistic image
- The product must be the clear focal point

INSTRUCTION:
${prompt}`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  responseModalities: ["IMAGE", "TEXT"],
                  temperature: 0.4,
                },
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error("Gemini API error:", data);
            return { angle, error: "Generation failed", promptTokens: 0, completionTokens: 0, totalTokens: 0 };
          }

          // Extract token usage
          const usageMetadata = data?.usageMetadata;
          const promptTok = usageMetadata?.promptTokenCount || 0;
          const completionTok = usageMetadata?.candidatesTokenCount || 0;
          const totalTok = usageMetadata?.totalTokenCount || (promptTok + completionTok);

          // Extract image from response
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find(
            (p: { inlineData?: { mimeType: string; data: string } }) =>
              p.inlineData
          );
          const textPart = parts.find(
            (p: { text?: string }) => p.text
          );

          if (imagePart?.inlineData) {
            return {
              angle,
              imageBase64: imagePart.inlineData.data,
              mimeType: imagePart.inlineData.mimeType,
              description: textPart?.text || "",
              promptTokens: promptTok,
              completionTokens: completionTok,
              totalTokens: totalTok,
            };
          }

          return { angle, error: "No image generated", promptTokens: promptTok, completionTokens: completionTok, totalTokens: totalTok };
        } catch (err) {
          console.error(`Failed to generate ${angle}:`, err);
          return { angle, error: "Generation failed", promptTokens: 0, completionTokens: 0, totalTokens: 0 };
        }
      })
    );

    // Aggregate usage across all angle generations
    const totalUsage = results.reduce(
      (acc, r) => ({
        promptTokens: acc.promptTokens + (r.promptTokens || 0),
        completionTokens: acc.completionTokens + (r.completionTokens || 0),
        totalTokens: acc.totalTokens + (r.totalTokens || 0),
      }),
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    );

    return NextResponse.json({
      results: results.map(({ promptTokens: _p, completionTokens: _c, totalTokens: _t, ...rest }) => rest),
      usage: {
        model: MODEL,
        ...totalUsage,
      },
    });
  } catch (err) {
    console.error("Product edit error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
