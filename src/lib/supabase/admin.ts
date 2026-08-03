import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceEnv } from "@/lib/supabase/env";

/** 서버 전용 Service Role 클라이언트 */
export function createAdminClient() {
  const { url, serviceKey, isConfigured } = getSupabaseServiceEnv();
  if (!isConfigured) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
