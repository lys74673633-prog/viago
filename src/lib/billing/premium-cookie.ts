export const PREMIUM_COOKIE = "viago_premium";

/** 클라이언트: 프리미엄 여부를 API가 읽을 수 있게 쿠키에 동기화 */
export function syncPremiumCookie(isPremium: boolean) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 40; // 40일
  document.cookie = `${PREMIUM_COOKIE}=${isPremium ? "1" : "0"}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function readPremiumCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(`${PREMIUM_COOKIE}=`));
  return hit?.split("=")[1] === "1";
}
