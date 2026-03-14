import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { randomBytes } from "crypto";

// ─── Rate Limiting Tests (Issue #27) ────────────────────────────────
// We test the rate limiter logic by dynamically importing it with mocks.

describe("Rate Limiting", () => {
  // Mock server-only and NextResponse to avoid Next.js runtime dependency
  beforeEach(() => {
    vi.mock("server-only", () => ({}));
    vi.mock("next/server", () => ({
      NextResponse: {
        json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
          body,
          status: init?.status ?? 200,
          headers: init?.headers ?? {},
        }),
      },
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  function makeRequest(ip?: string): Request {
    const headers = new Headers();
    if (ip) headers.set("x-forwarded-for", ip);
    return new Request("https://example.com/api/test", { headers });
  }

  it("allows requests under the limit", async () => {
    const { aiRateLimiter } = await import("../lib/security/rate-limit");
    const req = makeRequest("1.2.3.4");

    // First request should pass
    const result = aiRateLimiter.check(req, "user-123");
    expect(result).toBeNull();
  });

  it("blocks requests over the limit", async () => {
    const { aiRateLimiter } = await import("../lib/security/rate-limit");

    // Exhaust the 20-request limit
    for (let i = 0; i < 20; i++) {
      const req = makeRequest();
      const result = aiRateLimiter.check(req, "spam-user");
      expect(result).toBeNull();
    }

    // 21st request should be blocked
    const req = makeRequest();
    const result = aiRateLimiter.check(req, "spam-user");
    expect(result).not.toBeNull();
    expect((result as any).status).toBe(429);
    expect((result as any).body.error).toContain("Too many requests");
  });

  it("rate limits per-user independently", async () => {
    const { aiRateLimiter } = await import("../lib/security/rate-limit");

    // Exhaust limit for user A
    for (let i = 0; i < 20; i++) {
      aiRateLimiter.check(makeRequest(), "user-A");
    }

    // User B should still be able to make requests
    const result = aiRateLimiter.check(makeRequest(), "user-B");
    expect(result).toBeNull();
  });

  it("falls back to IP when no userId provided", async () => {
    const { websiteRateLimiter } = await import("../lib/security/rate-limit");

    // Make requests without userId — should use IP
    for (let i = 0; i < 30; i++) {
      const result = websiteRateLimiter.check(makeRequest("10.0.0.1"));
      expect(result).toBeNull();
    }

    // 31st from same IP should be blocked
    const result = websiteRateLimiter.check(makeRequest("10.0.0.1"));
    expect(result).not.toBeNull();
    expect((result as any).status).toBe(429);

    // Different IP should still work
    const result2 = websiteRateLimiter.check(makeRequest("10.0.0.2"));
    expect(result2).toBeNull();
  });

  it("includes Retry-After header in 429 response", async () => {
    const { aiRateLimiter } = await import("../lib/security/rate-limit");

    for (let i = 0; i < 20; i++) {
      aiRateLimiter.check(makeRequest(), "retry-user");
    }

    const result = aiRateLimiter.check(makeRequest(), "retry-user");
    expect(result).not.toBeNull();
    expect((result as any).headers["Retry-After"]).toBeDefined();
    expect((result as any).headers["X-RateLimit-Limit"]).toBe("20");
    expect((result as any).headers["X-RateLimit-Remaining"]).toBe("0");
  });

  it("website limiter allows 30 requests per minute", async () => {
    const { websiteRateLimiter } = await import("../lib/security/rate-limit");

    for (let i = 0; i < 30; i++) {
      const result = websiteRateLimiter.check(makeRequest(), "web-user");
      expect(result).toBeNull();
    }

    const result = websiteRateLimiter.check(makeRequest(), "web-user");
    expect(result).not.toBeNull();
    expect((result as any).status).toBe(429);
  });
});

// ─── Encryption Tests (Issue #32) ───────────────────────────────────
// Tests the encrypt/decrypt round-trip using the Web Crypto API.

describe("Token Encryption", () => {
  const TEST_KEY = randomBytes(32).toString("base64");

  beforeEach(() => {
    process.env.TOKEN_ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    delete process.env.TOKEN_ENCRYPTION_KEY;
  });

  it("encrypt returns iv:ciphertext format", async () => {
    const { encrypt } = await import("../convex/lib/encryption");
    const result = await encrypt("test-token-123");

    expect(result).toContain(":");
    const [iv, cipher] = result.split(":", 2);
    expect(iv.length).toBeGreaterThan(0);
    expect(cipher.length).toBeGreaterThan(0);
  });

  it("decrypt recovers original plaintext", async () => {
    const { encrypt, decrypt } = await import("../convex/lib/encryption");
    const original = "EAAGm0PX4ZC...long-access-token-here";

    const encrypted = await encrypt(original);
    const decrypted = await decrypt(encrypted);

    expect(decrypted).toBe(original);
  });

  it("different encryptions produce different ciphertexts (unique IVs)", async () => {
    const { encrypt } = await import("../convex/lib/encryption");
    const token = "same-token";

    const enc1 = await encrypt(token);
    const enc2 = await encrypt(token);

    expect(enc1).not.toBe(enc2); // Different IVs
  });

  it("decrypt handles legacy plaintext tokens (backward compat)", async () => {
    const { decrypt } = await import("../convex/lib/encryption");

    // Legacy token with no colon — should be returned as-is
    const legacy = "EAAGm0PX4ZCpsBOxxxxxxxxxx";
    const result = await decrypt(legacy);

    expect(result).toBe(legacy);
  });

  it("decrypt handles empty colon-separated values gracefully", async () => {
    const { decrypt } = await import("../convex/lib/encryption");

    const result = await decrypt(":");
    expect(result).toBe(":");
  });

  it("throws when TOKEN_ENCRYPTION_KEY is missing", async () => {
    delete process.env.TOKEN_ENCRYPTION_KEY;
    // Need fresh import to pick up env change
    vi.resetModules();
    const { encrypt } = await import("../convex/lib/encryption");

    await expect(encrypt("test")).rejects.toThrow("TOKEN_ENCRYPTION_KEY");
  });

  it("encrypts and decrypts special characters", async () => {
    const { encrypt, decrypt } = await import("../convex/lib/encryption");
    const token = "token/with+special=chars&more%20stuff!@#$";

    const encrypted = await encrypt(token);
    const decrypted = await decrypt(encrypted);

    expect(decrypted).toBe(token);
  });

  it("encrypts and decrypts long tokens", async () => {
    const { encrypt, decrypt } = await import("../convex/lib/encryption");
    const longToken = "A".repeat(2000);

    const encrypted = await encrypt(longToken);
    const decrypted = await decrypt(encrypted);

    expect(decrypted).toBe(longToken);
  });
});

// ─── Pagination Tests (Issue #35) ───────────────────────────────────
// Verify that user-facing queries have .take(N) limits instead of .collect().

describe("Pagination limits", () => {
  // Read source files and verify .collect() is only used in mutations (cascade ops)
  // and not in user-facing queries.

  async function readFile(path: string): Promise<string> {
    const { readFileSync } = await import("fs");
    return readFileSync(path, "utf-8");
  }

  it("posts.ts user-facing queries use .take() not .collect()", async () => {
    const src = await readFile("convex/posts.ts");

    // User-facing queries should use .take()
    const takeCalls = [...src.matchAll(/\.take\(\d+\)/g)];
    expect(takeCalls.length).toBeGreaterThanOrEqual(3);

    // .collect() is only allowed in mutation handlers (createBatch uses it for order shifting)
    const collectCalls = [...src.matchAll(/\.collect\(\)/g)];
    // Should have exactly 1 .collect() — the createBatch mutation
    expect(collectCalls.length).toBe(1);
  });

  it("collections.ts user-facing queries use .take() not .collect()", async () => {
    const src = await readFile("convex/collections.ts");

    const takeCalls = [...src.matchAll(/\.take\(\d+\)/g)];
    expect(takeCalls.length).toBeGreaterThanOrEqual(2);

    // .collect() in remove mutation is expected (cascade delete)
    const collectCalls = [...src.matchAll(/\.collect\(\)/g)];
    for (const match of collectCalls) {
      const context = src.slice(Math.max(0, match.index! - 200), match.index! + 50);
      expect(context).toMatch(/remove|mutation|delete/i);
    }
  });

  it("assets.ts user-facing queries use .take() not .collect()", async () => {
    const src = await readFile("convex/assets.ts");

    const takeCalls = [...src.matchAll(/\.take\(\d+\)/g)];
    expect(takeCalls.length).toBeGreaterThanOrEqual(5);
  });

  it("publishing.ts user-facing queries use .take() not .collect()", async () => {
    const src = await readFile("convex/publishing.ts");

    // listScheduledByMonth, listScheduled, listHistory should have .take()
    const takeCalls = [...src.matchAll(/\.take\(\d+\)/g)];
    expect(takeCalls.length).toBeGreaterThanOrEqual(3);

    // cancelBatch mutation is allowed to use .collect()
    const collectCalls = [...src.matchAll(/\.collect\(\)/g)];
    for (const match of collectCalls) {
      const context = src.slice(Math.max(0, match.index! - 300), match.index! + 50);
      expect(context).toMatch(/cancel|mutation|batch|process|internal/i);
    }
  });
});

// ─── Error Sanitization Tests (Issue #41) ───────────────────────────
// Verify that API route catch blocks return generic messages, not internal details.

describe("Error message sanitization", () => {
  async function readFile(path: string): Promise<string> {
    const { readFileSync } = await import("fs");
    return readFileSync(path, "utf-8");
  }

  it("generate/_shared.ts does not leak raw error.message to client", async () => {
    const src = await readFile("app/api/generate/_shared.ts");

    // The fallback error should NOT include ${message} or error.message
    expect(src).not.toMatch(/error: `.*\$\{message/);
    expect(src).not.toMatch(/error: message/);

    // Should have generic messages
    expect(src).toContain("Generation failed. Please try again.");
    expect(src).toContain("AI model configuration error.");
    expect(src).toContain("AI service is not properly configured.");
  });

  it("crawl-website/route.ts does not leak internal error details", async () => {
    const src = await readFile("app/api/crawl-website/route.ts");

    // The main catch block should not forward error.message
    const mainCatch = src.match(/catch \(err: unknown\)[\s\S]*?return NextResponse\.json/);
    expect(mainCatch).toBeTruthy();
    expect(mainCatch![0]).not.toMatch(/error: message/);
    expect(src).toContain("Failed to crawl website.");
  });

  it("fetch-website/route.ts does not leak internal error details", async () => {
    const src = await readFile("app/api/fetch-website/route.ts");

    // Should use generic messages
    expect(src).toContain("Failed to fetch website.");
    expect(src).toContain("Could not reach website.");
    expect(src).toContain("Failed to process website.");

    // Should NOT forward raw error message
    expect(src).not.toMatch(/error: `Could not reach website: \$\{msg\}`/);
    expect(src).not.toMatch(/error: `Failed to fetch website: \$\{/);
  });

  it("unsplash/route.ts does not forward raw upstream response", async () => {
    const src = await readFile("app/api/unsplash/route.ts");

    // Should NOT have: { error: text }
    expect(src).not.toMatch(/\{ error: text \}/);
    expect(src).toContain("Image search service returned an error.");
  });
});

// ─── PII Removal Tests (Issue #40) ──────────────────────────────────
// Verify that payment console.error calls don't log full objects/bodies.

describe("PII removal from logs", () => {
  async function readFile(path: string): Promise<string> {
    const { readFileSync } = await import("fs");
    return readFileSync(path, "utf-8");
  }

  it("payments/create does not log full response body", async () => {
    const src = await readFile("app/api/payments/create/route.ts");

    // Should NOT log full data object
    expect(src).not.toMatch(/console\.error\("UPayments error:", data\)/);
    // Should NOT log full response text
    expect(src).not.toMatch(/console\.error\("UPayments returned non-JSON:", responseText/);
    // Should NOT log full error object
    expect(src).not.toMatch(/console\.error\("Payment create error:", error\)/);

    // Should log sanitized versions
    expect(src).toContain("orderId");
    expect(src).toContain("httpStatus");
    expect(src).toContain("error instanceof Error ? error.message");
  });

  it("payments/verify does not log full error object", async () => {
    const src = await readFile("app/api/payments/verify/route.ts");

    expect(src).not.toMatch(/console\.error\("Payment verify error:", error\)$/m);
    expect(src).toContain("error instanceof Error ? error.message");
  });

  it("payments/webhook does not log full error object", async () => {
    const src = await readFile("app/api/payments/webhook/route.ts");

    expect(src).not.toMatch(/console\.error\("Webhook proxy error:", error\)$/m);
    expect(src).toContain("error instanceof Error ? error.message");
  });

  it("convex/webhooks.ts does not log full error objects", async () => {
    const src = await readFile("convex/webhooks.ts");

    expect(src).not.toMatch(/console\.error\("UPayments verification error:", err\)$/m);
    expect(src).not.toMatch(/console\.error\("Webhook error:", error\)$/m);
    // Both should use safe pattern
    const safePatternCount = (src.match(/err instanceof Error \? err\.message/g) || []).length;
    expect(safePatternCount).toBeGreaterThanOrEqual(1);
  });
});

// ─── Encryption Integration Check (Issue #32) ──────────────────────
// Verify that socialAccounts.ts actually uses encrypt/decrypt.

describe("Token encryption integration", () => {
  async function readFile(path: string): Promise<string> {
    const { readFileSync } = await import("fs");
    return readFileSync(path, "utf-8");
  }

  it("socialAccounts.ts imports encryption utilities", async () => {
    const src = await readFile("convex/socialAccounts.ts");
    expect(src).toContain('import { encrypt, decrypt } from "./lib/encryption"');
  });

  it("socialAccounts.ts encrypts tokens in connect handler", async () => {
    const src = await readFile("convex/socialAccounts.ts");
    expect(src).toContain("await encrypt(args.accessToken)");
    expect(src).toContain("await encrypt(args.refreshToken)");
  });

  it("socialAccounts.ts decrypts tokens in getWithTokens", async () => {
    const src = await readFile("convex/socialAccounts.ts");
    expect(src).toContain("await decrypt(account.accessToken)");
    expect(src).toContain("await decrypt(account.refreshToken)");
  });

  it("socialAccounts.ts encrypts in updateToken and updateTokenWithRefresh", async () => {
    const src = await readFile("convex/socialAccounts.ts");

    // Count encrypt calls — should be in connect, updateToken, updateTokenWithRefresh
    const encryptCalls = (src.match(/await encrypt\(/g) || []).length;
    expect(encryptCalls).toBeGreaterThanOrEqual(5); // accessToken + refreshToken in connect, updateToken, updateTokenWithRefresh
  });

  it("metaApiTest.ts decrypts tokens before use", async () => {
    const src = await readFile("convex/metaApiTest.ts");
    expect(src).toContain('import { decrypt } from "./lib/encryption"');
    expect(src).toContain("await decrypt(account.accessToken)");
  });
});

// ─── Rate Limiting 429 Verification ─────────────────────────────────
// Thorough verification that 429 responses are correct and complete.

describe("Rate limiting 429 response verification", () => {
  beforeEach(() => {
    vi.mock("server-only", () => ({}));
    vi.mock("next/server", () => ({
      NextResponse: {
        json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
          body,
          status: init?.status ?? 200,
          headers: init?.headers ?? {},
        }),
      },
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  function makeRequest(ip?: string): Request {
    const headers = new Headers();
    if (ip) headers.set("x-forwarded-for", ip);
    return new Request("https://example.com/api/test", { headers });
  }

  it("429 response contains all required headers", async () => {
    const { aiRateLimiter } = await import("../lib/security/rate-limit");

    // Exhaust limit
    for (let i = 0; i < 20; i++) {
      aiRateLimiter.check(makeRequest(), "header-check-user");
    }

    const result = aiRateLimiter.check(makeRequest(), "header-check-user") as any;
    expect(result).not.toBeNull();
    expect(result.status).toBe(429);
    expect(result.headers["Retry-After"]).toBeDefined();
    expect(Number(result.headers["Retry-After"])).toBeGreaterThan(0);
    expect(Number(result.headers["Retry-After"])).toBeLessThanOrEqual(60);
    expect(result.headers["X-RateLimit-Limit"]).toBe("20");
    expect(result.headers["X-RateLimit-Remaining"]).toBe("0");
    expect(result.body.error).toBe("Too many requests. Please try again later.");
  });

  it("429 response body does not leak internal details", async () => {
    const { aiRateLimiter } = await import("../lib/security/rate-limit");

    for (let i = 0; i < 20; i++) {
      aiRateLimiter.check(makeRequest(), "leak-check-user");
    }

    const result = aiRateLimiter.check(makeRequest(), "leak-check-user") as any;
    const bodyStr = JSON.stringify(result.body);

    // Should not contain IP addresses, user IDs, or timestamps
    expect(bodyStr).not.toContain("leak-check-user");
    expect(bodyStr).not.toContain("timestamp");
    expect(bodyStr).not.toContain("ip");
    // Only contains the generic error message
    expect(Object.keys(result.body)).toEqual(["error"]);
  });

  it("multiple blocked requests all get 429", async () => {
    const { aiRateLimiter } = await import("../lib/security/rate-limit");

    for (let i = 0; i < 20; i++) {
      aiRateLimiter.check(makeRequest(), "multi-block-user");
    }

    // All subsequent requests should be 429
    for (let i = 0; i < 5; i++) {
      const result = aiRateLimiter.check(makeRequest(), "multi-block-user") as any;
      expect(result).not.toBeNull();
      expect(result.status).toBe(429);
    }
  });

  it("websiteRateLimiter 429 has correct limit header", async () => {
    const { websiteRateLimiter } = await import("../lib/security/rate-limit");

    for (let i = 0; i < 30; i++) {
      websiteRateLimiter.check(makeRequest(), "web-429-user");
    }

    const result = websiteRateLimiter.check(makeRequest(), "web-429-user") as any;
    expect(result.status).toBe(429);
    expect(result.headers["X-RateLimit-Limit"]).toBe("30");
  });
});

// ─── Backward Compatibility: Unencrypted Token Handling ─────────────
// Verify that decrypt handles all forms of legacy/plaintext tokens.

describe("Backward compatibility for unencrypted tokens", () => {
  const TEST_KEY = randomBytes(32).toString("base64");

  beforeEach(() => {
    process.env.TOKEN_ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    delete process.env.TOKEN_ENCRYPTION_KEY;
    vi.resetModules();
  });

  it("passes through Facebook-style access tokens unchanged", async () => {
    const { decrypt } = await import("../convex/lib/encryption");

    // Real Facebook tokens look like this (no colons)
    const fbToken = "EAAGm0PX4ZCpsBOxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    expect(await decrypt(fbToken)).toBe(fbToken);
  });

  it("passes through Instagram-style tokens unchanged", async () => {
    const { decrypt } = await import("../convex/lib/encryption");

    const igToken = "IGQVJWZAkRCdlJPLWVFTl95Nm1IZAVZA0cVVfSm1hUGNL";
    expect(await decrypt(igToken)).toBe(igToken);
  });

  it("passes through simple alphanumeric tokens", async () => {
    const { decrypt } = await import("../convex/lib/encryption");

    const simpleToken = "abc123def456ghi789";
    expect(await decrypt(simpleToken)).toBe(simpleToken);
  });

  it("correctly decrypts newly encrypted tokens (migration path)", async () => {
    const { encrypt, decrypt } = await import("../convex/lib/encryption");

    // Simulate: old token gets encrypted on next write, then decrypted on read
    const oldToken = "EAAGm0PX4ZCpsBOxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

    // Step 1: encrypt on write (e.g., updateToken mutation)
    const encrypted = await encrypt(oldToken);
    expect(encrypted).toContain(":"); // Now in encrypted format

    // Step 2: decrypt on read (e.g., getWithTokens query)
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(oldToken);
  });

  it("handles tokens with URL-safe base64 characters", async () => {
    const { decrypt } = await import("../convex/lib/encryption");

    // Some OAuth tokens use URL-safe base64 (no colons)
    const urlSafeToken = "ya29.a0AfB_byC-dEf_gHiJk-lMnOp_qRsTuVwXyZ0123456789";
    expect(await decrypt(urlSafeToken)).toBe(urlSafeToken);
  });

  it("handles empty string", async () => {
    const { decrypt } = await import("../convex/lib/encryption");

    expect(await decrypt("")).toBe("");
  });

  it("does not corrupt tokens containing base64-like patterns", async () => {
    const { decrypt } = await import("../convex/lib/encryption");

    // Edge case: token that looks like it could be base64 but has no colon
    const tricky = "aGVsbG8gd29ybGQ=";
    expect(await decrypt(tricky)).toBe(tricky);
  });
});

// ─── Encryption Key Configuration ───────────────────────────────────
// Verify behavior when TOKEN_ENCRYPTION_KEY is missing or invalid.

describe("TOKEN_ENCRYPTION_KEY configuration", () => {
  afterEach(() => {
    delete process.env.TOKEN_ENCRYPTION_KEY;
    vi.resetModules();
  });

  it("encrypt throws clear error when key is missing", async () => {
    delete process.env.TOKEN_ENCRYPTION_KEY;
    vi.resetModules();
    const { encrypt } = await import("../convex/lib/encryption");

    await expect(encrypt("test")).rejects.toThrow("TOKEN_ENCRYPTION_KEY");
  });

  it("decrypt of legacy token works even without key set (no colon = passthrough)", async () => {
    delete process.env.TOKEN_ENCRYPTION_KEY;
    vi.resetModules();
    const { decrypt } = await import("../convex/lib/encryption");

    // Legacy tokens don't need the key since they bypass decryption
    const legacy = "EAAGm0PX4ZCpsBOxxxx";
    expect(await decrypt(legacy)).toBe(legacy);
  });

  it("decrypt of encrypted token falls back gracefully when key is missing", async () => {
    // First encrypt with a key
    process.env.TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    vi.resetModules();
    const { encrypt } = await import("../convex/lib/encryption");
    const encrypted = await encrypt("test-token");

    // Without the key, decrypt catches the error and returns the encrypted string as-is
    // This is the backward-compat behavior: unrecognized strings pass through
    delete process.env.TOKEN_ENCRYPTION_KEY;
    vi.resetModules();
    const { decrypt } = await import("../convex/lib/encryption");

    const result = await decrypt(encrypted);
    // Returns the encrypted string unchanged (catch block fallback)
    expect(result).toBe(encrypted);
  });

  it("decrypt with wrong key returns original string (fails gracefully)", async () => {
    // Encrypt with key A
    process.env.TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    vi.resetModules();
    const { encrypt } = await import("../convex/lib/encryption");
    const encrypted = await encrypt("secret-token");

    // Try to decrypt with key B
    process.env.TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    vi.resetModules();
    const { decrypt } = await import("../convex/lib/encryption");

    // Should fall back to returning the encrypted string as-is (catch block)
    const result = await decrypt(encrypted);
    expect(result).toBe(encrypted);
  });
});

// ─── Rate Limiting Integration Check (Issue #27) ────────────────────
// Verify that API routes actually import and use rate limiters.

describe("Rate limiting integration", () => {
  async function readFile(path: string): Promise<string> {
    const { readFileSync } = await import("fs");
    return readFileSync(path, "utf-8");
  }

  it("generate/route.ts uses aiRateLimiter", async () => {
    const src = await readFile("app/api/generate/route.ts");
    expect(src).toContain("aiRateLimiter");
    expect(src).toContain("rateLimitResponse");
  });

  it("adapt-ratio/route.ts uses aiRateLimiter", async () => {
    const src = await readFile("app/api/adapt-ratio/route.ts");
    expect(src).toContain("aiRateLimiter");
    expect(src).toContain("rateLimitResponse");
  });

  it("crawl-website/route.ts uses websiteRateLimiter", async () => {
    const src = await readFile("app/api/crawl-website/route.ts");
    expect(src).toContain("websiteRateLimiter");
    expect(src).toContain("rateLimitResponse");
  });

  it("fetch-website/route.ts uses websiteRateLimiter", async () => {
    const src = await readFile("app/api/fetch-website/route.ts");
    expect(src).toContain("websiteRateLimiter");
    expect(src).toContain("rateLimitResponse");
  });

  it("rate limiter check happens after auth check", async () => {
    for (const file of [
      "app/api/generate/route.ts",
      "app/api/adapt-ratio/route.ts",
      "app/api/crawl-website/route.ts",
      "app/api/fetch-website/route.ts",
    ]) {
      const src = await readFile(file);
      const authIndex = src.indexOf("requireAuth()");
      const rateLimitIndex = src.indexOf("rateLimitResponse");
      expect(authIndex).toBeLessThan(rateLimitIndex);
    }
  });
});
