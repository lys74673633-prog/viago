import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * 미들웨어 역할
 * 1) Supabase 세션 갱신 (Auth 쿠키)
 * 2) /api/ai/* 요청에 사용자 id를 헤더로 전달해 라우트에서 할당량 로직과 연계
 *
 * 실제 daily_quota 차감은 API 라우트 → lib/usage/quota.ts →
 * Supabase RPC `consume_daily_quota` (users.daily_quota) 에서 수행합니다.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, anonKey: key, isConfigured } = getSupabasePublicEnv();
  if (!isConfigured) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/api/ai")) {
    if (user) {
      response.headers.set("x-user-id", user.id);
    }
    response.headers.set("x-quota-enforced", "users.daily_quota");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
