import { NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Supabase 연결 진단 — Failed to fetch 원인(DNS/키/네트워크)을 구분합니다.
 */
export async function GET() {
  const { url, anonKey, isConfigured, diagnosis } = getSupabasePublicEnv();

  if (!isConfigured) {
    return NextResponse.json({
      ok: false,
      stage: "env",
      diagnosis,
      message:
        diagnosis === "URL_INVALID"
          ? "NEXT_PUBLIC_SUPABASE_URL 형식이 올바르지 않습니다."
          : "NEXT_PUBLIC_SUPABASE_ANON_KEY 가 없거나 형식이 올바르지 않습니다. (eyJ… 또는 sb_publishable_…)",
      hint: "/setup 에서 Project URL / anon key를 다시 저장하세요.",
    });
  }

  const healthUrl = `${url}/auth/v1/health`;

  try {
    const res = await fetch(healthUrl, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });

    const bodyText = await res.text();
    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        stage: "auth_health",
        status: res.status,
        message: `Supabase Auth health 응답 오류 (${res.status})`,
        detail: bodyText.slice(0, 240),
        hint:
          res.status === 401 || res.status === 403
            ? "anon/publishable 키가 프로젝트와 일치하는지 확인하세요. JWT anon(eyJ…) 키를 권장합니다."
            : "Supabase 프로젝트 상태를 확인하세요.",
        url,
      });
    }

    return NextResponse.json({
      ok: true,
      stage: "auth_health",
      message: "Supabase Auth에 정상 연결됩니다.",
      url,
      keyType: anonKey.startsWith("eyJ")
        ? "legacy_jwt_anon"
        : anonKey.startsWith("sb_publishable_")
          ? "publishable"
          : "other",
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const dnsFail =
      /ENOTFOUND|getaddrinfo|name resolution|EAI_AGAIN|fetch failed/i.test(raw);

    return NextResponse.json({
      ok: false,
      stage: dnsFail ? "dns" : "network",
      message: dnsFail
        ? `프로젝트 URL DNS 해석 실패: ${url.replace("https://", "")}`
        : `Supabase 네트워크 연결 실패: ${raw}`,
      detail: raw,
      hint: dnsFail
        ? "Supabase Dashboard → Project Settings → API 의 Project URL을 다시 복사해 .env.local에 넣고 서버를 재시작하세요. 오타가 있으면 Failed to fetch가 납니다."
        : "방화벽/VPN/네트워크를 확인하거나, 잠시 후 다시 시도하세요.",
      url,
    });
  }
}
