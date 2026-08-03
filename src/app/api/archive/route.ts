import { NextResponse } from "next/server";
import {
  archiveFacetSuggestions,
  searchArchiveSeeds,
} from "@/data/archive-cases";
import type { ArchiveCaseListItem } from "@/types/archive";

function mapSeedItems(
  university: string,
  major: string,
  q: string,
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
    fullText: row.fullText,
    performanceText: row.performanceText,
    locked: false,
  }));
}

/**
 * GET /api/archive?university=&major=&q=
 * 학교·학과 입력을 반영해 관련 사례를 많이 반환합니다.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const university = (searchParams.get("university") ?? "").trim();
  const major = (searchParams.get("major") ?? "").trim();

  const items = mapSeedItems(university, major, q);
  const facets = archiveFacetSuggestions();

  return NextResponse.json({
    items,
    meta: {
      count: items.length,
      premiumUnlocked: true,
      authenticated: false,
      source: "seed",
      query: { university, major, q },
      facets,
    },
  });
}
