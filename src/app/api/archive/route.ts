import { NextResponse } from "next/server";
import {
  archiveFacetSuggestions,
  searchArchiveSeeds,
} from "@/data/archive-cases";
import { readPremiumCookie } from "@/lib/billing/premium-cookie";
import type { ArchiveCaseListItem } from "@/types/archive";

function mapSeedItems(
  university: string,
  major: string,
  q: string,
  isPremium: boolean,
): ArchiveCaseListItem[] {
  return searchArchiveSeeds({ university, major, q, limit: 80 }).map((row) => ({
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
 * GET /api/archive?university=&major=&q=
 * 전문은 프리미엄(결제 후 쿠키)일 때만 반환.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const university = (searchParams.get("university") ?? "").trim();
  const major = (searchParams.get("major") ?? "").trim();
  const isPremium = readPremiumCookie(request.headers.get("cookie"));

  const items = mapSeedItems(university, major, q, isPremium);
  const facets = archiveFacetSuggestions();

  return NextResponse.json({
    items,
    meta: {
      count: items.length,
      premiumUnlocked: isPremium,
      authenticated: false,
      source: "seed",
      query: { university, major, q },
      facets,
    },
  });
}
