import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "./lib/i18n/config";
import { detectFromAcceptLanguage } from "./lib/i18n/utils";

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export default convexAuthNextjsMiddleware(
  (request) => {
    const { pathname, searchParams } = request.nextUrl;

    // Skip non-page routes: API, _next, static files, favicon
    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/convex") ||
      pathname.includes(".") ||
      pathname === "/favicon.ico"
    ) {
      return;
    }

    // ─── Affiliate referral tracking ─────────────────
    // Extract ref code early; it will be attached to whichever response we return
    let pendingRefCode: string | null = null;
    const refCode = searchParams.get("ref");
    if (refCode && /^[a-zA-Z0-9_-]{3,20}$/.test(refCode)) {
      pendingRefCode = refCode.toUpperCase();
    }

    // Helper: attach ref cookie to any response before returning
    const finalize = (response: NextResponse) => {
      if (pendingRefCode) {
        response.cookies.set("ref", pendingRefCode, {
          path: "/",
          maxAge: 30 * 24 * 3600, // 30 days
          sameSite: "lax",
          httpOnly: false,
        });
      }
      return response;
    };

    // If ref param present, redirect to clean URL with cookie
    if (pendingRefCode) {
      const cleanUrl = new URL(request.url);
      cleanUrl.searchParams.delete("ref");
      return finalize(NextResponse.redirect(cleanUrl));
    }

    const segments = pathname.split("/");
    const maybeLocale = segments[1];

    // If /en/... -> 301 redirect to /... (canonical English has no prefix)
    if (maybeLocale === DEFAULT_LOCALE) {
      const newPath = "/" + segments.slice(2).join("/") || "/";
      return finalize(NextResponse.redirect(new URL(newPath, request.url), 301));
    }

    // If valid non-default locale prefix (e.g. /es/pricing) -> rewrite to /pricing, set headers
    if (isLocale(maybeLocale)) {
      const actualPath = "/" + segments.slice(2).join("/") || "/";
      const response = NextResponse.rewrite(new URL(actualPath, request.url));
      response.headers.set("x-locale", maybeLocale);
      response.cookies.set("locale", maybeLocale, {
        path: "/",
        maxAge: 365 * 24 * 3600,
        sameSite: "lax",
      });
      return finalize(response);
    }

    // No locale prefix — check cookie or detect from browser
    const cookieLocale = request.cookies.get("locale")?.value;

    if (cookieLocale && isLocale(cookieLocale) && cookieLocale !== DEFAULT_LOCALE) {
      // User has a non-English locale cookie -> redirect to prefixed URL
      return finalize(NextResponse.redirect(
        new URL(`/${cookieLocale}${pathname === "/" ? "" : pathname}`, request.url)
      ));
    }

    if (!cookieLocale) {
      // First-time visitor — detect from Accept-Language
      const detected = detectFromAcceptLanguage(
        request.headers.get("accept-language")
      );
      if (detected !== DEFAULT_LOCALE) {
        const response = NextResponse.redirect(
          new URL(`/${detected}${pathname === "/" ? "" : pathname}`, request.url)
        );
        response.cookies.set("locale", detected, {
          path: "/",
          maxAge: 365 * 24 * 3600,
          sameSite: "lax",
        });
        return finalize(response);
      }
    }

    // English (default) — no prefix, just set header for layout
    const response = NextResponse.next();
    response.headers.set("x-locale", DEFAULT_LOCALE);
    return finalize(response);
  }
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
