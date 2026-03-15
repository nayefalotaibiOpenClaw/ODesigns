import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Create a new batch job record
export const create = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    jobName: v.string(),
    displayName: v.string(),
    state: v.string(),
    mode: v.string(),
    totalRequests: v.number(),
    productsCount: v.number(),
    inputFile: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.workspaceId) {
      const workspace = await ctx.db.get(args.workspaceId);
      if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    }

    return await ctx.db.insert("batchJobs", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

// Update batch job state and optionally store results
export const updateState = mutation({
  args: {
    id: v.id("batchJobs"),
    state: v.string(),
    results: v.optional(v.string()),
    usage: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const job = await ctx.db.get(args.id);
    if (!job || job.userId !== userId) throw new Error("Not authorized");

    const { id, ...updates } = args;
    // Remove undefined fields
    const patch: Record<string, unknown> = { state: updates.state };
    if (updates.results !== undefined) patch.results = updates.results;
    if (updates.usage !== undefined) patch.usage = updates.usage;
    if (updates.errorMessage !== undefined) patch.errorMessage = updates.errorMessage;
    if (updates.completedAt !== undefined) patch.completedAt = updates.completedAt;

    await ctx.db.patch(id, patch);
  },
});

// List batch jobs for user (most recent first)
export const listByUser = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    let jobs;
    if (args.workspaceId) {
      jobs = await ctx.db
        .query("batchJobs")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .order("desc")
        .take(20);
      // Filter to user's jobs only
      jobs = jobs.filter((j) => j.userId === userId);
    } else {
      jobs = await ctx.db
        .query("batchJobs")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(20);
    }

    // Don't return full results blob in list view (too large)
    return jobs.map((j) => ({
      ...j,
      results: j.results ? `[${JSON.parse(j.results).length} results]` : undefined,
    }));
  },
});

// Get single batch job with full results
export const get = query({
  args: { id: v.id("batchJobs") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const job = await ctx.db.get(args.id);
    if (!job || job.userId !== userId) return null;

    return job;
  },
});
