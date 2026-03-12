import { query } from "./_generated/server";
import { auth } from "./auth";

const ADMIN_EMAILS = ["nayefralotaibi@gmail.com"];

async function assertAdmin(ctx: { db: any; auth: any }) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  if (!ADMIN_EMAILS.includes(user.email ?? "") && user.role !== "admin") {
    throw new Error("Not admin");
  }
  return user;
}

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email ?? "") || user.role === "admin";
  },
});


export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Total users
    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;

    // New users last 7 days
    const newUsersLast7d = allUsers.filter(
      (u) => u.createdAt && u.createdAt >= sevenDaysAgo
    ).length;

    // Active subscriptions
    const allSubs = await ctx.db.query("subscriptions").collect();
    const activeSubs = allSubs.filter(
      (s) => s.status === "active" && s.expiresAt >= now
    );
    const activeSubCount = activeSubs.length;

    // MRR: sum active monthly + yearly/12
    let mrr = 0;
    for (const sub of activeSubs) {
      if (sub.plan === "trial") continue;
      if (sub.billingPeriod === "yearly") {
        mrr += sub.amountPaid / 12;
      } else {
        mrr += sub.amountPaid;
      }
    }
    mrr = Math.round(mrr * 100) / 100;

    // Total AI cost last 30 days
    const recentLogs = await ctx.db
      .query("aiUsageLogs")
      .withIndex("by_created")
      .order("desc")
      .collect();

    let aiCost30d = 0;
    for (const log of recentLogs) {
      if (log.createdAt < thirtyDaysAgo) break;
      aiCost30d += log.estimatedCostUsd;
    }
    aiCost30d = Math.round(aiCost30d * 10000) / 10000;

    // Total revenue (sum paid payments)
    const allPayments = await ctx.db.query("payments").collect();
    let totalRevenue = 0;
    for (const p of allPayments) {
      if (p.status === "paid") totalRevenue += p.amount;
    }
    totalRevenue = Math.round(totalRevenue * 100) / 100;

    return {
      totalUsers,
      activeSubCount,
      mrr,
      aiCost30d,
      totalRevenue,
      newUsersLast7d,
    };
  },
});

export const listRecentUsers = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const users = await ctx.db.query("users").order("desc").take(20);

    return await Promise.all(
      users.map(async (u) => {
        const sub = await ctx.db
          .query("subscriptions")
          .withIndex("by_user_status", (q: any) =>
            q.eq("userId", u._id).eq("status", "active")
          )
          .first();

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          image: u.image,
          plan: u.plan,
          createdAt: u.createdAt,
          subscription: sub
            ? {
                plan: sub.plan,
                status: sub.status,
                aiTokensUsed: sub.aiTokensUsed,
                aiTokensLimit: sub.aiTokensLimit,
                postsUsed: sub.postsUsed,
                postsLimit: sub.postsLimit,
                expiresAt: sub.expiresAt,
              }
            : null,
        };
      })
    );
  },
});

export const listRecentUsage = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const logs = await ctx.db
      .query("aiUsageLogs")
      .withIndex("by_created")
      .order("desc")
      .take(50);

    // Batch-fetch user info
    const userIds = [...new Set(logs.map((l) => l.userId))];
    const usersMap = new Map<string, { name?: string; email?: string }>();
    for (const uid of userIds) {
      const u = await ctx.db.get(uid);
      if (u) usersMap.set(uid, { name: u.name, email: u.email });
    }

    return logs.map((log) => ({
      ...log,
      user: usersMap.get(log.userId) || { name: "Unknown", email: "" },
    }));
  },
});
