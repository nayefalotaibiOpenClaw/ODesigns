import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// ─── Group definitions ───────────────────────────────────────────────────────
const PRESET_GROUPS = {
  angles: [
    "front-clean",
    "three-quarter",
    "side-view",
    "top-down",
    "slight-tilt",
    "close-up",
    "hero-angle",
  ],
  social: [
    "hand-holding",
    "flat-lay-styled",
    "in-use",
    "gradient-bg",
    "splash-action",
    "minimal-shadow",
    "seasonal-autumn",
    "texture-surface",
    "lifestyle",
  ],
  lifestyle: [
    "car-interior",
    "car-hood",
    "car-window",
    "held-close-up",
    "person-holding",
    "drive-thru",
    "group-table",
    "sauce-pour",
    "pool-backdrop",
    "tray-serving",
    "velvet-backdrop",
    "floating-product",
    "nails-grip",
  ],
  creative: [
    "stacked-cross",
    "hands-compete",
    "color-block",
    "wall-punch",
    "duo-compare",
    "extreme-macro",
    "outfit-match",
  ],
} as const;

// Build slug → group lookup
function getGroup(
  slug: string
): "angles" | "social" | "lifestyle" | "creative" {
  for (const [group, slugs] of Object.entries(PRESET_GROUPS)) {
    if ((slugs as readonly string[]).includes(slug)) {
      return group as "angles" | "social" | "lifestyle" | "creative";
    }
  }
  return "social";
}

// Build slug → sortOrder lookup (global index across all groups)
function getSortOrder(slug: string): number {
  let order = 0;
  for (const slugs of Object.values(PRESET_GROUPS)) {
    for (const s of slugs) {
      if (s === slug) return order;
      order++;
    }
  }
  return order;
}

// Slug → human-readable name (e.g. "front-clean" → "Front Clean")
function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Full product-mode prompts ───────────────────────────────────────────────
const PRODUCT_PRESETS: Record<string, string> = {
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
  "hero-angle":
    "Show this exact product from a dramatic hero angle — slightly low camera position looking up at the product, creating a powerful and premium feel. Pure white or subtle gradient background. Professional studio lighting with dramatic shadows. Keep all product details exactly.",
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
  lifestyle:
    "Place this exact product in a natural, lifestyle setting that matches its category. If it's a food product, show it on a kitchen counter or table. If it's a tech product, show it on a modern desk. If it's cosmetics, show it in a bathroom/vanity setting. Keep the product exactly as-is — same branding, colors, details. The setting should feel premium and aspirational.",
  "car-interior":
    "A premium commercial lifestyle photograph shot from inside a luxury modern car. A hand model with natural, healthy skin is holding this exact product inside the car, bringing it toward the camera. The lighting is warm golden hour sunlight streaming through the windshield, creating a glowing aura around the product. Background is a soft-focus leather car interior with dashboard visible. The product must be the hero — sharp, detailed, with every label and branding element from the reference image perfectly visible. Cinematic bokeh, 8K quality, aspirational and appetizing. Keep the product EXACTLY as shown in the reference image.",
  "car-hood":
    "A stylish editorial product shot placing this exact product on the hood of a beautiful classic or luxury car. The car paint creates a glossy, reflective surface. The product sits naturally on the hood, perhaps with its packaging open or arranged attractively. Warm cinematic lighting — golden hour or dramatic studio light. The car color should complement the product packaging. Shallow depth of field with the product in sharp focus. Keep the product EXACTLY as shown in the reference image. High-end food/product photography style.",
  "car-window":
    "A hand reaching out of a car window holding this exact product up against a blue sky with soft clouds. Shot from outside the car looking up. The arm extends from the car window casually. Bright, cheerful daylight with the sun creating a warm glow around the product. The product is the clear focal point against the sky. Aspirational, social media-worthy composition. Keep the product EXACTLY as shown in the reference image.",
  "held-close-up":
    "A tight close-up shot of two hands cradling and presenting this exact product. The person is wearing a stylish solid-colored outfit (blue, earth tone, or neutral). Shot is cropped to show mainly the hands and the product against the clothing as background. Soft natural lighting, editorial fashion photography style. The product is the absolute hero — every detail sharp and visible. Keep the product EXACTLY as shown in the reference image. Think high-end brand campaign.",
  "person-holding":
    "A lifestyle photograph of a person holding this exact product close to the camera. The person is slightly out of focus in the background wearing casual stylish clothing. The product is in sharp focus in the foreground, held at about chest height. Warm natural lighting, candid and authentic feel. The composition feels like a real Instagram post — not overly staged. Keep the product EXACTLY as shown in the reference image.",
  "drive-thru":
    "A commercial drive-thru handoff moment — one hand passing this exact product through a car window to another hand receiving it. Shot from outside the car at window level. The product bag/packaging is the hero, branding visible. Moody urban lighting or warm golden tones. The car body and window frame the composition. Keep the product EXACTLY as shown in the reference image. Authentic fast-casual brand photography style.",
  "group-table":
    "A top-down overhead shot of a wooden table with multiple hands reaching for this exact product from different directions. The product is placed in the center as the hero, with plates, drinks, and napkins scattered around creating a busy social dining scene. Warm ambient restaurant lighting with a slight film grain. Multiple people's hands and arms visible from the edges. Keep the product EXACTLY as shown in the reference image. Convivial, social, Instagram-worthy group dining moment.",
  "sauce-pour":
    "A dramatic action shot against a clean light background — one hand holds this exact product while another hand pours sauce, drizzle, or topping onto it from above. The sauce creates a beautiful mid-air stream. Hard directional lighting creates sharp shadows on the clean background. Both hands have stylish accessories (rings, bracelets). The product is the hero. Keep the product EXACTLY as shown in the reference image. Bold editorial food photography with high contrast.",
  "pool-backdrop":
    "Multiple hands holding variations of this exact product up against a beautiful blue swimming pool water background. Shot from above looking down at the pool surface. The hands reach in from the edges of the frame. Bright summer daylight, vibrant blue water creates a stunning backdrop. The products are wrapped in branded packaging. Keep the product EXACTLY as shown in the reference image. Summer campaign, aspirational pool party vibes.",
  "tray-serving":
    "A person wearing a branded or plain t-shirt serving this exact product on a metal serving tray or paper-lined tray. Shot at waist level, the tray is the focal point with the product centered on it. The person's torso is slightly out of focus behind. Restaurant/kitchen environment with warm lighting. Keep the product EXACTLY as shown in the reference image. Authentic fast-casual service moment, editorial quality.",
  "velvet-backdrop":
    "This exact product presented on an open palm of a hand, held up against a rich dark velvet curtain or fabric backdrop (deep green, burgundy, or navy). The hand enters from below, presenting the product like a prized offering. Dramatic moody lighting with the product as the glowing hero. Keep the product EXACTLY as shown in the reference image. Premium, theatrical, high-end brand campaign feel.",
  "floating-product":
    "This exact product floating/levitating in mid-air against a clean cream or light beige background. Multiple pieces or angles of the product scattered at different heights and rotations, creating a dynamic floating composition. Soft even studio lighting, no harsh shadows. The products appear weightless and artfully arranged. Keep the product EXACTLY as shown in the reference image. Clean editorial menu/catalog style.",
  "nails-grip":
    "A dramatic close-up of a single hand with stylish painted nails (bold color like green, red, or dark) gripping this exact product tightly. Shot against a clean muted background (sage green, soft gray, or cream). The hand is the compositional focus alongside the product — every nail, ring, and texture visible. Soft directional studio lighting. Keep the product EXACTLY as shown in the reference image. High-fashion editorial food photography.",
  "stacked-cross":
    "Multiple copies of this exact product stacked vertically, each one cut in half to reveal the cross-section interior. Arranged in a vertical tower against a clean concrete or marble background. Hands hold the top and bottom products. The cross-sections are the hero — showing textures, layers, and fillings in beautiful detail. Soft directional lighting. Keep the product EXACTLY as shown in the reference image. Editorial menu photography, vertical composition.",
  "hands-compete":
    "Multiple hands desperately reaching and grabbing for this exact product from all directions against a bold solid-color background (vibrant orange, yellow, or pink). One hand in the center holds the product triumphantly above the rest. The reaching hands create dramatic tension and desire. Bold, fun, energetic composition. Keep the product EXACTLY as shown in the reference image. Viral social media ad campaign style.",
  "color-block":
    "This exact product shown twice — two hands each holding one, arranged diagonally against a bold two-tone color-block background (red and yellow, or orange and pink split vertically). The products mirror each other on opposite sides. Pop art, graphic design feel with strong color contrast. Keep the product EXACTLY as shown in the reference image. Bold, eye-catching social media campaign.",
  "wall-punch":
    "Two hands punching through a solid-colored paper wall (vibrant purple, pink, or yellow), each holding this exact product. The torn paper edges create a dynamic 3D effect around the fists. Shot straight-on. Playful, bold, and surprising composition. Keep the product EXACTLY as shown in the reference image. Creative brand campaign, punchy and memorable.",
  "duo-compare":
    "Two different hands each holding this exact product, presented side by side against a clean warm beige or cream studio background. One hand comes from lower-left, the other from upper-right, creating a balanced diagonal composition. Both products are in sharp focus. Clean studio lighting with soft shadows. Keep the product EXACTLY as shown in the reference image. Menu comparison style, editorial quality.",
  "extreme-macro":
    "An extreme close-up macro shot filling the entire frame with this exact product's most appetizing or interesting detail — textures, layers, drips, melting, crumbs. So close you can see every grain, fiber, and glistening surface. Shallow depth of field with parts going beautifully out of focus. Warm, appetizing lighting. Keep the product EXACTLY as shown in the reference image. Mouth-watering food photography.",
  "outfit-match":
    "A person wearing a solid monochrome outfit (blue, sage, or earth tone) holding this exact product close to their torso. The outfit color and product create a cohesive color story. Shot from chest to waist, the person's face is cropped out. The product is the clear focal point against the matching fabric background. Soft natural lighting. Keep the product EXACTLY as shown in the reference image. Fashion-meets-food editorial style.",
};

// ─── Full image-edit-mode prompts ────────────────────────────────────────────
const IMAGE_EDIT_PRESETS: Record<string, string> = {
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
  "hero-angle":
    "Re-render this exact scene from a dramatic low camera angle, looking slightly upward at the main subject. Keep the SAME background, environment, lighting, and all objects exactly as they are. Only change the camera to a low hero perspective for a powerful, premium feel.",
  lifestyle:
    "Re-render this scene with the same subject but enhance the environment to feel more lifestyle/aspirational. Keep the subject exactly as-is but make the surrounding environment feel warmer, more lived-in, and premium. Maintain the same general setting and color palette.",
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
  "car-interior":
    "Re-render this scene inside a luxury car interior. A hand holds the subject inside the car with warm golden hour light streaming through the windshield. Keep the subject exactly as-is. Soft-focus leather interior background, cinematic bokeh.",
  "car-hood":
    "Re-render this scene with the subject placed on the hood of a classic or luxury car. Glossy reflective car paint surface. Keep the subject exactly as-is. Warm cinematic lighting, shallow depth of field. Editorial product photography style.",
  "car-window":
    "Re-render this scene with a hand holding the subject out of a car window against a blue sky. Keep the subject exactly as-is. Bright cheerful daylight, aspirational composition. Shot from outside looking up.",
  "held-close-up":
    "Re-render this scene as a tight close-up of hands cradling the subject against a solid-colored outfit. Keep the subject exactly as-is. Soft natural lighting, editorial fashion photography style. Product is the hero.",
  "person-holding":
    "Re-render this scene with a person holding the subject close to camera. Person slightly out of focus wearing casual stylish clothing. Keep the subject exactly as-is. Warm natural lighting, candid Instagram feel.",
  "drive-thru":
    "Re-render as a drive-thru handoff — one hand passing subject through car window to another hand. Keep subject exactly as-is. Moody urban lighting, car window framing.",
  "group-table":
    "Re-render as overhead shot of table with multiple hands reaching for subject from all directions. Keep subject exactly as-is. Warm restaurant lighting, social dining scene.",
  "sauce-pour":
    "Re-render with one hand holding subject while another pours sauce onto it from above. Clean light background, hard directional lighting, sharp shadows. Keep subject exactly as-is.",
  "pool-backdrop":
    "Re-render with hands holding subject up against blue pool water background. Bright summer daylight, vibrant blue backdrop. Keep subject exactly as-is.",
  "tray-serving":
    "Re-render with person serving subject on metal tray. Restaurant setting, warm lighting. Keep subject exactly as-is. Authentic service moment.",
  "velvet-backdrop":
    "Re-render with subject presented on open palm against dark velvet curtain backdrop. Dramatic moody lighting. Keep subject exactly as-is. Premium theatrical feel.",
  "floating-product":
    "Re-render with subject floating/levitating at multiple angles against clean cream background. Weightless, dynamic composition. Keep subject exactly as-is. Editorial catalog style.",
  "nails-grip":
    "Re-render as close-up of hand with painted nails gripping subject against clean muted background. Keep subject exactly as-is. High-fashion editorial style.",
  "stacked-cross":
    "Re-render as vertical stack of subject copies cut in half showing cross-sections. Keep subject exactly as-is. Clean background, editorial menu style.",
  "hands-compete":
    "Re-render with multiple hands reaching for subject against bold solid-color background. One hand holds it up triumphantly. Keep subject exactly as-is. Energetic ad campaign.",
  "color-block":
    "Re-render with subject shown twice on a bold two-tone color-block background. Pop art, graphic design feel. Keep subject exactly as-is.",
  "wall-punch":
    "Re-render with hands punching through colored paper wall holding subject. Torn paper edges create 3D effect. Keep subject exactly as-is. Playful creative campaign.",
  "duo-compare":
    "Re-render with two hands each holding subject, arranged diagonally against cream studio background. Keep subject exactly as-is. Menu comparison editorial.",
  "extreme-macro":
    "Re-render as extreme close-up macro filling entire frame with subject's most detailed textures. Keep subject exactly as-is. Mouth-watering, shallow depth of field.",
  "outfit-match":
    "Re-render with person in monochrome outfit holding subject at torso level. Color-coordinated. Keep subject exactly as-is. Fashion editorial style.",
};

// All preset slugs (union of both maps)
const ALL_SLUGS = Object.keys(PRODUCT_PRESETS);

// ─── seedGlobal (internalMutation) ───────────────────────────────────────────
export const seedGlobal = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Guard against duplicate seeding
    const existing = await ctx.db
      .query("photoshootPresets")
      .withIndex("by_scope", (q) => q.eq("scope", "global"))
      .first();

    if (existing) {
      console.log("Global photoshoot presets already seeded — skipping.");
      return { seeded: 0 };
    }

    const now = Date.now();
    let seeded = 0;

    for (const slug of ALL_SLUGS) {
      const group = getGroup(slug);
      const sortOrder = getSortOrder(slug);
      const name = slugToName(slug);

      // Product mode entry
      await ctx.db.insert("photoshootPresets", {
        scope: "global",
        name,
        slug,
        prompt: PRODUCT_PRESETS[slug],
        mode: "product",
        group,
        sortOrder,
        archived: false,
        createdAt: now,
      });
      seeded++;

      // Image-edit mode entry
      if (IMAGE_EDIT_PRESETS[slug]) {
        await ctx.db.insert("photoshootPresets", {
          scope: "global",
          name,
          slug,
          prompt: IMAGE_EDIT_PRESETS[slug],
          mode: "image-edit",
          group,
          sortOrder,
          archived: false,
          createdAt: now,
        });
        seeded++;
      }
    }

    console.log(`Seeded ${seeded} global photoshoot presets.`);
    return { seeded };
  },
});

// ─── listForWorkspace (query) ────────────────────────────────────────────────
export const listForWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Verify workspace ownership
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) return [];

    // Global presets (not archived)
    const globalPresets = await ctx.db
      .query("photoshootPresets")
      .withIndex("by_scope", (q) => q.eq("scope", "global"))
      .filter((q) => q.neq(q.field("archived"), true))
      .take(200);

    // Workspace-custom presets (not archived)
    const workspacePresets = await ctx.db
      .query("photoshootPresets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) =>
        q.and(
          q.eq(q.field("scope"), "workspace"),
          q.neq(q.field("archived"), true)
        )
      )
      .take(200);

    return [...globalPresets, ...workspacePresets];
  },
});

// ─── create (mutation) — workspace-custom preset ─────────────────────────────
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    prompt: v.string(),
    mode: v.union(v.literal("product"), v.literal("image-edit")),
    group: v.union(
      v.literal("angles"),
      v.literal("social"),
      v.literal("lifestyle"),
      v.literal("creative"),
      v.literal("custom")
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate slug from name
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const now = Date.now();

    const id = await ctx.db.insert("photoshootPresets", {
      workspaceId: args.workspaceId,
      userId,
      scope: "workspace",
      name: args.name,
      slug,
      description: args.description,
      prompt: args.prompt,
      mode: args.mode,
      group: args.group,
      archived: false,
      createdAt: now,
    });

    return id;
  },
});

// ─── update (mutation) — workspace-custom preset ─────────────────────────────
export const update = mutation({
  args: {
    id: v.id("photoshootPresets"),
    name: v.optional(v.string()),
    prompt: v.optional(v.string()),
    mode: v.optional(v.union(v.literal("product"), v.literal("image-edit"))),
    group: v.optional(
      v.union(
        v.literal("angles"),
        v.literal("social"),
        v.literal("lifestyle"),
        v.literal("creative"),
        v.literal("custom")
      )
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const preset = await ctx.db.get(args.id);
    if (!preset) throw new Error("Preset not found");
    if (preset.userId !== userId) throw new Error("Not authorized");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) {
      updates.name = args.name;
      updates.slug = args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (args.prompt !== undefined) updates.prompt = args.prompt;
    if (args.mode !== undefined) updates.mode = args.mode;
    if (args.group !== undefined) updates.group = args.group;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

// ─── archive (mutation) — workspace-custom preset ────────────────────────────
export const archive = mutation({
  args: {
    id: v.id("photoshootPresets"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const preset = await ctx.db.get(args.id);
    if (!preset) throw new Error("Preset not found");
    if (preset.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { archived: true });

    return args.id;
  },
});

// ─── adminCreate (internalMutation) — global preset ──────────────────────────
export const adminCreate = internalMutation({
  args: {
    name: v.string(),
    prompt: v.string(),
    mode: v.union(v.literal("product"), v.literal("image-edit")),
    group: v.union(
      v.literal("angles"),
      v.literal("social"),
      v.literal("lifestyle"),
      v.literal("creative"),
      v.literal("custom")
    ),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const now = Date.now();

    const id = await ctx.db.insert("photoshootPresets", {
      scope: "global",
      name: args.name,
      slug,
      description: args.description,
      prompt: args.prompt,
      mode: args.mode,
      group: args.group,
      sortOrder: args.sortOrder,
      archived: false,
      createdAt: now,
    });

    return id;
  },
});

// ─── adminUpdate (internalMutation) — global preset ──────────────────────────
export const adminUpdate = internalMutation({
  args: {
    id: v.id("photoshootPresets"),
    name: v.optional(v.string()),
    prompt: v.optional(v.string()),
    mode: v.optional(v.union(v.literal("product"), v.literal("image-edit"))),
    group: v.optional(
      v.union(
        v.literal("angles"),
        v.literal("social"),
        v.literal("lifestyle"),
        v.literal("creative"),
        v.literal("custom")
      )
    ),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const preset = await ctx.db.get(args.id);
    if (!preset) throw new Error("Preset not found");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) {
      updates.name = args.name;
      updates.slug = args.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (args.prompt !== undefined) updates.prompt = args.prompt;
    if (args.mode !== undefined) updates.mode = args.mode;
    if (args.group !== undefined) updates.group = args.group;
    if (args.description !== undefined) updates.description = args.description;
    if (args.sortOrder !== undefined) updates.sortOrder = args.sortOrder;

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

// ─── adminArchive (internalMutation) — global preset ─────────────────────────
export const adminArchive = internalMutation({
  args: {
    id: v.id("photoshootPresets"),
  },
  handler: async (ctx, args) => {
    const preset = await ctx.db.get(args.id);
    if (!preset) throw new Error("Preset not found");

    await ctx.db.patch(args.id, { archived: true });

    return args.id;
  },
});
