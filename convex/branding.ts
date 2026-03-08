import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const colorsValidator = v.object({
  primary: v.string(),
  primaryLight: v.string(),
  primaryDark: v.string(),
  accent: v.string(),
  accentLight: v.string(),
  accentLime: v.string(),
  accentGold: v.string(),
  accentOrange: v.string(),
  border: v.string(),
});

export const getByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    brandName: v.string(),
    tagline: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    logoDark: v.optional(v.id("_storage")),
    colors: colorsValidator,
    fonts: v.object({
      heading: v.string(),
      body: v.string(),
    }),
    savedPalettes: v.optional(
      v.array(v.object({ name: v.string(), colors: colorsValidator }))
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    const data = {
      ...args,
      savedPalettes: args.savedPalettes ?? [],
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("branding", data);
  },
});

export const updateColors = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    colors: colorsValidator,
  },
  handler: async (ctx, args) => {
    const branding = await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
    if (!branding) throw new Error("Branding not found");
    await ctx.db.patch(branding._id, { colors: args.colors });
  },
});

export const savePalette = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    colors: colorsValidator,
  },
  handler: async (ctx, args) => {
    const branding = await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
    if (!branding) throw new Error("Branding not found");

    const palettes = [...branding.savedPalettes, { name: args.name, colors: args.colors }];
    await ctx.db.patch(branding._id, { savedPalettes: palettes });
  },
});
