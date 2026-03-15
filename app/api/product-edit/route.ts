import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { aiRateLimiter } from "@/lib/security/rate-limit";

const MODEL = "gemini-3.1-flash-image-preview";

// ─── Product mode: clean white background, product photography ───
const PRODUCT_PRESETS: Record<string, string> = {
  // Angle presets
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
  // Social media presets
  "hand-holding":
    "Show a realistic human hand elegantly holding or presenting this exact product. The hand should be well-groomed and natural-looking. Soft, blurred background (bokeh effect) in a neutral or pastel tone. The product must remain exactly as-is — same colors, labels, branding, and details. The grip should feel natural and show the product's scale. Professional lifestyle photography style perfect for Instagram.",
  "flat-lay-styled":
    "Create a beautiful flat lay composition with this exact product as the hero, surrounded by complementary props that match its category — for food: ingredients, utensils, herbs; for beauty: flowers, fabrics, stones; for tech: cables, notebooks, coffee; for fashion: accessories, sunglasses, watches. Shot from directly above. The product stays exactly the same. Aesthetic, Instagram-worthy styling with soft natural lighting.",
  "in-use":
    "Show this exact product being actively used in a natural, realistic way. If it's a drink, show it being poured or sipped. If it's skincare, show it being applied. If it's tech, show it being held/used. If it's food, show it being prepared or served. Keep the product exactly as-is. The scene should feel authentic and candid — perfect for social media engagement. Soft natural lighting, slightly blurred background.",
  "gradient-bg":
    "Place this exact product on a smooth, modern gradient background that complements the product's colors. The gradient should be vibrant but not overpowering — think soft transitions between 2-3 harmonious colors. The product should float with a soft reflection/shadow beneath it. Clean, modern, editorial feel perfect for social media ads. Keep all product details exactly.",
  "splash-action":
    "Create a dynamic action shot with this exact product. Add motion elements that match the product — water splash for beverages/skincare, powder burst for cosmetics, crumbs/steam for food, light trails for tech. The product must remain sharp and in focus while the action elements add energy around it. Keep all product details exactly. High-speed photography feel, dramatic lighting.",
  "minimal-shadow":
    "Show this exact product on a clean white or very light gray surface with only a long, dramatic directional shadow as the design element. Harsh single-light-source creating a sharp, elongated shadow. Ultra-minimal, editorial style. The product and its shadow are the only elements. Keep all product details exactly. High-end, magazine-style feel.",
  "seasonal-autumn":
    "Place this exact product in a warm autumn setting — think warm golden/orange tones, fallen leaves, cozy textures like knit fabrics, warm wood surfaces, or cinnamon sticks. Soft, warm golden-hour lighting. The product stays exactly the same. The scene should feel seasonal and cozy, perfect for fall marketing campaigns on social media.",
  "texture-surface":
    "Place this exact product on a beautiful textured surface that creates visual contrast — marble, dark slate, raw wood, concrete, terrazzo, linen, or brushed metal. The surface texture adds depth and sophistication. Simple composition with just the product and surface. Soft directional lighting. Keep all product details exactly. Premium, editorial feel for social media.",
};

// ─── Image edit mode: preserves scene/background, changes camera angle ───
const IMAGE_EDIT_PRESETS: Record<string, string> = {
  // Angle presets
  "front-clean":
    "Re-render this exact scene from a clean, straight-on front-facing camera angle. Keep the SAME background, environment, lighting, and all objects exactly as they are. Only change the camera position to face the subject directly from the front.",
  "three-quarter":
    "Re-render this exact scene from a 3/4 perspective (camera rotated about 45 degrees to the right). Keep the SAME background, environment, lighting, colors, and all objects exactly as they are. Only change the camera angle.",
  "side-view":
    "Re-render this exact scene from a direct side profile camera angle. Keep the SAME background, environment, lighting, and all objects exactly as they are. Only change the camera to view from the side.",
  "top-down":
    "Re-render this exact scene from directly above (bird's eye / top-down view). Keep the SAME background, environment, objects, and lighting. Only change the camera to look straight down.",
  "slight-tilt":
    "Re-render this exact scene with the camera slightly tilted (about 15 degrees). Keep the SAME background, environment, lighting, and all objects exactly as they are. Add a subtle Dutch angle for a dynamic, energetic feel.",
  "close-up":
    "Re-render this scene as a close-up shot, zooming in on the main subject or the most interesting detail. Keep the SAME background, environment, lighting, and style. Only change the camera to zoom in closer.",
  "lifestyle":
    "Re-render this scene with the same subject but enhance the environment to feel more lifestyle/aspirational. Keep the subject exactly as-is but make the surrounding environment feel warmer, more lived-in, and premium. Maintain the same general setting and color palette.",
  "hero-angle":
    "Re-render this exact scene from a dramatic low camera angle, looking slightly upward at the main subject. Keep the SAME background, environment, lighting, and all objects exactly as they are. Only change the camera to a low hero perspective for a powerful, premium feel.",
  // Social media presets
  "hand-holding":
    "Re-render this scene showing a realistic human hand elegantly holding or interacting with the main subject. Keep the SAME subject, its details, and the overall color palette. The hand should feel natural. Add a soft blurred background. The composition should feel like a candid Instagram lifestyle photo.",
  "flat-lay-styled":
    "Re-render this scene as a styled flat lay (top-down view) with the main subject as the hero, adding complementary props around it that match the scene's mood and category. Keep the subject exactly as-is. Add aesthetic styling elements. Soft, even lighting from above.",
  "in-use":
    "Re-render this scene showing the main subject being actively used in a natural, realistic way. Keep the subject exactly as-is. Show a person or hands interacting with it in a way that feels authentic and candid. Slightly blurred background, natural lighting.",
  "gradient-bg":
    "Re-render this scene but replace the background with a smooth, modern gradient that complements the subject's colors. Keep the subject exactly as-is. The gradient should be vibrant but not overpowering. Add a soft reflection/shadow beneath the subject. Clean, editorial feel.",
  "splash-action":
    "Re-render this scene with dynamic action elements added — water splash, powder burst, crumbs flying, light trails, or smoke depending on the subject. The subject must remain sharp and in focus. Keep all details exactly. High-speed photography feel with dramatic energy.",
  "minimal-shadow":
    "Re-render this scene in an ultra-minimal style — the subject on a clean white surface with only a dramatic directional shadow. Remove all other elements. Harsh single light source. Keep the subject exactly as-is. High-end editorial feel.",
  "seasonal-autumn":
    "Re-render this scene in a warm autumn setting — golden/orange tones, fallen leaves, cozy textures, warm wood. Keep the subject exactly as-is. Warm golden-hour lighting. Seasonal and cozy feel perfect for fall campaigns.",
  "texture-surface":
    "Re-render this scene placing the subject on a beautiful textured surface — marble, dark slate, raw wood, concrete, terrazzo, or brushed metal. Keep the subject exactly as-is. Simple composition, soft directional lighting. Premium editorial feel.",
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
    const { imageBase64, mimeType, angles, customPrompt, mode } = body as {
      imageBase64: string;
      mimeType: string;
      angles: string[];
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

    const presets = editMode === "image-edit" ? IMAGE_EDIT_PRESETS : PRODUCT_PRESETS;

    // Generate each angle in parallel
    const results = await Promise.all(
      angles.map(async (angle) => {
        let prompt: string | undefined;
        if (angle === "custom" && customPrompt) {
          // Wrap custom prompt to ensure the AI uses the reference image
          prompt = `REFERENCE IMAGE: The attached image shows the EXACT product you must use. Study every detail — the packaging, colors, branding, labels, text, shape, and texture. You MUST use this exact product in the output, not a generic or imagined version.

USER REQUEST:
${customPrompt}

CRITICAL: The product in your output MUST match the attached reference image exactly. Do not invent or guess what the product looks like — copy it precisely from the reference image.`;
        } else {
          prompt = presets[angle];
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
