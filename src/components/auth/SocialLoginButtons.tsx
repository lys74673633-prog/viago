"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getOAuthRedirectTo, SOCIAL_PROVIDERS } from "@/lib/auth/providers";

interface SocialLoginButtonsProps {
  next?: string;
}

export function SocialLoginButtons({ next = "/setuk" }: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startSocial(providerId: string) {
    setError(null);
    setLoading(providerId);

    const meta = SOCIAL_PROVIDERS.find((p) => p.id === providerId);
    if (!meta) {
      setLoading(null);
      return;
    }

    try {
      // 네이버: 커스텀 OAuth 라우트
      if (meta.customPath) {
        window.location.href = `${meta.customPath}?next=${encodeURIComponent(next)}`;
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setError("Supabase가 설정되지 않았습니다. /setup 에서 URL·키를 저장하세요.");
        setLoading(null);
        return;
      }

      if (!meta.supabaseProvider) {
        setError("지원하지 않는 제공자입니다.");
        setLoading(null);
        return;
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: meta.supabaseProvider,
        options: {
          redirectTo: getOAuthRedirectTo(next),
          skipBrowserRedirect: false,
          queryParams:
            meta.supabaseProvider === "google"
              ? { access_type: "offline", prompt: "consent" }
              : undefined,
        },
      });

      if (oauthError) throw oauthError;
      // 브라우저가 제공자 페이지로 이동합니다.
    } catch (err) {
      const raw = err instanceof Error ? err.message : "소셜 로그인에 실패했습니다.";
      const lower = raw.toLowerCase();
      if (lower.includes("failed to fetch") || lower.includes("fetch")) {
        setError(
          "Supabase 연결 실패(Failed to fetch). /api/auth/diagnose 결과를 확인하거나 /setup 에서 Project URL을 다시 저장하세요.",
        );
      } else if (lower.includes("provider is not enabled") || lower.includes("validation")) {
        setError(
          `${meta.label} 로그인이 Supabase에서 아직 활성화되지 않았습니다. Dashboard → Authentication → Providers 에서 ${meta.label}를 Enable 하세요.`,
        );
      } else {
        setError(raw);
      }
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative py-1 text-center text-xs text-ink-soft">
        <span className="relative z-10 bg-white/80 px-2">간편 로그인</span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/10" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SOCIAL_PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={Boolean(loading)}
            onClick={() => void startSocial(p.id)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition disabled:opacity-50 ${p.brandClass}`}
          >
            {loading === p.id ? <Loader2 className="size-4 animate-spin" /> : null}
            {p.label}로 계속
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-coral/10 px-3 py-2 text-xs leading-relaxed text-coral" role="alert">
          {error}
        </p>
      )}

      <p className="text-[11px] leading-relaxed text-ink-soft">
        Google / 카카오 / Apple은 Supabase Providers에서 활성화해야 합니다. 네이버는{" "}
        <code className="rounded bg-ink/5 px-1">NAVER_CLIENT_ID</code> ·{" "}
        <code className="rounded bg-ink/5 px-1">NAVER_CLIENT_SECRET</code> 과 Service Role이
        필요합니다. 자세한 설정은 /setup 하단 가이드를 참고하세요.
      </p>
    </div>
  );
}
