import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    sourceAssetId: v.id("assets"),
    resultFileId: v.optional(v.id("_storage")),
    presetSlug: v.string(),
    customPrompt: v.optional(v.string()),
    mode: v.union(v.literal("product"), v.literal("image-edit")),
    status: v.union(
      v.literal("completed"),
      v.literal("failed"),
      v.literal("saved")
    ),
    errorMessage: v.optional(v.string()),
    batchJobId: v.optional(v.id("batchJobs")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");

    return await ctx.db.insert("photoshootResults", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const saveToAssets = mutation({
  args: {
    id: v.id("photoshootResults"),
    fileName: v.string(),
    assetType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const result = await ctx.db.get(args.id);
    if (!result) throw new Error("Photoshoot result not found");
    if (result.userId !== userId) throw new Error("Not authorized");
    if (!result.resultFileId) throw new Error("No result file to save");

    const assetId = await ctx.db.insert("assets", {
      workspaceId: result.workspaceId,
      userId,
      scope: "workspace",
      fileId: result.resultFileId,
      fileName: args.fileName,
      type: "product",
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.id, {
      resultAssetId: assetId,
      status: "saved",
    });

    return assetId;
  },
});

export const archive = mutation({
  args: { id: v.id("photoshootResults") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const result = await ctx.db.get(args.id);
    if (!result) throw new Error("Photoshoot result not found");
    if (result.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { archived: true });
  },
});

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) return [];

    const results = await ctx.db
      .query("photoshootResults")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(100);

    const filtered = results.filter((r) => !r.archived);

    return await Promise.all(
      filtered.map(async (r) => ({
        ...r,
        resultFileUrl: r.resultFileId ? await ctx.storage.getUrl(r.resultFileId) : null,
      }))
    );
  },
});

export const listBySourceAsset = query({
  args: { sourceAssetId: v.id("assets") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Verify the user owns this asset
    const asset = await ctx.db.get(args.sourceAssetId);
    if (!asset || asset.userId !== userId) return [];

    const results = await ctx.db
      .query("photoshootResults")
      .withIndex("by_source_asset", (q) =>
        q.eq("sourceAssetId", args.sourceAssetId)
      )
      .order("desc")
      .take(50);

    return results.filter((r) => !r.archived);
  },
});
