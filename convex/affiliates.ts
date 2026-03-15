import { mutation, query, internalMutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// ─── Admin guard (same pattern as admin.ts) ──────────
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

async function assertAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  if (!ADMIN_EMAILS.includes(user.email ?? "") && user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return user;
}

// ─── Code validation ─────────────────────────────────
const CODE_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

function validateCode(code: string): string {
  const normalized = code.toUpperCase().trim();
  if (!CODE_REGEX.test(normalized)) {
    throw new Error("Code must be 3-20 characters, alphanumeric, dashes, or underscores only");
  }
  return normalized;
}

// ═══════════════════════════════════════════════════════
// User-facing mutations
// ═══════════════════════════════════════════════════════

export const apply = mutation({
  args: {
    code: v.string(),
    paypalEmail: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has an affiliate record
    const existing = await ctx.db
      .query("affiliates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) throw new Error("You already have an affiliate application");

    const code = validateCode(args.code);

    // Check code uniqueness
    const codeExists = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    if (codeExists) throw new Error("This code is already taken");

    // Validate bio length
    if (args.bio && args.bio.length > 500) {
      throw new Error("Bio must be under 500 characters");
    }

    return await ctx.db.insert("affiliates", {
      userId,
      code,
      status: "pending",
      commissionRate: 0.2, // default 20%
      paypalEmail: args.paypalEmail,
      bio: args.bio,
      totalClicks: 0,
      totalSignups: 0,
      totalConversions: 0,
      totalEarnings: 0,
      totalPaidOut: 0,
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    paypalEmail: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!affiliate) throw new Error("Affiliate record not found");

    if (args.bio && args.bio.length > 500) {
      throw new Error("Bio must be under 500 characters");
    }

    await ctx.db.patch(affiliate._id, {
      ...(args.paypalEmail !== undefined && { paypalEmail: args.paypalEmail }),
      ...(args.bio !== undefined && { bio: args.bio }),
    });
  },
});

// ═══════════════════════════════════════════════════════
// User-facing queries
// ═══════════════════════════════════════════════════════

export const getMyAffiliate = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("affiliates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getMyStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!affiliate) return null;

    // Get recent events
    const recentEvents = await ctx.db
      .query("referrals")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", affiliate._id))
      .order("desc")
      .take(50);

    return {
      totalClicks: affiliate.totalClicks,
      totalSignups: affiliate.totalSignups,
      totalConversions: affiliate.totalConversions,
      totalEarnings: affiliate.totalEarnings,
      totalPaidOut: affiliate.totalPaidOut,
      pendingPayout: Math.round((affiliate.totalEarnings - affiliate.totalPaidOut) * 100) / 100,
      commissionRate: affiliate.commissionRate,
      recentEvents,
    };
  },
});

// ═══════════════════════════════════════════════════════
// Public query (no auth needed)
// ═══════════════════════════════════════════════════════

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase().trim()))
      .first();

    if (!affiliate || affiliate.status !== "approved") return null;

    const user = await ctx.db.get(affiliate.userId);
    return {
      code: affiliate.code,
      name: user?.name ?? "Affiliate",
    };
  },
});

// ═══════════════════════════════════════════════════════
// Admin mutations
// ═══════════════════════════════════════════════════════

export const adminApprove = mutation({
  args: { affiliateId: v.id("affiliates") },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");

    await ctx.db.patch(args.affiliateId, {
      status: "approved",
      approvedAt: Date.now(),
    });
  },
});

export const adminReject = mutation({
  args: { affiliateId: v.id("affiliates") },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");

    await ctx.db.patch(args.affiliateId, { status: "rejected" });
  },
});

export const adminSuspend = mutation({
  args: { affiliateId: v.id("affiliates") },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");

    await ctx.db.patch(args.affiliateId, { status: "suspended" });
  },
});

export const adminSetCommission = mutation({
  args: {
    affiliateId: v.id("affiliates"),
    rate: v.number(),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    if (args.rate < 0 || args.rate > 1) {
      throw new Error("Commission rate must be between 0 and 1");
    }
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");

    await ctx.db.patch(args.affiliateId, { commissionRate: args.rate });
  },
});

export const adminRecordPayout = mutation({
  args: {
    affiliateId: v.id("affiliates"),
    amount: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");

    const pending = Math.round((affiliate.totalEarnings - affiliate.totalPaidOut) * 100) / 100;
    if (args.amount > pending) {
      throw new Error("Payout amount exceeds pending balance");
    }
    if (args.amount <= 0) {
      throw new Error("Payout amount must be positive");
    }

    // Create payout event
    await ctx.db.insert("referrals", {
      affiliateId: args.affiliateId,
      type: "payout",
      payoutAmount: args.amount,
      payoutNote: args.note,
      createdAt: Date.now(),
    });

    // Update affiliate totals
    await ctx.db.patch(args.affiliateId, {
      totalPaidOut: Math.round((affiliate.totalPaidOut + args.amount) * 100) / 100,
    });
  },
});

// ═══════════════════════════════════════════════════════
// Admin queries
// ═══════════════════════════════════════════════════════

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const affiliates = await ctx.db.query("affiliates").order("desc").take(200);

    // Join user info
    const results = await Promise.all(
      affiliates.map(async (a) => {
        const user = await ctx.db.get(a.userId);
        return {
          ...a,
          userName: user?.name ?? "Unknown",
          userEmail: user?.email ?? "",
          userImage: user?.image,
        };
      })
    );

    return results;
  },
});

export const adminOverview = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const all = await ctx.db.query("affiliates").collect();

    const pending = all.filter((a) => a.status === "pending").length;
    const approved = all.filter((a) => a.status === "approved").length;
    const totalEarnings = all.reduce((sum, a) => sum + a.totalEarnings, 0);
    const totalPaidOut = all.reduce((sum, a) => sum + a.totalPaidOut, 0);
    const totalConversions = all.reduce((sum, a) => sum + a.totalConversions, 0);

    return {
      total: all.length,
      pending,
      approved,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalPaidOut: Math.round(totalPaidOut * 100) / 100,
      totalPending: Math.round((totalEarnings - totalPaidOut) * 100) / 100,
      totalConversions,
    };
  },
});

// ═══════════════════════════════════════════════════════
// Internal mutations (called from payment/signup flow)
// ═══════════════════════════════════════════════════════

// Public mutation — no auth required since visitors clicking affiliate links aren't logged in.
// Only increments a counter; no sensitive data exposed.
export const trackClick = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = args.code.toUpperCase().trim();
    if (!CODE_REGEX.test(code)) return;

    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!affiliate || affiliate.status !== "approved") return;

    await ctx.db.insert("referrals", {
      affiliateId: affiliate._id,
      type: "click",
      createdAt: Date.now(),
    });

    await ctx.db.patch(affiliate._id, {
      totalClicks: affiliate.totalClicks + 1,
    });
  },
});

export const recordSignup = internalMutation({
  args: {
    code: v.string(),
    referredUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase().trim()))
      .first();

    if (!affiliate || affiliate.status !== "approved") return;

    // No self-referral
    if (affiliate.userId === args.referredUserId) return;

    // Idempotent: check if signup already recorded for this user
    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_affiliate_type", (q) =>
        q.eq("affiliateId", affiliate._id).eq("type", "signup")
      )
      .filter((q) => q.eq(q.field("referredUserId"), args.referredUserId))
      .first();
    if (existing) return;

    await ctx.db.insert("referrals", {
      affiliateId: affiliate._id,
      type: "signup",
      referredUserId: args.referredUserId,
      createdAt: Date.now(),
    });

    await ctx.db.patch(affiliate._id, {
      totalSignups: affiliate.totalSignups + 1,
    });
  },
});

export const recordConversion = internalMutation({
  args: {
    affiliateCode: v.string(),
    referredUserId: v.id("users"),
    paymentId: v.id("payments"),
    saleAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q) => q.eq("code", args.affiliateCode.toUpperCase().trim()))
      .first();

    if (!affiliate || affiliate.status !== "approved") return;

    // No self-referral
    if (affiliate.userId === args.referredUserId) return;

    // Idempotent: check if conversion already recorded for this payment
    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.paymentId))
      .first();
    if (existing) return;

    const commissionAmount = Math.round(args.saleAmount * affiliate.commissionRate * 100) / 100;

    await ctx.db.insert("referrals", {
      affiliateId: affiliate._id,
      type: "conversion",
      referredUserId: args.referredUserId,
      paymentId: args.paymentId,
      saleAmount: args.saleAmount,
      commissionAmount,
      createdAt: Date.now(),
    });

    await ctx.db.patch(affiliate._id, {
      totalConversions: affiliate.totalConversions + 1,
      totalEarnings: Math.round((affiliate.totalEarnings + commissionAmount) * 100) / 100,
    });
  },
});

// Stamp referredBy on user record (called from ReferralTracker client component)
export const stampReferral = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Already stamped — idempotent
    if (user.referredBy) return;

    const code = args.code.toUpperCase().trim();

    // Validate affiliate exists and is approved
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    if (!affiliate || affiliate.status !== "approved") return;

    // No self-referral
    if (affiliate.userId === userId) return;

    await ctx.db.patch(userId, { referredBy: code });

    // Also record the signup event
    const existingSignup = await ctx.db
      .query("referrals")
      .withIndex("by_affiliate_type", (q) =>
        q.eq("affiliateId", affiliate._id).eq("type", "signup")
      )
      .filter((q) => q.eq(q.field("referredUserId"), userId))
      .first();

    if (!existingSignup) {
      await ctx.db.insert("referrals", {
        affiliateId: affiliate._id,
        type: "signup",
        referredUserId: userId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(affiliate._id, {
        totalSignups: affiliate.totalSignups + 1,
      });
    }
  },
});
