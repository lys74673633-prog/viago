import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 이메일 확인 / OAuth(Google·Kakao·Apple) PKCE 콜백
 * Supabase Redirect URLs에 반드시 등록:
 *   http://localhost:3000/auth/callback
 *   https://YOUR_DOMAIN/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/setuk";
  const next = nextRaw.startsWith("/") ? nextRaw : "/setuk";
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(oauthError)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          "Supabase 환경변수가 없습니다. /setup 에서 설정하세요.",
        )}`,
      );
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        error.message || "세션 교환에 실패했습니다.",
      )}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("인증 코드가 없습니다.")}`,
  );
}
