export type SocialProviderId = "google" | "kakao" | "apple" | "naver";

export interface SocialProviderMeta {
  id: SocialProviderId;
  label: string;
  /** Supabase 네이티브 provider 이름. naver는 커스텀 라우트 사용 */
  supabaseProvider?: "google" | "kakao" | "apple";
  customPath?: string;
  enabledEnv?: string;
  brandClass: string;
}

export const SOCIAL_PROVIDERS: SocialProviderMeta[] = [
  {
    id: "kakao",
    label: "카카오톡",
    supabaseProvider: "kakao",
    brandClass: "bg-[#FEE500] text-[#191919] hover:bg-[#F5DC00]",
  },
  {
    id: "naver",
    label: "네이버",
    customPath: "/api/auth/oauth/naver",
    enabledEnv: "NAVER_CLIENT_ID",
    brandClass: "bg-[#03C75A] text-white hover:bg-[#02b351]",
  },
  {
    id: "google",
    label: "Google",
    supabaseProvider: "google",
    brandClass: "bg-white text-[#1E293B] ring-1 ring-ink/12 hover:bg-fog",
  },
  {
    id: "apple",
    label: "Apple",
    supabaseProvider: "apple",
    brandClass: "bg-black text-white hover:bg-neutral-900",
  },
];

export function getOAuthRedirectTo(next = "/setuk") {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
