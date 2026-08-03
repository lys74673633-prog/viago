import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state") ?? "";
  const [state, nextEncoded] = stateParam.split(".");
  const next = nextEncoded ? decodeURIComponent(nextEncoded) : "/setuk";

  const cookieHeader = request.headers.get("cookie") ?? "";
  const savedState = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("viago_naver_oauth_state="))
    ?.split("=")[1];

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent("네이버 로그인 state 검증에 실패했습니다.")}`,
    );
  }

  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent("NAVER_CLIENT_ID/SECRET이 없습니다.")}`,
    );
  }

  const redirectUri = `${appUrl}/api/auth/oauth/naver/callback`;

  try {
    const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state,
        redirect_uri: redirectUri,
      }),
    });
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new Error(tokenJson.error_description || tokenJson.error || "토큰 교환 실패");
    }

    const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const profileJson = (await profileRes.json()) as {
      resultcode?: string;
      message?: string;
      response?: {
        id?: string;
        email?: string;
        name?: string;
        nickname?: string;
      };
    };
    if (!profileRes.ok || profileJson.resultcode !== "00" || !profileJson.response?.id) {
      throw new Error(profileJson.message || "네이버 프로필 조회 실패");
    }

    const naverId = profileJson.response.id;
    const email =
      profileJson.response.email?.trim() || `naver_${naverId}@oauth.viago.local`;
    const displayName =
      profileJson.response.name || profileJson.response.nickname || "네이버 사용자";

    const admin = createAdminClient();
    if (!admin) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY가 없어 네이버 세션을 생성할 수 없습니다. .env.local에 service_role 키를 추가하세요.",
      );
    }

    // 사용자 생성(없으면). 이미 있으면 무시하고 매직링크로 세션 발급
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        name: displayName,
        naver_id: naverId,
        provider: "naver",
      },
      app_metadata: {
        provider: "naver",
        providers: ["naver"],
        naver_id: naverId,
      },
    });
    if (
      createError &&
      !/already|exists|registered/i.test(createError.message ?? "")
    ) {
      throw createError;
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (linkError || !linkData?.properties?.hashed_token) {
      throw linkError ?? new Error("매직링크 생성 실패");
    }

    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase 서버 클라이언트를 만들 수 없습니다.");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: linkData.properties.hashed_token,
    });
    if (verifyError) throw verifyError;

    const res = NextResponse.redirect(`${appUrl}${next}`);
    res.cookies.set("viago_naver_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "네이버 로그인 실패";
    return NextResponse.redirect(
      `${appUrl}/login?error=${encodeURIComponent(message)}`,
    );
  }
}
