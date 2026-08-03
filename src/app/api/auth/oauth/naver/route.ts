import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * 네이버 OAuth 시작
 * 필요 env: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NEXT_PUBLIC_APP_URL
 * + 세션 생성을 위해 SUPABASE_SERVICE_ROLE_KEY
 */
export async function GET(request: Request) {
  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  if (!clientId) {
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent(
        "네이버 로그인이 설정되지 않았습니다. NAVER_CLIENT_ID를 .env.local에 추가하세요.",
      )}`,
    );
  }

  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/setuk";
  const state = randomBytes(16).toString("hex");

  const redirectUri = `${appUrl}/api/auth/oauth/naver/callback`;
  const authorize = new URL("https://nid.naver.com/oauth2.0/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("state", `${state}.${encodeURIComponent(next)}`);

  const res = NextResponse.redirect(authorize.toString());
  res.cookies.set("viago_naver_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return res;
}
