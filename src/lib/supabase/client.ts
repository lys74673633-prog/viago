import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;
let browserClientKey: string | null = null;

/**
 * 브라우저용 Supabase 싱글톤 클라이언트.
 * URL/키가 바뀌면 클라이언트를 재생성합니다.
 */
export function createClient() {
  const { url, anonKey, isConfigured } = getSupabasePublicEnv();
  if (!isConfigured) return null;

  const cacheKey = `${url}::${anonKey.slice(0, 12)}`;
  if (!browserClient || browserClientKey !== cacheKey) {
    browserClient = createBrowserClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
    browserClientKey = cacheKey;
  }

  return browserClient;
}
