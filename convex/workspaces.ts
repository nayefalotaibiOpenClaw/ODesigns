import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    defaultLanguage: v.union(v.literal("en"), v.literal("ar")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workspaces", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    defaultLanguage: v.optional(v.union(v.literal("en"), v.literal("ar"))),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    // Filter out undefined values
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ─── Website Info ──────────────────────────────────────────────────────

export const updateWebsiteInfo = mutation({
  args: {
    id: v.id("workspaces"),
    websiteInfo: v.object({
      companyName: v.optional(v.string()),
      description: v.optional(v.string()),
      industry: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      targetAudience: v.optional(v.string()),
      tone: v.optional(v.string()),
      contact: v.optional(v.object({
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        address: v.optional(v.string()),
        socialMedia: v.optional(v.array(v.string())),
      })),
      ogImage: v.optional(v.string()),
      rawContent: v.optional(v.string()),
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      fetchedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { websiteInfo: args.websiteInfo });
  },
});

