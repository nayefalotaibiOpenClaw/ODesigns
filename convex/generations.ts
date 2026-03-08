import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.optional(v.id("collections")),
    userId: v.id("users"),
    prompt: v.string(),
    type: v.union(
      v.literal("new"),
      v.literal("variant_language"),
      v.literal("variant_device"),
      v.literal("variant_size")
    ),
    sourcePostId: v.optional(v.id("posts")),
    config: v.object({
      features: v.optional(v.array(v.string())),
      style: v.optional(v.string()),
      targetLanguage: v.optional(v.string()),
      targetDevice: v.optional(v.string()),
      assetsIncluded: v.array(v.id("assets")),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generations", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const markCompleted = mutation({
  args: {
    id: v.id("generations"),
    resultPostId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      resultPostId: args.resultPostId,
    });
  },
});

export const markFailed = mutation({
  args: { id: v.id("generations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "failed" });
  },
});

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(50);
  },
});
