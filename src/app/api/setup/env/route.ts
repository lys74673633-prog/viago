import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * 로컬 개발 전용: Supabase 공개 키를 .env.local에 기록합니다.
 * 저장 전 Auth health로 DNS/키를 검증합니다.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "프로덕션에서는 사용할 수 없습니다." },
      { status: 403 },
    );
  }

  let body: { supabaseUrl?: string; supabaseAnonKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const supabaseUrl = (body.supabaseUrl ?? "").trim().replace(/\/$/, "");
  const supabaseAnonKey = (body.supabaseAnonKey ?? "").trim();

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl)) {
    return NextResponse.json(
      {
        error:
          "Project URL 형식이 올바르지 않습니다. 예: https://abcdefgh.supabase.co",
      },
      { status: 400 },
    );
  }

  const keyOk =
    (supabaseAnonKey.startsWith("eyJ") && supabaseAnonKey.length >= 80) ||
    supabaseAnonKey.startsWith("sb_publishable_") ||
    (supabaseAnonKey.startsWith("sb_") &&
      !supabaseAnonKey.startsWith("sb_secret_"));

  if (!keyOk) {
    return NextResponse.json(
      {
        error:
          "anon/publishable key가 올바르지 않습니다. eyJ…(legacy anon) 또는 sb_publishable_… 키를 붙여넣으세요.",
      },
      { status: 400 },
    );
  }

  // 저장 전 실제 연결 검증 (DNS/키)
  try {
    const healthRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: "no-store",
    });
    if (!healthRes.ok) {
      const text = await healthRes.text();
      return NextResponse.json(
        {
          error: `Supabase Auth health 실패 (${healthRes.status}). 키/프로젝트를 확인하세요. ${text.slice(0, 120)}`,
        },
        { status: 400 },
      );
    }
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const dns = /ENOTFOUND|getaddrinfo|fetch failed|EAI_AGAIN/i.test(raw);
    return NextResponse.json(
      {
        error: dns
          ? `Project URL DNS 해석 실패: ${supabaseUrl.replace("https://", "")}. 대시보드의 Project URL을 다시 복사하세요. (현재 URL에 오타가 있으면 Failed to fetch가 납니다.)`
          : `Supabase 연결 실패: ${raw}`,
      },
      { status: 400 },
    );
  }

  const envPath = path.join(process.cwd(), ".env.local");

  let existing = "";
  try {
    existing = await fs.readFile(envPath, "utf8");
  } catch {
    existing = "";
  }

  const next = upsertEnv(existing, {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    DAILY_FREE_LIMIT: process.env.DAILY_FREE_LIMIT || "5",
  });

  await fs.writeFile(envPath, next, "utf8");

  return NextResponse.json({
    ok: true,
    message:
      ".env.local 저장 및 연결 검증 완료. 개발 서버를 재시작하세요 (Ctrl+C → npm run dev).",
    url: supabaseUrl,
  });
}

function upsertEnv(source: string, values: Record<string, string>): string {
  const lines = source ? source.split(/\r?\n/) : [];
  const keys = new Set(Object.keys(values));
  const kept = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return true;
    const key = trimmed.split("=")[0];
    return !keys.has(key);
  });

  while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();

  kept.push("");
  kept.push("# --- Viago setup wizard ---");
  for (const [key, value] of Object.entries(values)) {
    kept.push(`${key}=${value}`);
  }
  kept.push("");
  return kept.join("\n");
}
