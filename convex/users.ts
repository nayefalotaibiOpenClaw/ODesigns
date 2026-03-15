import { query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Get the currently authenticated user
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

const ADMIN_EMAILS = ["nayefralotaibi@gmail.com"];

export const hasBetaFeature = query({
  args: { feature: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    if (!user) return false;
    // Admins automatically have all beta features
    if (ADMIN_EMAILS.includes(user.email ?? "") || user.role === "admin") return true;
    return (user.betaFeatures ?? []).includes(args.feature);
  },
});
