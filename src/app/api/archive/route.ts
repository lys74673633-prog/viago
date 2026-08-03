import { NextResponse } from "next/server";
import { searchArchiveSeeds } from "@/data/archive-cases";
import { isDevPremiumUnlocked } from "@/lib/billing/entitlements";
import { readPremiumCookie } from "@/lib/billing/premium-cookie";
import { createClient } from "@/lib/supabase/server";
import type { ArchiveCaseListItem } from "@/types/archive";

function mapSeedItems(q: string, isPremium: boolean): ArchiveCaseListItem[] {
  return searchArchiveSeeds(q).map((row) => ({
    id: row.id,
    slug: row.slug,
    university: row.university,
    major: row.major,
    admissionYear: row.admissionYear,
    subject: row.subject,
    title: row.title,
    preview: row.preview,
    tags: row.tags,
    fullText: isPremium ? row.fullText : null,
    performanceText: isPremium ? row.performanceText : null,
    locked: !isPremium,
  }));
}

/**
 * GET /api/archive?q=
 * - Supabase archive_cases 우선
 * - 없거나 실패 시 내장 시드로 폴백 (프로덕션에서도 목록 보장)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const cookiePremium = readPremiumCookie(request.headers.get("cookie"));

  const supabase = await createClient();
  let isPremium = isDevPremiumUnlocked() || cookiePremium;

  if (!supabase) {
    const items = mapSeedItems(q, isPremium);
    return NextResponse.json({
      items,
      meta: {
        count: items.length,
        premiumUnlocked: isPremium,
        authenticated: false,
        source: "seed",
      },
    });
  }

  let query = supabase
    .from("archive_cases")
    .select(
      "id, slug, university, major, admission_year, subject, title, preview, full_text, performance_text, tags, sort_order",
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: false });

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,university.ilike.%${q}%,major.ilike.%${q}%,subject.ilike.%${q}%`,
    );
  }

  const { data, error } = await query.limit(50);

  if (error || !data?.length) {
    const items = mapSeedItems(q, isPremium);
    return NextResponse.json({
      items,
      meta: {
        count: items.length,
        premiumUnlocked: isPremium,
        authenticated: false,
        source: "seed",
        fallbackReason: error?.message ?? "empty",
      },
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isPremium && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_premium")
      .eq("id", user.id)
      .maybeSingle();
    isPremium = Boolean(profile?.is_premium) || cookiePremium;
  }

  const items: ArchiveCaseListItem[] = data.map((row) => ({
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
      source: "supabase",
    },
  });
}
