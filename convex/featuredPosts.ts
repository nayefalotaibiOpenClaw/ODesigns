import { query, mutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

const ADMIN_EMAILS = ["nayefralotaibi@gmail.com"];

async function assertAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  if (!ADMIN_EMAILS.includes(user.email ?? "") && user.role !== "admin") {
    throw new Error("Not admin");
  }
  return user;
}

// ── Public queries (no auth needed — used on marketing pages) ──

/** Get all featured posts, optionally filtered by category */
export const list = query({
  args: {
    category: v.optional(
      v.union(v.literal("social"), v.literal("appstore"), v.literal("ads"))
    ),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("featuredPosts")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    return await ctx.db.query("featuredPosts").collect();
  },
});

// ── Admin mutations ──

const themeValidator = v.object({
  primary: v.string(),
  primaryLight: v.string(),
  primaryDark: v.string(),
  accent: v.string(),
  accentLight: v.string(),
  accentLime: v.string(),
  accentGold: v.string(),
  accentOrange: v.string(),
  border: v.string(),
  font: v.string(),
});

export const create = mutation({
  args: {
    label: v.string(),
    componentCode: v.string(),
    category: v.union(v.literal("social"), v.literal("appstore"), v.literal("ads")),
    theme: themeValidator,
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    return await ctx.db.insert("featuredPosts", {
      label: args.label,
      componentCode: args.componentCode,
      category: args.category,
      theme: args.theme,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("featuredPosts"),
    label: v.optional(v.string()),
    componentCode: v.optional(v.string()),
    category: v.optional(v.union(v.literal("social"), v.literal("appstore"), v.literal("ads"))),
    theme: v.optional(themeValidator),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Featured post not found");
    const patch: Record<string, unknown> = {};
    if (args.label !== undefined) patch.label = args.label;
    if (args.componentCode !== undefined) patch.componentCode = args.componentCode;
    if (args.category !== undefined) patch.category = args.category;
    if (args.theme !== undefined) patch.theme = args.theme;
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.id, patch);
    }
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("featuredPosts") },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Featured post not found");
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/** Admin: list all user posts across all workspaces for picking featured ones */
export const listAllPosts = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);
    const posts = await ctx.db.query("posts").order("desc").take(200);
    return posts.map((p) => ({
      _id: p._id,
      title: p.title,
      componentCode: p.componentCode,
      language: p.language,
      device: p.device,
      status: p.status,
      createdAt: p.createdAt,
    }));
  },
});
