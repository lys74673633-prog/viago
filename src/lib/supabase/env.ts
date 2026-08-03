/** 플레이스홀더·공백 값을 걸러 실제 설정 여부 판별 */
export function getSupabasePublicEnv() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  const urlOk =
    Boolean(url) &&
    !url.includes("your_supabase") &&
    (/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) ||
      url.startsWith("http://localhost"));

  // legacy JWT(eyJ...) 또는 신규 publishable(sb_...) 키 모두 허용
  const keyOk =
    Boolean(anonKey) &&
    !anonKey.includes("your_supabase") &&
    (anonKey.startsWith("eyJ") ||
      anonKey.startsWith("sb_publishable_") ||
      anonKey.startsWith("sb_"));

  return {
    url: urlOk ? url : "",
    anonKey: keyOk ? anonKey : "",
    isConfigured: urlOk && keyOk,
    diagnosis: !urlOk
      ? "URL_INVALID"
      : !keyOk
        ? "ANON_KEY_INVALID"
        : ("OK" as const),
  };
}

export function getSupabaseServiceEnv() {
  const { url, isConfigured } = getSupabasePublicEnv();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  const serviceOk =
    Boolean(serviceKey) &&
    (serviceKey.startsWith("eyJ") || serviceKey.startsWith("sb_secret_"));
  return {
    url,
    serviceKey: serviceOk ? serviceKey : "",
    isConfigured: isConfigured && serviceOk,
  };
}
