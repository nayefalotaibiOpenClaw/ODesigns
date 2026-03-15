import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { aiRateLimiter } from "@/lib/security/rate-limit";

const MODEL = "gemini-3.1-flash-image-preview";

const ANGLE_PRESETS: Record<string, string> = {
  "front-clean":
    "Show this exact product from a clean front-facing angle on a pure white background. Ensure the product is well-lit, centered, with a subtle shadow beneath it. Keep the product exactly as it is — same colors, branding, and details.",
  "three-quarter":
    "Show this exact product from a 3/4 perspective angle (rotated about 45 degrees to the right) on a pure white background. Maintain all product details, colors, and branding exactly. Add professional studio lighting with a soft shadow.",
  "side-view":
    "Show this exact product from a direct side profile view on a pure white background. Keep all details, colors, and branding exactly. Professional studio lighting with a subtle shadow.",
  "top-down":
    "Show this exact product from directly above (top-down / flat lay view) on a pure white background. Maintain all product details, colors, and proportions exactly. Even lighting with a soft shadow.",
  "slight-tilt":
    "Show this exact product with a slight dynamic tilt (leaning about 15 degrees) on a pure white background. This creates an energetic, modern feel. Keep all product details exactly. Studio lighting with a cast shadow.",
  "close-up":
    "Show a close-up detail shot of this product, focusing on the most interesting texture, material, or design element. Pure white background, macro-style photography feel. Keep all product details exactly.",
  "lifestyle":
    "Place this exact product in a natural, lifestyle setting that matches its category. If it's a food product, show it on a kitchen counter or table. If it's a tech product, show it on a modern desk. If it's cosmetics, show it in a bathroom/vanity setting. Keep the product exactly as-is — same branding, colors, details. The setting should feel premium and aspirational.",
  "hero-angle":
    "Show this exact product from a dramatic hero angle — slightly low camera position looking up at the product, creating a powerful and premium feel. Pure white or subtle gradient background. Professional studio lighting with dramatic shadows. Keep all product details exactly.",
};

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
    const { imageBase64, mimeType, angles, customPrompt } = body as {
      imageBase64: string;
      mimeType: string;
      angles: string[];
      customPrompt?: string;
    };

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    if (!angles || !Array.isArray(angles) || angles.length === 0) {
      return NextResponse.json(
        { error: "At least one angle preset is required" },
        { status: 400 }
      );
    }

    if (angles.length > 6) {
      return NextResponse.json(
        { error: "Maximum 6 angles per request" },
        { status: 400 }
      );
    }

    // Generate each angle in parallel
    const results = await Promise.all(
      angles.map(async (angle) => {
        const prompt =
          angle === "custom" && customPrompt
            ? customPrompt
            : ANGLE_PRESETS[angle];

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
                        text: `You are a professional product photographer and image editor. Your task is to transform product images into different angles and perspectives.

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
            return { angle, error: "Generation failed" };
          }

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
            };
          }

          return { angle, error: "No image generated" };
        } catch (err) {
          console.error(`Failed to generate ${angle}:`, err);
          return { angle, error: "Generation failed" };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Product edit error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
