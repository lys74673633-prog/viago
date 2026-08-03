import { NextResponse } from "next/server";
import { isDevPremiumUnlocked } from "@/lib/billing/entitlements";
import { createClient } from "@/lib/supabase/server";
import type { ArchiveCaseListItem } from "@/types/archive";

/**
 * GET /api/archive?q=
 * - 공개: 목록 + preview
 * - 전문(fullText): 로그인 + (users.is_premium 또는 DEV unlock)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error: "SUPABASE_NOT_CONFIGURED",
        message:
          "Supabase 환경변수가 없습니다. .env.local에 URL/ANON KEY를 설정한 뒤 서버를 재시작하세요.",
        items: [] as ArchiveCaseListItem[],
      },
      { status: 503 },
    );
  }

  let query = supabase
    .from("archive_cases")
    .select(
      "id, slug, university, major, admission_year, subject, title, preview, full_text, performance_text, tags, sort_order",
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: false });

  if (q) {
    // ilike 검색 (제목/대학/전공/과목)
    query = query.or(
      `title.ilike.%${q}%,university.ilike.%${q}%,major.ilike.%${q}%,subject.ilike.%${q}%`,
    );
  }

  const { data, error } = await query.limit(50);

  if (error) {
    return NextResponse.json(
      {
        error: "ARCHIVE_QUERY_FAILED",
        message:
          error.message.includes("relation") || error.code === "42P01"
            ? "archive_cases 테이블이 없습니다. Supabase SQL 에디터에서 supabase/migrations/003_archive_cases.sql 을 실행하세요."
            : error.message,
        items: [] as ArchiveCaseListItem[],
      },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPremium = isDevPremiumUnlocked();
  if (!isPremium && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_premium")
      .eq("id", user.id)
      .maybeSingle();
    isPremium = Boolean(profile?.is_premium);
  }

  const items: ArchiveCaseListItem[] = (data ?? []).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    university: row.university as string,
    major: row.major as string,
    admissionYear: row.admission_year as number,
    subject: row.subject as string,
    title: row.title as string,
    preview: row.preview as string,
    tags: (row.tags as string[]) ?? [],
    fullText: isPremium ? ((row.full_text as string) ?? null) : null,
    performanceText: isPremium ? ((row.performance_text as string) ?? null) : null,
    locked: !isPremium,
  }));

  return NextResponse.json({
    items,
    meta: {
      count: items.length,
      premiumUnlocked: isPremium,
      authenticated: Boolean(user),
    },
  });
}
