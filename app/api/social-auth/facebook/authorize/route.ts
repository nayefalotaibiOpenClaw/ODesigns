import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getFacebookAuthUrl } from "@/lib/social-providers/meta";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const userId = searchParams.get("userId");

  if (!workspaceId || !userId) {
    return NextResponse.json(
      { error: "Missing workspaceId or userId" },
      { status: 400 }
    );
  }

  const clientId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;
  const hmacSecret = process.env.META_APP_SECRET; // shared HMAC signing key
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!clientId || !redirectUri || !hmacSecret || !appSecret) {
    return NextResponse.json(
      { error: "Facebook OAuth not configured" },
      { status: 500 }
    );
  }

  const payload = Buffer.from(
    JSON.stringify({
      userId,
      workspaceId,
      provider: "facebook",
      ts: Date.now(),
    })
  ).toString("base64");

  // Use META_APP_SECRET for HMAC so callback can verify with single key
  const signature = createHmac("sha256", hmacSecret).update(payload).digest("base64url");
  const state = `${signature}.${payload}`;

  const authUrl = getFacebookAuthUrl({ clientId, redirectUri, state });

  return NextResponse.redirect(authUrl);
}
