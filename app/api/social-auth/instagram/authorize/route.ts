import { NextRequest, NextResponse } from "next/server";
import { getInstagramAuthUrl } from "@/lib/social-providers/meta";

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
      { error: "Instagram OAuth not configured" },
      { status: 500 }
    );
  }

  const state = Buffer.from(
    JSON.stringify({
      userId,
      workspaceId,
      provider: "instagram",
      csrf: crypto.randomUUID(),
      ts: Date.now(),
    })
  ).toString("base64");

  const authUrl = getInstagramAuthUrl({ clientId, redirectUri, state });

  return NextResponse.redirect(authUrl);
}
