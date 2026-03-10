import { NextRequest, NextResponse } from "next/server";
import { getFacebookAuthUrl } from "@/lib/social-providers/meta";

// Legacy route — use /api/social-auth/instagram/authorize or /api/social-auth/facebook/authorize
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

  const clientId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Meta OAuth not configured" },
      { status: 500 }
    );
  }

  const state = Buffer.from(
    JSON.stringify({
      userId,
      workspaceId,
      provider: "facebook",
      csrf: crypto.randomUUID(),
      ts: Date.now(),
    })
  ).toString("base64");

  const authUrl = getFacebookAuthUrl({ clientId, redirectUri, state });

  return NextResponse.redirect(authUrl);
}
