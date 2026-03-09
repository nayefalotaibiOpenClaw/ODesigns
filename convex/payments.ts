import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { PLANS, computeCredit } from "./subscriptions";

// Create a pending payment record before redirecting to UPayments
// Amount is computed server-side using proration — never trust client-provided amounts
export const createPending = mutation({
  args: {
    plan: v.union(v.literal("starter"), v.literal("pro")),
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
    orderId: v.string(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for duplicate orderId
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (existing) throw new Error("A payment with this orderId already exists");

    // Compute the correct charge amount server-side
    const planConfig = PLANS[args.plan][args.billingPeriod];
    let chargeAmount: number = planConfig.price;

    // Check for an existing active subscription to compute proration credit
    const activeSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q: any) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    if (activeSub && activeSub.expiresAt >= Date.now() && activeSub.plan !== "trial" && activeSub.amountPaid > 0) {
      const { credit } = computeCredit(activeSub);
      // Minimum $1 charge to prevent gateway rejection
      chargeAmount = Math.max(1, Math.round((planConfig.price - credit) * 100) / 100);
    }

    const now = Date.now();
    const paymentId = await ctx.db.insert("payments", {
      userId,
      orderId: args.orderId,
      plan: args.plan,
      billingPeriod: args.billingPeriod,
      amount: chargeAmount,
      currency: args.currency,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return { paymentId, chargeAmount };
  },
});

// Get pending payment amount by orderId — used by the API route to get the server-computed charge amount
// Returns only orderId, amount, currency, plan, billingPeriod, and status (no sensitive user data)
export const getPendingAmount = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment) return null;

    return {
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      plan: payment.plan,
      billingPeriod: payment.billingPeriod,
      status: payment.status,
    };
  },
});

// Mark payment as paid — internal only (called from webhook handler, not client)
export const markPaid = internalMutation({
  args: {
    orderId: v.string(),
    upaymentTransactionId: v.optional(v.string()),
    upaymentTrackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment) throw new Error(`Payment not found: ${args.orderId}`);
    if (payment.status === "paid") return payment._id;

    await ctx.db.patch(payment._id, {
      status: "paid",
      upaymentTransactionId: args.upaymentTransactionId,
      upaymentTrackId: args.upaymentTrackId,
      updatedAt: Date.now(),
    });

    return payment._id;
  },
});

// Mark payment as paid — authenticated user version (user must own the payment)
export const markPaidByUser = mutation({
  args: {
    orderId: v.string(),
    upaymentTransactionId: v.optional(v.string()),
    upaymentTrackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment) throw new Error(`Payment not found: ${args.orderId}`);
    if (payment.userId !== userId) throw new Error("Payment does not belong to this user");
    if (payment.status === "paid") return payment._id;

    await ctx.db.patch(payment._id, {
      status: "paid",
      upaymentTransactionId: args.upaymentTransactionId,
      upaymentTrackId: args.upaymentTrackId,
      updatedAt: Date.now(),
    });

    return payment._id;
  },
});

// Mark payment as failed — internal only (called from webhook handler, not client)
export const markFailed = internalMutation({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment) return;

    // Don't allow flipping a "paid" payment to "failed"
    if (payment.status === "paid") return;

    await ctx.db.patch(payment._id, {
      status: "failed",
      updatedAt: Date.now(),
    });
  },
});

// Get payment by order ID — only return if it belongs to the current user
export const getByOrderId = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment || payment.userId !== userId) return null;

    return payment;
  },
});

// List user payments
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});
