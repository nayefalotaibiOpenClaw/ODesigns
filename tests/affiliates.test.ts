/**
 * Affiliate Marketing System Tests
 *
 * Tests the business logic for affiliate code validation, referral tracking,
 * commission calculations, payout management, and the full affiliate flow
 * — all without needing a running Convex backend.
 *
 * Logic is extracted/mirrored from:
 *   - convex/affiliates.ts (all affiliate mutations/queries)
 *   - convex/payments.ts (createPending with affiliateCode)
 *   - convex/subscriptions.ts (activate/activateByOrderId affiliate hooks)
 */
import { describe, it, expect } from "vitest";

// ─── Constants mirrored from convex/affiliates.ts ────────────────
const CODE_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

// ─── Pure logic: validateCode (mirrored from convex/affiliates.ts) ──
function validateCode(code: string): string {
  const normalized = code.toUpperCase().trim();
  if (!CODE_REGEX.test(normalized)) {
    throw new Error("Code must be 3-20 characters, alphanumeric, dashes, or underscores only");
  }
  return normalized;
}

// ─── Types ───────────────────────────────────────────────────────
type AffiliateRecord = {
  _id: string;
  userId: string;
  code: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  commissionRate: number;
  paypalEmail?: string;
  bio?: string;
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  totalEarnings: number;
  totalPaidOut: number;
  createdAt: number;
  approvedAt?: number;
};

type ReferralEvent = {
  affiliateId: string;
  type: "click" | "signup" | "conversion" | "payout";
  referredUserId?: string;
  paymentId?: string;
  saleAmount?: number;
  commissionAmount?: number;
  payoutAmount?: number;
  payoutNote?: string;
  createdAt: number;
};

type UserRecord = {
  _id: string;
  email?: string;
  name?: string;
  referredBy?: string;
  plan?: "trial" | "starter" | "pro";
  role?: "user" | "admin";
};

type PaymentRecord = {
  _id: string;
  userId: string;
  orderId: string;
  plan: "starter" | "pro";
  billingPeriod?: "monthly" | "yearly";
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  metadata?: string;
  createdAt: number;
  updatedAt: number;
};

// ─── In-memory database simulation ─────────────────────────────
class MockDB {
  affiliates: AffiliateRecord[] = [];
  referrals: ReferralEvent[] = [];
  users: UserRecord[] = [];
  payments: PaymentRecord[] = [];
  private idCounter = 0;

  nextId(table: string): string {
    return `${table}_${++this.idCounter}`;
  }

  addUser(overrides?: Partial<UserRecord>): UserRecord {
    const user: UserRecord = {
      _id: this.nextId("users"),
      email: `user${this.idCounter}@test.com`,
      name: `User ${this.idCounter}`,
      ...overrides,
    };
    this.users.push(user);
    return user;
  }

  addAffiliate(overrides?: Partial<AffiliateRecord>): AffiliateRecord {
    const aff: AffiliateRecord = {
      _id: this.nextId("affiliates"),
      userId: "users_0",
      code: "TEST",
      status: "pending",
      commissionRate: 0.2,
      totalClicks: 0,
      totalSignups: 0,
      totalConversions: 0,
      totalEarnings: 0,
      totalPaidOut: 0,
      createdAt: Date.now(),
      ...overrides,
    };
    this.affiliates.push(aff);
    return aff;
  }

  addPayment(overrides?: Partial<PaymentRecord>): PaymentRecord {
    const payment: PaymentRecord = {
      _id: this.nextId("payments"),
      userId: "users_0",
      orderId: `order_${this.idCounter}`,
      plan: "starter",
      billingPeriod: "monthly",
      amount: 40,
      currency: "USD",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...overrides,
    };
    this.payments.push(payment);
    return payment;
  }

  findAffiliateByCode(code: string): AffiliateRecord | undefined {
    return this.affiliates.find((a) => a.code === code.toUpperCase().trim());
  }

  findAffiliateByUser(userId: string): AffiliateRecord | undefined {
    return this.affiliates.find((a) => a.userId === userId);
  }

  findReferralByPayment(paymentId: string): ReferralEvent | undefined {
    return this.referrals.find((r) => r.paymentId === paymentId);
  }
}

// ─── Simulated business logic (mirrored from convex/affiliates.ts) ──

function simulateApply(
  db: MockDB,
  userId: string,
  code: string,
  bio?: string,
  paypalEmail?: string
): string {
  // Check if user already has an affiliate record
  const existing = db.findAffiliateByUser(userId);
  if (existing) throw new Error("You already have an affiliate application");

  const normalizedCode = validateCode(code);

  // Check code uniqueness
  const codeExists = db.findAffiliateByCode(normalizedCode);
  if (codeExists) throw new Error("This code is already taken");

  // Validate bio length
  if (bio && bio.length > 500) {
    throw new Error("Bio must be under 500 characters");
  }

  const aff = db.addAffiliate({
    userId,
    code: normalizedCode,
    status: "pending",
    commissionRate: 0.2,
    paypalEmail,
    bio,
  });
  return aff._id;
}

function simulateTrackClick(db: MockDB, code: string): void {
  const normalized = code.toUpperCase().trim();
  if (!CODE_REGEX.test(normalized)) return;

  const affiliate = db.findAffiliateByCode(normalized);
  if (!affiliate || affiliate.status !== "approved") return;

  db.referrals.push({
    affiliateId: affiliate._id,
    type: "click",
    createdAt: Date.now(),
  });
  affiliate.totalClicks += 1;
}

function simulateStampReferral(
  db: MockDB,
  userId: string,
  code: string
): void {
  const user = db.users.find((u) => u._id === userId);
  if (!user) throw new Error("User not found");

  // Already stamped — idempotent
  if (user.referredBy) return;

  const normalized = code.toUpperCase().trim();
  const affiliate = db.findAffiliateByCode(normalized);
  if (!affiliate || affiliate.status !== "approved") return;

  // No self-referral
  if (affiliate.userId === userId) return;

  user.referredBy = normalized;

  // Record signup event (idempotent)
  const existingSignup = db.referrals.find(
    (r) =>
      r.affiliateId === affiliate._id &&
      r.type === "signup" &&
      r.referredUserId === userId
  );

  if (!existingSignup) {
    db.referrals.push({
      affiliateId: affiliate._id,
      type: "signup",
      referredUserId: userId,
      createdAt: Date.now(),
    });
    affiliate.totalSignups += 1;
  }
}

function simulateRecordConversion(
  db: MockDB,
  affiliateCode: string,
  referredUserId: string,
  paymentId: string,
  saleAmount: number
): void {
  const affiliate = db.findAffiliateByCode(affiliateCode.toUpperCase().trim());
  if (!affiliate || affiliate.status !== "approved") return;

  // No self-referral
  if (affiliate.userId === referredUserId) return;

  // Idempotent per paymentId
  const existing = db.findReferralByPayment(paymentId);
  if (existing) return;

  const commissionAmount =
    Math.round(saleAmount * affiliate.commissionRate * 100) / 100;

  db.referrals.push({
    affiliateId: affiliate._id,
    type: "conversion",
    referredUserId,
    paymentId,
    saleAmount,
    commissionAmount,
    createdAt: Date.now(),
  });

  affiliate.totalConversions += 1;
  affiliate.totalEarnings =
    Math.round((affiliate.totalEarnings + commissionAmount) * 100) / 100;
}

function simulateAdminRecordPayout(
  db: MockDB,
  affiliateId: string,
  amount: number,
  note?: string
): void {
  const affiliate = db.affiliates.find((a) => a._id === affiliateId);
  if (!affiliate) throw new Error("Affiliate not found");

  const pending =
    Math.round((affiliate.totalEarnings - affiliate.totalPaidOut) * 100) / 100;
  if (amount > pending) {
    throw new Error("Payout amount exceeds pending balance");
  }
  if (amount <= 0) {
    throw new Error("Payout amount must be positive");
  }

  db.referrals.push({
    affiliateId: affiliate._id,
    type: "payout",
    payoutAmount: amount,
    payoutNote: note,
    createdAt: Date.now(),
  });

  affiliate.totalPaidOut =
    Math.round((affiliate.totalPaidOut + amount) * 100) / 100;
}

function simulateAdminSetCommission(
  db: MockDB,
  affiliateId: string,
  rate: number
): void {
  if (rate < 0 || rate > 1) {
    throw new Error("Commission rate must be between 0 and 1");
  }
  const affiliate = db.affiliates.find((a) => a._id === affiliateId);
  if (!affiliate) throw new Error("Affiliate not found");
  affiliate.commissionRate = rate;
}

function simulateGetByCode(
  db: MockDB,
  code: string
): { code: string; name: string } | null {
  const affiliate = db.findAffiliateByCode(code.toUpperCase().trim());
  if (!affiliate || affiliate.status !== "approved") return null;

  const user = db.users.find((u) => u._id === affiliate.userId);
  return {
    code: affiliate.code,
    name: user?.name ?? "Affiliate",
  };
}

function simulateAdminOverview(db: MockDB) {
  const all = db.affiliates;
  const pending = all.filter((a) => a.status === "pending").length;
  const approved = all.filter((a) => a.status === "approved").length;
  const totalEarnings = all.reduce((sum, a) => sum + a.totalEarnings, 0);
  const totalPaidOut = all.reduce((sum, a) => sum + a.totalPaidOut, 0);
  const totalConversions = all.reduce(
    (sum, a) => sum + a.totalConversions,
    0
  );

  return {
    total: all.length,
    pending,
    approved,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalPaidOut: Math.round(totalPaidOut * 100) / 100,
    totalPending: Math.round((totalEarnings - totalPaidOut) * 100) / 100,
    totalConversions,
  };
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe("Code Validation (validateCode)", () => {
  it("rejects codes shorter than 3 characters", () => {
    expect(() => validateCode("AB")).toThrow("Code must be 3-20 characters");
  });

  it("rejects codes longer than 20 characters", () => {
    expect(() => validateCode("A".repeat(21))).toThrow(
      "Code must be 3-20 characters"
    );
  });

  it("rejects codes with invalid characters (spaces, special chars)", () => {
    expect(() => validateCode("my code")).toThrow();
    expect(() => validateCode("code@123")).toThrow();
    expect(() => validateCode("code!")).toThrow();
    expect(() => validateCode("code.dot")).toThrow();
    expect(() => validateCode("co de")).toThrow();
  });

  it("accepts valid codes with alphanumeric, dashes, underscores", () => {
    expect(validateCode("ABC")).toBe("ABC");
    expect(validateCode("my-code")).toBe("MY-CODE");
    expect(validateCode("my_code")).toBe("MY_CODE");
    expect(validateCode("code123")).toBe("CODE123");
    expect(validateCode("A-B_C")).toBe("A-B_C");
  });

  it("normalizes lowercase to uppercase", () => {
    expect(validateCode("hello")).toBe("HELLO");
    expect(validateCode("mixedCase")).toBe("MIXEDCASE");
  });

  it("trims whitespace before validating", () => {
    expect(validateCode("  ABC  ")).toBe("ABC");
  });

  it("accepts boundary-length codes (3 and 20 chars)", () => {
    expect(validateCode("ABC")).toBe("ABC");
    expect(validateCode("A".repeat(20))).toBe("A".repeat(20));
  });

  it("accepts code with only dashes", () => {
    expect(validateCode("---")).toBe("---");
  });

  it("accepts code with only underscores", () => {
    expect(validateCode("___")).toBe("___");
  });
});

describe("Apply Mutation Validation", () => {
  it("rejects duplicate affiliate code", () => {
    const db = new MockDB();
    const user1 = db.addUser();
    const user2 = db.addUser();

    simulateApply(db, user1._id, "MYCODE");

    expect(() => simulateApply(db, user2._id, "MYCODE")).toThrow(
      "This code is already taken"
    );
  });

  it("rejects duplicate user application", () => {
    const db = new MockDB();
    const user = db.addUser();

    simulateApply(db, user._id, "CODE1");

    expect(() => simulateApply(db, user._id, "CODE2")).toThrow(
      "You already have an affiliate application"
    );
  });

  it("rejects bio longer than 500 characters", () => {
    const db = new MockDB();
    const user = db.addUser();
    const longBio = "x".repeat(501);

    expect(() => simulateApply(db, user._id, "CODE1", longBio)).toThrow(
      "Bio must be under 500 characters"
    );
  });

  it("accepts bio exactly 500 characters", () => {
    const db = new MockDB();
    const user = db.addUser();
    const bio = "x".repeat(500);

    expect(() => simulateApply(db, user._id, "CODE1", bio)).not.toThrow();
  });

  it("creates affiliate with default 20% commission rate", () => {
    const db = new MockDB();
    const user = db.addUser();

    simulateApply(db, user._id, "TESTCODE");

    const aff = db.findAffiliateByUser(user._id);
    expect(aff).toBeDefined();
    expect(aff!.commissionRate).toBe(0.2);
    expect(aff!.status).toBe("pending");
  });

  it("creates affiliate with zero totals", () => {
    const db = new MockDB();
    const user = db.addUser();

    simulateApply(db, user._id, "TESTCODE");

    const aff = db.findAffiliateByUser(user._id);
    expect(aff!.totalClicks).toBe(0);
    expect(aff!.totalSignups).toBe(0);
    expect(aff!.totalConversions).toBe(0);
    expect(aff!.totalEarnings).toBe(0);
    expect(aff!.totalPaidOut).toBe(0);
  });

  it("normalizes code to uppercase on apply", () => {
    const db = new MockDB();
    const user = db.addUser();

    simulateApply(db, user._id, "lowercase");

    const aff = db.findAffiliateByUser(user._id);
    expect(aff!.code).toBe("LOWERCASE");
  });

  it("duplicate detection is case-insensitive", () => {
    const db = new MockDB();
    const user1 = db.addUser();
    const user2 = db.addUser();

    simulateApply(db, user1._id, "MyCode");

    expect(() => simulateApply(db, user2._id, "mycode")).toThrow(
      "This code is already taken"
    );
  });
});

describe("stampReferral", () => {
  it("stamps referredBy on user and creates signup event", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    db.addAffiliate({
      userId: affiliateOwner._id,
      code: "PARTNER",
      status: "approved",
    });

    simulateStampReferral(db, referredUser._id, "PARTNER");

    expect(referredUser.referredBy).toBe("PARTNER");
    const signups = db.referrals.filter(
      (r) => r.type === "signup" && r.referredUserId === referredUser._id
    );
    expect(signups).toHaveLength(1);
  });

  it("is idempotent - does not re-stamp if already set", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    db.addAffiliate({
      userId: affiliateOwner._id,
      code: "PARTNER",
      status: "approved",
    });

    simulateStampReferral(db, referredUser._id, "PARTNER");
    simulateStampReferral(db, referredUser._id, "PARTNER");

    const signups = db.referrals.filter(
      (r) => r.type === "signup" && r.referredUserId === referredUser._id
    );
    expect(signups).toHaveLength(1);
    expect(referredUser.referredBy).toBe("PARTNER");
  });

  it("blocks self-referral", () => {
    const db = new MockDB();
    const user = db.addUser();
    db.addAffiliate({
      userId: user._id,
      code: "MYOWN",
      status: "approved",
    });

    simulateStampReferral(db, user._id, "MYOWN");

    expect(user.referredBy).toBeUndefined();
    expect(db.referrals.filter((r) => r.type === "signup")).toHaveLength(0);
  });

  it("rejects invalid affiliate code (non-existent)", () => {
    const db = new MockDB();
    const user = db.addUser();

    simulateStampReferral(db, user._id, "DOESNOTEXIST");

    expect(user.referredBy).toBeUndefined();
  });

  it("rejects non-approved affiliate code (pending)", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    db.addAffiliate({
      userId: affiliateOwner._id,
      code: "PENDING",
      status: "pending",
    });

    simulateStampReferral(db, referredUser._id, "PENDING");

    expect(referredUser.referredBy).toBeUndefined();
  });

  it("rejects suspended affiliate code", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    db.addAffiliate({
      userId: affiliateOwner._id,
      code: "SUSPENDED",
      status: "suspended",
    });

    simulateStampReferral(db, referredUser._id, "SUSPENDED");

    expect(referredUser.referredBy).toBeUndefined();
  });

  it("increments totalSignups on the affiliate record", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    const aff = db.addAffiliate({
      userId: affiliateOwner._id,
      code: "PARTNER",
      status: "approved",
    });

    simulateStampReferral(db, referredUser._id, "PARTNER");

    expect(aff.totalSignups).toBe(1);
  });
});

describe("recordConversion", () => {
  it("calculates commission correctly (20% of $40 = $8)", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    const aff = db.addAffiliate({
      userId: affiliateOwner._id,
      code: "EARN",
      status: "approved",
      commissionRate: 0.2,
    });

    simulateRecordConversion(
      db,
      "EARN",
      referredUser._id,
      "payment_1",
      40
    );

    const conversion = db.referrals.find((r) => r.type === "conversion");
    expect(conversion).toBeDefined();
    expect(conversion!.commissionAmount).toBe(8);
    expect(conversion!.saleAmount).toBe(40);
    expect(aff.totalEarnings).toBe(8);
    expect(aff.totalConversions).toBe(1);
  });

  it("calculates commission with custom rate (30% of $100 = $30)", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    const aff = db.addAffiliate({
      userId: affiliateOwner._id,
      code: "VIP",
      status: "approved",
      commissionRate: 0.3,
    });

    simulateRecordConversion(
      db,
      "VIP",
      referredUser._id,
      "payment_1",
      100
    );

    const conversion = db.referrals.find((r) => r.type === "conversion");
    expect(conversion!.commissionAmount).toBe(30);
    expect(aff.totalEarnings).toBe(30);
  });

  it("is idempotent per paymentId", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    const aff = db.addAffiliate({
      userId: affiliateOwner._id,
      code: "EARN",
      status: "approved",
      commissionRate: 0.2,
    });

    simulateRecordConversion(db, "EARN", referredUser._id, "payment_1", 40);
    simulateRecordConversion(db, "EARN", referredUser._id, "payment_1", 40);

    const conversions = db.referrals.filter((r) => r.type === "conversion");
    expect(conversions).toHaveLength(1);
    expect(aff.totalEarnings).toBe(8);
    expect(aff.totalConversions).toBe(1);
  });

  it("blocks self-referral conversion", () => {
    const db = new MockDB();
    const user = db.addUser();
    db.addAffiliate({
      userId: user._id,
      code: "SELFREF",
      status: "approved",
      commissionRate: 0.2,
    });

    simulateRecordConversion(db, "SELFREF", user._id, "payment_1", 40);

    expect(db.referrals.filter((r) => r.type === "conversion")).toHaveLength(0);
  });

  it("updates affiliate totals correctly across multiple conversions", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const user1 = db.addUser();
    const user2 = db.addUser();
    const aff = db.addAffiliate({
      userId: affiliateOwner._id,
      code: "MULTI",
      status: "approved",
      commissionRate: 0.2,
    });

    simulateRecordConversion(db, "MULTI", user1._id, "pay_1", 40);
    simulateRecordConversion(db, "MULTI", user2._id, "pay_2", 100);

    expect(aff.totalConversions).toBe(2);
    expect(aff.totalEarnings).toBe(28); // 8 + 20
  });

  it("skips conversion for non-approved affiliate", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    db.addAffiliate({
      userId: affiliateOwner._id,
      code: "PENDING",
      status: "pending",
      commissionRate: 0.2,
    });

    simulateRecordConversion(
      db,
      "PENDING",
      referredUser._id,
      "payment_1",
      40
    );

    expect(db.referrals.filter((r) => r.type === "conversion")).toHaveLength(0);
  });

  it("rounds commission to 2 decimal places", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const referredUser = db.addUser();
    db.addAffiliate({
      userId: affiliateOwner._id,
      code: "ROUND",
      status: "approved",
      commissionRate: 0.15,
    });

    // 0.15 * 33.33 = 4.9995 -> should round to 5.00
    simulateRecordConversion(
      db,
      "ROUND",
      referredUser._id,
      "payment_1",
      33.33
    );

    const conversion = db.referrals.find((r) => r.type === "conversion");
    expect(conversion!.commissionAmount).toBe(5);
  });
});

describe("adminRecordPayout", () => {
  it("validates amount does not exceed pending balance", () => {
    const db = new MockDB();
    const aff = db.addAffiliate({
      totalEarnings: 50,
      totalPaidOut: 40,
    });

    // Pending = 50 - 40 = 10
    expect(() =>
      simulateAdminRecordPayout(db, aff._id, 15)
    ).toThrow("Payout amount exceeds pending balance");
  });

  it("validates positive amount", () => {
    const db = new MockDB();
    const aff = db.addAffiliate({
      totalEarnings: 50,
      totalPaidOut: 0,
    });

    expect(() =>
      simulateAdminRecordPayout(db, aff._id, 0)
    ).toThrow("Payout amount must be positive");

    expect(() =>
      simulateAdminRecordPayout(db, aff._id, -5)
    ).toThrow("Payout amount must be positive");
  });

  it("records payout event and updates totalPaidOut", () => {
    const db = new MockDB();
    const aff = db.addAffiliate({
      totalEarnings: 100,
      totalPaidOut: 0,
    });

    simulateAdminRecordPayout(db, aff._id, 50, "March payout");

    expect(aff.totalPaidOut).toBe(50);
    const payoutEvent = db.referrals.find((r) => r.type === "payout");
    expect(payoutEvent).toBeDefined();
    expect(payoutEvent!.payoutAmount).toBe(50);
    expect(payoutEvent!.payoutNote).toBe("March payout");
  });

  it("allows payout of exact pending balance", () => {
    const db = new MockDB();
    const aff = db.addAffiliate({
      totalEarnings: 25,
      totalPaidOut: 0,
    });

    expect(() =>
      simulateAdminRecordPayout(db, aff._id, 25)
    ).not.toThrow();
    expect(aff.totalPaidOut).toBe(25);
  });

  it("allows multiple payouts summing to total earnings", () => {
    const db = new MockDB();
    const aff = db.addAffiliate({
      totalEarnings: 100,
      totalPaidOut: 0,
    });

    simulateAdminRecordPayout(db, aff._id, 30);
    simulateAdminRecordPayout(db, aff._id, 30);
    simulateAdminRecordPayout(db, aff._id, 40);

    expect(aff.totalPaidOut).toBe(100);

    // Now any further payout should fail
    expect(() =>
      simulateAdminRecordPayout(db, aff._id, 1)
    ).toThrow("Payout amount exceeds pending balance");
  });

  it("throws for non-existent affiliate", () => {
    const db = new MockDB();

    expect(() =>
      simulateAdminRecordPayout(db, "nonexistent_1", 10)
    ).toThrow("Affiliate not found");
  });
});

describe("adminSetCommission", () => {
  it("validates rate between 0 and 1 (inclusive)", () => {
    const db = new MockDB();
    const aff = db.addAffiliate();

    expect(() => simulateAdminSetCommission(db, aff._id, -0.1)).toThrow(
      "Commission rate must be between 0 and 1"
    );
    expect(() => simulateAdminSetCommission(db, aff._id, 1.1)).toThrow(
      "Commission rate must be between 0 and 1"
    );
  });

  it("accepts boundary values 0 and 1", () => {
    const db = new MockDB();
    const aff = db.addAffiliate();

    expect(() => simulateAdminSetCommission(db, aff._id, 0)).not.toThrow();
    expect(aff.commissionRate).toBe(0);

    expect(() => simulateAdminSetCommission(db, aff._id, 1)).not.toThrow();
    expect(aff.commissionRate).toBe(1);
  });

  it("updates commission rate on the affiliate", () => {
    const db = new MockDB();
    const aff = db.addAffiliate({ commissionRate: 0.2 });

    simulateAdminSetCommission(db, aff._id, 0.35);

    expect(aff.commissionRate).toBe(0.35);
  });

  it("throws for non-existent affiliate", () => {
    const db = new MockDB();

    expect(() =>
      simulateAdminSetCommission(db, "nonexistent_1", 0.5)
    ).toThrow("Affiliate not found");
  });
});

describe("trackClick", () => {
  it("increments click count for approved affiliate", () => {
    const db = new MockDB();
    const user = db.addUser();
    const aff = db.addAffiliate({
      userId: user._id,
      code: "CLICK",
      status: "approved",
    });

    simulateTrackClick(db, "CLICK");

    expect(aff.totalClicks).toBe(1);
    expect(db.referrals.filter((r) => r.type === "click")).toHaveLength(1);
  });

  it("does not throw for non-existent code", () => {
    const db = new MockDB();

    expect(() => simulateTrackClick(db, "NOCODE")).not.toThrow();
    expect(db.referrals).toHaveLength(0);
  });

  it("does not increment for suspended affiliate", () => {
    const db = new MockDB();
    const user = db.addUser();
    const aff = db.addAffiliate({
      userId: user._id,
      code: "SUSPENDED",
      status: "suspended",
    });

    simulateTrackClick(db, "SUSPENDED");

    expect(aff.totalClicks).toBe(0);
    expect(db.referrals).toHaveLength(0);
  });

  it("does not increment for pending affiliate", () => {
    const db = new MockDB();
    const user = db.addUser();
    const aff = db.addAffiliate({
      userId: user._id,
      code: "PENDING",
      status: "pending",
    });

    simulateTrackClick(db, "PENDING");

    expect(aff.totalClicks).toBe(0);
  });

  it("does not increment for rejected affiliate", () => {
    const db = new MockDB();
    const user = db.addUser();
    const aff = db.addAffiliate({
      userId: user._id,
      code: "REJECTED",
      status: "rejected",
    });

    simulateTrackClick(db, "REJECTED");

    expect(aff.totalClicks).toBe(0);
  });

  it("handles invalid code format gracefully (no throw)", () => {
    const db = new MockDB();

    expect(() => simulateTrackClick(db, "!!")).not.toThrow();
    expect(() => simulateTrackClick(db, "")).not.toThrow();
    expect(() => simulateTrackClick(db, "a b")).not.toThrow();
  });

  it("is case-insensitive for code lookup", () => {
    const db = new MockDB();
    const user = db.addUser();
    const aff = db.addAffiliate({
      userId: user._id,
      code: "PARTNER",
      status: "approved",
    });

    simulateTrackClick(db, "partner");

    expect(aff.totalClicks).toBe(1);
  });
});

describe("getByCode Query", () => {
  it("returns affiliate info for approved code", () => {
    const db = new MockDB();
    const user = db.addUser({ name: "Alice" });
    db.addAffiliate({
      userId: user._id,
      code: "ALICE",
      status: "approved",
    });

    const result = simulateGetByCode(db, "ALICE");

    expect(result).not.toBeNull();
    expect(result!.code).toBe("ALICE");
    expect(result!.name).toBe("Alice");
  });

  it("returns null for non-approved affiliate", () => {
    const db = new MockDB();
    const user = db.addUser();
    db.addAffiliate({
      userId: user._id,
      code: "PENDING",
      status: "pending",
    });

    expect(simulateGetByCode(db, "PENDING")).toBeNull();
  });

  it("returns null for non-existent code", () => {
    const db = new MockDB();

    expect(simulateGetByCode(db, "NOCODE")).toBeNull();
  });

  it("is case-insensitive", () => {
    const db = new MockDB();
    const user = db.addUser({ name: "Bob" });
    db.addAffiliate({
      userId: user._id,
      code: "BOB",
      status: "approved",
    });

    const result = simulateGetByCode(db, "bob");
    expect(result).not.toBeNull();
    expect(result!.code).toBe("BOB");
  });

  it("returns 'Affiliate' as fallback name when user has no name", () => {
    const db = new MockDB();
    const user = db.addUser({ name: undefined });
    db.addAffiliate({
      userId: user._id,
      code: "NONAME",
      status: "approved",
    });

    const result = simulateGetByCode(db, "NONAME");
    expect(result!.name).toBe("Affiliate");
  });
});

describe("adminOverview Aggregations", () => {
  it("aggregates correctly with multiple affiliates", () => {
    const db = new MockDB();
    const u1 = db.addUser();
    const u2 = db.addUser();
    const u3 = db.addUser();

    db.addAffiliate({
      userId: u1._id,
      code: "A1",
      status: "approved",
      totalEarnings: 100,
      totalPaidOut: 50,
      totalConversions: 5,
    });
    db.addAffiliate({
      userId: u2._id,
      code: "A2",
      status: "approved",
      totalEarnings: 200,
      totalPaidOut: 100,
      totalConversions: 10,
    });
    db.addAffiliate({
      userId: u3._id,
      code: "A3",
      status: "pending",
      totalEarnings: 0,
      totalPaidOut: 0,
      totalConversions: 0,
    });

    const overview = simulateAdminOverview(db);

    expect(overview.total).toBe(3);
    expect(overview.pending).toBe(1);
    expect(overview.approved).toBe(2);
    expect(overview.totalEarnings).toBe(300);
    expect(overview.totalPaidOut).toBe(150);
    expect(overview.totalPending).toBe(150);
    expect(overview.totalConversions).toBe(15);
  });

  it("returns zeros for empty affiliates list", () => {
    const db = new MockDB();

    const overview = simulateAdminOverview(db);

    expect(overview.total).toBe(0);
    expect(overview.pending).toBe(0);
    expect(overview.approved).toBe(0);
    expect(overview.totalEarnings).toBe(0);
    expect(overview.totalPaidOut).toBe(0);
    expect(overview.totalPending).toBe(0);
    expect(overview.totalConversions).toBe(0);
  });

  it("rounds earnings/payouts to 2 decimal places", () => {
    const db = new MockDB();
    const u1 = db.addUser();
    db.addAffiliate({
      userId: u1._id,
      code: "ROUND",
      status: "approved",
      totalEarnings: 33.333,
      totalPaidOut: 11.111,
      totalConversions: 1,
    });

    const overview = simulateAdminOverview(db);

    expect(overview.totalEarnings).toBe(33.33);
    expect(overview.totalPaidOut).toBe(11.11);
    expect(overview.totalPending).toBe(22.22);
  });
});

describe("Payment Metadata (affiliateCode)", () => {
  it("stores affiliateCode in payment metadata as JSON", () => {
    const affiliateCode = "PARTNER";
    const metadata = JSON.stringify({ affiliateCode });

    const parsed = JSON.parse(metadata);
    expect(parsed.affiliateCode).toBe("PARTNER");
  });

  it("metadata is undefined when no affiliateCode provided", () => {
    const affiliateCode: string | undefined = undefined;
    const metadata = affiliateCode
      ? JSON.stringify({ affiliateCode })
      : undefined;

    expect(metadata).toBeUndefined();
  });

  it("metadata round-trips correctly through JSON", () => {
    const codes = ["MYCODE", "test-partner", "A_B_C", "123"];
    for (const code of codes) {
      const metadata = JSON.stringify({ affiliateCode: code });
      const parsed = JSON.parse(metadata);
      expect(parsed.affiliateCode).toBe(code);
    }
  });
});

describe("Subscription Activate - Affiliate Conversion Hook", () => {
  it("extracts affiliateCode from payment metadata and would schedule conversion", () => {
    const payment: PaymentRecord = {
      _id: "payments_1",
      userId: "users_1",
      orderId: "order_123",
      plan: "starter",
      billingPeriod: "monthly",
      amount: 40,
      currency: "USD",
      status: "paid",
      metadata: JSON.stringify({ affiliateCode: "PARTNER" }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Simulate the metadata parsing logic from subscriptions.activate
    let scheduledConversion: {
      affiliateCode: string;
      referredUserId: string;
      paymentId: string;
      saleAmount: number;
    } | null = null;

    if (payment.metadata) {
      try {
        const meta = JSON.parse(payment.metadata);
        if (meta.affiliateCode) {
          scheduledConversion = {
            affiliateCode: meta.affiliateCode,
            referredUserId: payment.userId,
            paymentId: payment._id,
            saleAmount: payment.amount,
          };
        }
      } catch {
        // Invalid metadata — skip
      }
    }

    expect(scheduledConversion).not.toBeNull();
    expect(scheduledConversion!.affiliateCode).toBe("PARTNER");
    expect(scheduledConversion!.saleAmount).toBe(40);
    expect(scheduledConversion!.referredUserId).toBe("users_1");
    expect(scheduledConversion!.paymentId).toBe("payments_1");
  });

  it("skips conversion when metadata is absent", () => {
    const payment: PaymentRecord = {
      _id: "payments_1",
      userId: "users_1",
      orderId: "order_123",
      plan: "starter",
      amount: 40,
      currency: "USD",
      status: "paid",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    let scheduledConversion = false;
    if (payment.metadata) {
      try {
        const meta = JSON.parse(payment.metadata);
        if (meta.affiliateCode) {
          scheduledConversion = true;
        }
      } catch {
        // skip
      }
    }

    expect(scheduledConversion).toBe(false);
  });

  it("skips conversion when metadata has invalid JSON", () => {
    const payment: PaymentRecord = {
      _id: "payments_1",
      userId: "users_1",
      orderId: "order_123",
      plan: "starter",
      amount: 40,
      currency: "USD",
      status: "paid",
      metadata: "not-json{{{",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    let scheduledConversion = false;
    if (payment.metadata) {
      try {
        const meta = JSON.parse(payment.metadata);
        if (meta.affiliateCode) {
          scheduledConversion = true;
        }
      } catch {
        // Invalid JSON — skip silently (matches production behavior)
      }
    }

    expect(scheduledConversion).toBe(false);
  });

  it("skips conversion when metadata has no affiliateCode key", () => {
    const payment: PaymentRecord = {
      _id: "payments_1",
      userId: "users_1",
      orderId: "order_123",
      plan: "starter",
      amount: 40,
      currency: "USD",
      status: "paid",
      metadata: JSON.stringify({ someOtherKey: "value" }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    let scheduledConversion = false;
    if (payment.metadata) {
      try {
        const meta = JSON.parse(payment.metadata);
        if (meta.affiliateCode) {
          scheduledConversion = true;
        }
      } catch {
        // skip
      }
    }

    expect(scheduledConversion).toBe(false);
  });
});

describe("Full Affiliate Flow (Integration)", () => {
  it("apply -> approve -> click -> signup -> pay -> conversion", () => {
    const db = new MockDB();

    // 1. Affiliate applies
    const affiliateOwner = db.addUser({ name: "Alice Partner" });
    simulateApply(db, affiliateOwner._id, "ALICE20", undefined, "alice@paypal.com");

    const affiliate = db.findAffiliateByUser(affiliateOwner._id)!;
    expect(affiliate.status).toBe("pending");

    // 2. Admin approves
    affiliate.status = "approved";
    affiliate.approvedAt = Date.now();

    // 3. Someone clicks the affiliate link
    simulateTrackClick(db, "alice20"); // lowercase, should still work
    expect(affiliate.totalClicks).toBe(1);

    // 4. That person signs up and gets stamped
    const newUser = db.addUser({ name: "Bob Customer" });
    simulateStampReferral(db, newUser._id, "alice20");
    expect(newUser.referredBy).toBe("ALICE20");
    expect(affiliate.totalSignups).toBe(1);

    // 5. Bob pays $40 for starter plan
    const payment = db.addPayment({
      userId: newUser._id,
      amount: 40,
      status: "paid",
      metadata: JSON.stringify({ affiliateCode: "ALICE20" }),
    });

    // 6. Subscription activate triggers recordConversion
    simulateRecordConversion(
      db,
      "ALICE20",
      newUser._id,
      payment._id,
      payment.amount
    );

    // Verify final state
    expect(affiliate.totalConversions).toBe(1);
    expect(affiliate.totalEarnings).toBe(8); // 20% of $40
    expect(affiliate.totalPaidOut).toBe(0);

    const conversionEvent = db.referrals.find(
      (r) => r.type === "conversion"
    )!;
    expect(conversionEvent.commissionAmount).toBe(8);
    expect(conversionEvent.saleAmount).toBe(40);
    expect(conversionEvent.paymentId).toBe(payment._id);

    // 7. Admin pays out
    simulateAdminRecordPayout(db, affiliate._id, 8, "First payout");
    expect(affiliate.totalPaidOut).toBe(8);

    // Pending balance is now $0
    const pending =
      Math.round(
        (affiliate.totalEarnings - affiliate.totalPaidOut) * 100
      ) / 100;
    expect(pending).toBe(0);
  });

  it("multiple referrals from one affiliate accumulate correctly", () => {
    const db = new MockDB();
    const affiliateOwner = db.addUser();
    const aff = db.addAffiliate({
      userId: affiliateOwner._id,
      code: "BULK",
      status: "approved",
      commissionRate: 0.2,
    });

    // 5 different users sign up and pay
    for (let i = 0; i < 5; i++) {
      const user = db.addUser();
      simulateStampReferral(db, user._id, "BULK");
      simulateRecordConversion(db, "BULK", user._id, `pay_${i}`, 40);
    }

    expect(aff.totalSignups).toBe(5);
    expect(aff.totalConversions).toBe(5);
    expect(aff.totalEarnings).toBe(40); // 5 * $8
    expect(aff.totalClicks).toBe(0); // no clicks tracked in this flow
  });
});

describe("Pending Balance Calculation", () => {
  it("computes pending payout correctly", () => {
    const totalEarnings = 150.55;
    const totalPaidOut = 80.25;
    const pending =
      Math.round((totalEarnings - totalPaidOut) * 100) / 100;
    expect(pending).toBe(70.3);
  });

  it("handles floating point edge cases", () => {
    // 0.1 + 0.2 !== 0.3 in JS, but rounding should fix it
    const totalEarnings = 0.1 + 0.2;
    const totalPaidOut = 0;
    const pending =
      Math.round((totalEarnings - totalPaidOut) * 100) / 100;
    expect(pending).toBe(0.3);
  });

  it("pending is zero when fully paid out", () => {
    const totalEarnings = 100;
    const totalPaidOut = 100;
    const pending =
      Math.round((totalEarnings - totalPaidOut) * 100) / 100;
    expect(pending).toBe(0);
  });
});

describe("Commission Calculation Edge Cases", () => {
  it("0% commission rate yields $0 earnings", () => {
    const saleAmount = 100;
    const rate = 0;
    const commission = Math.round(saleAmount * rate * 100) / 100;
    expect(commission).toBe(0);
  });

  it("100% commission rate yields full sale amount", () => {
    const saleAmount = 40;
    const rate = 1;
    const commission = Math.round(saleAmount * rate * 100) / 100;
    expect(commission).toBe(40);
  });

  it("handles very small sale amounts", () => {
    const saleAmount = 1; // minimum $1 charge
    const rate = 0.2;
    const commission = Math.round(saleAmount * rate * 100) / 100;
    expect(commission).toBe(0.2);
  });

  it("handles pro yearly price correctly", () => {
    const saleAmount = 960; // pro yearly
    const rate = 0.2;
    const commission = Math.round(saleAmount * rate * 100) / 100;
    expect(commission).toBe(192);
  });

  it("accumulated earnings round correctly over many conversions", () => {
    let totalEarnings = 0;
    const rate = 0.15;
    const amounts = [33.33, 66.67, 99.99, 1.01, 50.5];

    for (const amount of amounts) {
      const commission = Math.round(amount * rate * 100) / 100;
      totalEarnings =
        Math.round((totalEarnings + commission) * 100) / 100;
    }

    // Verify it's a clean 2-decimal number
    const decimalStr = totalEarnings.toString();
    const decimalParts = decimalStr.split(".");
    if (decimalParts[1]) {
      expect(decimalParts[1].length).toBeLessThanOrEqual(2);
    }
  });
});
