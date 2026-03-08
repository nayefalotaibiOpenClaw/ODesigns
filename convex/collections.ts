import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    name: v.string(),
    mode: v.union(
      v.literal("social_grid"),
      v.literal("social_story"),
      v.literal("appstore_preview")
    ),
    platform: v.optional(
      v.union(
        v.literal("instagram"),
        v.literal("twitter"),
        v.literal("linkedin"),
        v.literal("appstore"),
        v.literal("playstore")
      )
    ),
    device: v.optional(
      v.union(
        v.literal("iphone"),
        v.literal("android"),
        v.literal("ipad"),
        v.literal("android_tablet"),
        v.literal("desktop")
      )
    ),
    language: v.union(v.literal("en"), v.literal("ar")),
    aspectRatio: v.union(
      v.literal("1:1"),
      v.literal("4:5"),
      v.literal("9:16"),
      v.literal("16:9"),
      v.literal("4:3")
    ),
    sourceCollectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("collections", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("collections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getVariants = query({
  args: { sourceCollectionId: v.id("collections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("collections")
      .withIndex("by_source", (q) =>
        q.eq("sourceCollectionId", args.sourceCollectionId)
      )
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("collections"),
    name: v.optional(v.string()),
    mode: v.optional(
      v.union(
        v.literal("social_grid"),
        v.literal("social_story"),
        v.literal("appstore_preview")
      )
    ),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    aspectRatio: v.optional(
      v.union(
        v.literal("1:1"),
        v.literal("4:5"),
        v.literal("9:16"),
        v.literal("16:9"),
        v.literal("4:3")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    // Delete all posts in this collection first
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.id))
      .collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }
    await ctx.db.delete(args.id);
  },
});
