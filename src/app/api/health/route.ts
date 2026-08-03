import { NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai/client";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function GET() {
  const supabaseEnv = getSupabasePublicEnv();
  let authReachable: boolean | null = null;
  let archiveTable: boolean | null = null;
  let detail: string | null = null;
  let stage: string | null = null;

  if (!supabaseEnv.isConfigured) {
    return NextResponse.json({
      ok: false,
      supabase: {
        configured: false,
        diagnosis: supabaseEnv.diagnosis,
        authReachable: null,
        archiveTable: null,
        detail: "env missing",
        stage: "env",
      },
      ai: { provider: getAiProvider() },
    });
  }

  try {
    const healthRes = await fetch(`${supabaseEnv.url}/auth/v1/health`, {
      headers: {
        apikey: supabaseEnv.anonKey,
        Authorization: `Bearer ${supabaseEnv.anonKey}`,
      },
      cache: "no-store",
    });
    authReachable = healthRes.ok;
    if (!healthRes.ok) {
      stage = "auth_health";
      detail = await healthRes.text();
    }
  } catch (e) {
    authReachable = false;
    stage = "dns_or_network";
    detail = e instanceof Error ? e.message : "unknown";
  }

  if (authReachable) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      if (supabase) {
        const { error: tableError } = await supabase
          .from("archive_cases")
          .select("id")
          .limit(1);
        archiveTable = !tableError;
        if (tableError) detail = tableError.message;
      }
    } catch (e) {
      archiveTable = false;
      detail = e instanceof Error ? e.message : "archive check failed";
    }
  }

  return NextResponse.json({
    ok: Boolean(supabaseEnv.isConfigured && authReachable),
    supabase: {
      configured: supabaseEnv.isConfigured,
      diagnosis: supabaseEnv.diagnosis,
      authReachable,
      archiveTable,
      detail,
      stage,
      urlHost: supabaseEnv.url.replace("https://", ""),
    },
    ai: {
      provider: getAiProvider(),
    },
  });
}
