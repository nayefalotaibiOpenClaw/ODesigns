// Temporary: Grant pro access for Meta App Review testers
// DELETE THIS FILE after App Review is approved

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

const REVIEW_CODE = "ODESIGNS-META-REVIEW-2026";

export const redeemCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.code !== REVIEW_CODE) {
      throw new Error("Invalid review code");
    }

    // Check if user already has an active pro subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    if (existing && existing.plan === "pro" && existing.expiresAt > Date.now()) {
      return { status: "already_active", message: "You already have Pro access" };
    }

    // Expire any existing subscriptions
    if (existing) {
      await ctx.db.patch(existing._id, { status: "expired" });
    }

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    // Create pro subscription for 30 days
    await ctx.db.insert("subscriptions", {
      userId,
      plan: "pro",
      billingPeriod: "monthly",
      status: "active",
      aiTokensLimit: 1_250_000,
      aiTokensUsed: 0,
      postsLimit: 250,
      postsUsed: 0,
      amountPaid: 0,
      currency: "USD",
      startsAt: now,
      expiresAt: now + thirtyDays,
      createdAt: now,
    });

    await ctx.db.patch(userId, { plan: "pro" });

    return { status: "activated", message: "Pro plan activated for 30 days" };
  },
});

export const checkAccess = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    return {
      email: user?.email,
      plan: sub?.plan || "none",
      expiresAt: sub?.expiresAt,
    };
  },
});
