import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  getTikTokAuthUrl,
} from "@/lib/social-providers/tiktok";
import { requireAuth } from "@/lib/auth/api-auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { searchParams } = request.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const userId = authResult.user._id;

  if (!workspaceId) {
    return NextResponse.json(
      { error: "Missing workspaceId" },
      { status: 400 }
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "TikTok OAuth not configured" },
      { status: 500 }
    );
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Embed codeVerifier in HMAC-signed state to avoid needing temporary DB storage
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      workspaceId,
      provider: "tiktok",
      ts: Date.now(),
      codeVerifier,
    })
  ).toString("base64");

  const signature = createHmac("sha256", clientSecret).update(payload).digest("base64url");
  const state = `${signature}.${payload}`;

  const authUrl = getTikTokAuthUrl({ clientKey, redirectUri, state, codeChallenge });

  return NextResponse.redirect(authUrl);
}
