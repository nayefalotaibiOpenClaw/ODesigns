import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Middleware Ref Cookie Logic ─────────────────────────────────────
// We test the middleware's affiliate referral logic by extracting the same
// patterns used in middleware.ts and verifying them in isolation.

/** The ref code regex from middleware.ts line 27 */
const REF_CODE_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

/** Simulates the middleware ref-processing logic (lines 26-37 of middleware.ts) */
function processRefParam(url: string) {
  const parsed = new URL(url);
  const refCode = parsed.searchParams.get("ref");

  if (refCode && REF_CODE_PATTERN.test(refCode)) {
    const cleanUrl = new URL(url);
    cleanUrl.searchParams.delete("ref");
    return {
      redirect: true,
      redirectUrl: cleanUrl.toString(),
      cookieValue: refCode.toUpperCase(),
    };
  }

  return { redirect: false, redirectUrl: null, cookieValue: null };
}

/** The skip-route check from middleware.ts lines 15-23 */
function shouldSkipRefProcessing(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/convex") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  );
}

/** Cookie regex from ReferralTracker.tsx and pricing page */
const COOKIE_REGEX = /(?:^|;\s*)ref=([^;]+)/;

describe("Middleware ref cookie logic", () => {
  it("1. ?ref=SARAH20 sets cookie and redirects to clean URL", () => {
    const result = processRefParam("https://example.com/pricing?ref=SARAH20");
    expect(result.redirect).toBe(true);
    expect(result.cookieValue).toBe("SARAH20");
    expect(result.redirectUrl).toBe("https://example.com/pricing");
  });

  it("2. ?ref=sarah20 cookie value is uppercased", () => {
    const result = processRefParam("https://example.com/?ref=sarah20");
    expect(result.redirect).toBe(true);
    expect(result.cookieValue).toBe("SARAH20");
  });

  it("3. ?ref=ab (too short, 2 chars) is ignored, no redirect", () => {
    const result = processRefParam("https://example.com/?ref=ab");
    expect(result.redirect).toBe(false);
    expect(result.cookieValue).toBeNull();
  });

  it("4. ?ref=TOOLONGCODEEEEEEEEEEE (>20 chars) is ignored", () => {
    const code = "TOOLONGCODEEEEEEEEEEE"; // 21 chars
    expect(code.length).toBeGreaterThan(20);
    const result = processRefParam(`https://example.com/?ref=${code}`);
    expect(result.redirect).toBe(false);
    expect(result.cookieValue).toBeNull();
  });

  it("5. ?ref=invalid chars! is ignored", () => {
    const result = processRefParam(
      "https://example.com/?ref=" + encodeURIComponent("invalid chars!")
    );
    expect(result.redirect).toBe(false);
    expect(result.cookieValue).toBeNull();
  });

  it("6. ?ref=VALID-CODE_1 with dashes/underscores works", () => {
    const result = processRefParam("https://example.com/?ref=VALID-CODE_1");
    expect(result.redirect).toBe(true);
    expect(result.cookieValue).toBe("VALID-CODE_1");
  });

  it("7. URL with ?ref=CODE&other=param preserves other params after stripping ref", () => {
    const result = processRefParam(
      "https://example.com/pricing?ref=CODE123&plan=pro&period=annual"
    );
    expect(result.redirect).toBe(true);
    expect(result.cookieValue).toBe("CODE123");
    const redirected = new URL(result.redirectUrl!);
    expect(redirected.searchParams.get("plan")).toBe("pro");
    expect(redirected.searchParams.get("period")).toBe("annual");
    expect(redirected.searchParams.has("ref")).toBe(false);
  });

  it("8. Locale paths like /ar?ref=CODE still work (ref processed before locale)", () => {
    // In middleware.ts, ref processing (line 26) happens before locale checks (line 39)
    const result = processRefParam("https://example.com/ar?ref=ARABIC1");
    expect(result.redirect).toBe(true);
    expect(result.cookieValue).toBe("ARABIC1");
    expect(result.redirectUrl).toBe("https://example.com/ar");
  });

  it("9. API routes (/api/...) skip ref processing", () => {
    expect(shouldSkipRefProcessing("/api/generate")).toBe(true);
    expect(shouldSkipRefProcessing("/api/payments/webhook")).toBe(true);
  });

  it("10. Static files (/favicon.ico, *.js) skip ref processing", () => {
    expect(shouldSkipRefProcessing("/favicon.ico")).toBe(true);
    expect(shouldSkipRefProcessing("/static/bundle.js")).toBe(true);
    expect(shouldSkipRefProcessing("/images/logo.png")).toBe(true);
    expect(shouldSkipRefProcessing("/_next/static/chunk.js")).toBe(true);
  });
});

// ─── Cookie Reading Tests (pricing page + ReferralTracker pattern) ───

describe("Cookie regex for ref reading", () => {
  it("11. matches ref=CODE at start of cookie string", () => {
    const match = "ref=SARAH20".match(COOKIE_REGEX);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("SARAH20");
  });

  it("12. matches ; ref=CODE in middle of cookie string", () => {
    const match = "session=abc123; ref=PROMO50; theme=dark".match(COOKIE_REGEX);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("PROMO50");
  });

  it("13. doesn't match otherref=CODE (must be exact 'ref=')", () => {
    const match = "otherref=CODE".match(COOKIE_REGEX);
    expect(match).toBeNull();
  });

  it("14. decodeURIComponent try-catch handles malformed values", () => {
    // Simulate the pattern from ReferralTracker.tsx lines 24-29
    const malformedCookie = "ref=%E0%A4%A";
    const match = malformedCookie.match(COOKIE_REGEX);
    expect(match).not.toBeNull();

    let code: string | undefined;
    try {
      code = decodeURIComponent(match![1]);
    } catch {
      code = undefined; // malformed — should be caught gracefully
    }
    expect(code).toBeUndefined();
  });
});

// ─── ReferralTracker Logic Tests ─────────────────────────────────────

describe("ReferralTracker logic", () => {
  let stampReferral: ReturnType<typeof vi.fn>;
  let trackClick: ReturnType<typeof vi.fn>;
  let cookieCleared: boolean;

  beforeEach(() => {
    stampReferral = vi.fn().mockResolvedValue(undefined);
    trackClick = vi.fn().mockResolvedValue(undefined);
    cookieCleared = false;
  });

  /**
   * Simulates the core effect logic from ReferralTracker.tsx (lines 20-43)
   * extracted so we can test without a DOM environment.
   * Takes cookie string as input instead of reading document.cookie.
   */
  function runReferralEffect(
    cookieString: string,
    isAuthenticated: boolean,
    hasStampTracked: { current: boolean },
    hasClickTracked: { current: boolean }
  ): Promise<void> {
    const match = cookieString.match(/(?:^|;\s*)ref=([^;]+)/);
    if (!match) return Promise.resolve();

    let code: string;
    try {
      code = decodeURIComponent(match[1]);
    } catch {
      return Promise.resolve();
    }

    if (isAuthenticated && !hasStampTracked.current) {
      hasStampTracked.current = true;
      return stampReferral({ code }).then(() => {
        // In actual component: document.cookie = "ref=; path=/; max-age=0";
        cookieCleared = true;
      });
    } else if (!isAuthenticated && !hasClickTracked.current) {
      hasClickTracked.current = true;
      return trackClick({ code });
    }

    return Promise.resolve();
  }

  it("15. Authenticated user with ref cookie calls stampReferral", async () => {
    const hasStamp = { current: false };
    const hasClick = { current: false };

    await runReferralEffect("ref=SARAH20", true, hasStamp, hasClick);

    expect(stampReferral).toHaveBeenCalledWith({ code: "SARAH20" });
    expect(trackClick).not.toHaveBeenCalled();
    expect(hasStamp.current).toBe(true);
  });

  it("16. Unauthenticated user with ref cookie calls trackClick", async () => {
    const hasStamp = { current: false };
    const hasClick = { current: false };

    await runReferralEffect("ref=PROMO10", false, hasStamp, hasClick);

    expect(trackClick).toHaveBeenCalledWith({ code: "PROMO10" });
    expect(stampReferral).not.toHaveBeenCalled();
    expect(hasClick.current).toBe(true);
  });

  it("17. No ref cookie means no mutations called", async () => {
    const hasStamp = { current: false };
    const hasClick = { current: false };

    await runReferralEffect("session=abc; theme=dark", true, hasStamp, hasClick);

    expect(stampReferral).not.toHaveBeenCalled();
    expect(trackClick).not.toHaveBeenCalled();
  });

  it("18. Cookie cleared after successful stamp", async () => {
    const hasStamp = { current: false };
    const hasClick = { current: false };

    await runReferralEffect("ref=CLEAR_ME", true, hasStamp, hasClick);

    // After stampReferral resolves, cookie is cleared
    expect(cookieCleared).toBe(true);
  });
});
