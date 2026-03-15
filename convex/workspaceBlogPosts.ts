import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// ─── Helper: verify workspace ownership ──────────────────
async function verifyWorkspaceOwnership(ctx: any, workspaceId: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace || workspace.userId !== userId) throw new Error("Workspace not found");
  return { userId, workspace };
}

// ─── Helper: verify blog post ownership ─────────────────
async function verifyBlogOwnership(ctx: any, blogId: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const blog = await ctx.db.get(blogId);
  if (!blog || blog.userId !== userId) throw new Error("Blog post not found");
  return { userId, blog };
}

// ─── Helper: generate slug from title ───────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
    .replace(/^-|-$/g, '') || 'untitled';
}

// ─── Queries ────────────────────────────────────────────

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) return [];

    const blogs = await ctx.db
      .query("workspaceBlogPosts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(50);

    return blogs;
  },
});

export const get = query({
  args: { id: v.id("workspaceBlogPosts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const blog = await ctx.db.get(args.id);
    if (!blog || blog.userId !== userId) return null;
    return blog;
  },
});

// ─── Mutations ──────────────────────────────────────────

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    content: v.optional(v.string()),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { userId, workspace } = await verifyWorkspaceOwnership(ctx, args.workspaceId);

    // Generate unique slug
    let slug = generateSlug(args.title);
    const existing = await ctx.db
      .query("workspaceBlogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const now = Date.now();
    const id = await ctx.db.insert("workspaceBlogPosts", {
      workspaceId: args.workspaceId,
      userId,
      title: args.title,
      slug,
      content: args.content || "",
      language: args.language || workspace.defaultLanguage || "en",
      tags: args.tags || [],
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaceBlogPosts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    coverImage: v.optional(v.id("_storage")),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { blog } = await verifyBlogOwnership(ctx, args.id);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title;
    if (args.content !== undefined) patch.content = args.content;
    if (args.excerpt !== undefined) patch.excerpt = args.excerpt;
    if (args.tags !== undefined) patch.tags = args.tags;
    if (args.seoTitle !== undefined) patch.seoTitle = args.seoTitle;
    if (args.seoDescription !== undefined) patch.seoDescription = args.seoDescription;
    if (args.coverImage !== undefined) patch.coverImage = args.coverImage;
    if (args.slug !== undefined) patch.slug = args.slug;

    await ctx.db.patch(args.id, patch);
    return { success: true };
  },
});

export const publish = mutation({
  args: { id: v.id("workspaceBlogPosts") },
  handler: async (ctx, args) => {
    await verifyBlogOwnership(ctx, args.id);
    await ctx.db.patch(args.id, {
      status: "published",
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const unpublish = mutation({
  args: { id: v.id("workspaceBlogPosts") },
  handler: async (ctx, args) => {
    await verifyBlogOwnership(ctx, args.id);
    await ctx.db.patch(args.id, {
      status: "draft",
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const archive = mutation({
  args: { id: v.id("workspaceBlogPosts") },
  handler: async (ctx, args) => {
    await verifyBlogOwnership(ctx, args.id);
    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const addImage = mutation({
  args: {
    blogId: v.id("workspaceBlogPosts"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await verifyBlogOwnership(ctx, args.blogId);
    const url = await ctx.storage.getUrl(args.storageId);
    return { url };
  },
});

export const remove = mutation({
  args: { id: v.id("workspaceBlogPosts") },
  handler: async (ctx, args) => {
    await verifyBlogOwnership(ctx, args.id);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
