"use client";

import { useCallback, useEffect, useState } from "react";
import { Crown, Loader2, Search, University, GraduationCap } from "lucide-react";
import type { ArchiveCaseListItem } from "@/types/archive";

export function ArchiveBrowser() {
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState({ university: "", major: "", q: "" });
  const [items, setItems] = useState<ArchiveCaseListItem[]>([]);
  const [univOptions, setUnivOptions] = useState<string[]>([]);
  const [majorOptions, setMajorOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced({
        university: university.trim(),
        major: major.trim(),
        q: query.trim(),
      });
    }, 280);
    return () => window.clearTimeout(t);
  }, [university, major, query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debounced.university) params.set("university", debounced.university);
      if (debounced.major) params.set("major", debounced.major);
      if (debounced.q) params.set("q", debounced.q);
      const res = await fetch(`/api/archive?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "사례를 불러오지 못했습니다.");
      }
      setItems((data.items ?? []) as ArchiveCaseListItem[]);
      if (data.meta?.facets?.universities) {
        setUnivOptions(data.meta.facets.universities as string[]);
      }
      if (data.meta?.facets?.majors) {
        setMajorOptions(data.meta.facets.majors as string[]);
      }
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "사례를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = Boolean(debounced.university || debounced.major || debounced.q);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#059669]">
            <Crown className="size-3.5" />
            합격 사례 아카이브
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#1E293B] md:text-3xl">
            선배 합격자 생기부 벤치마킹
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            원하는 학교·학과를 입력하면 관련 합격 사례·활동 자료를 많이 보여 줍니다.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-3 rounded-2xl bg-white/80 p-4 ring-1 ring-line md:p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
              <University className="size-3.5 text-teal-deep" />
              희망 학교
            </span>
            <input
              list="archive-univ-list"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="예: 연세대학교 / 서울대 / KAIST"
              className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
            <datalist id="archive-univ-list">
              {univOptions.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </label>
          <label className="block space-y-1.5">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
              <GraduationCap className="size-3.5 text-teal-deep" />
              희망 학과
            </span>
            <input
              list="archive-major-list"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="예: 컴퓨터공학 / 경영 / 생명공학"
              className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
            <datalist id="archive-major-list">
              {majorOptions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </label>
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="추가 키워드 (데이터, 실험, 설문, 인공지능…)"
            className="w-full rounded-xl border border-ink/12 bg-white py-3 pl-10 pr-3.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
          <p>
            {filtered
              ? `‘${[debounced.university, debounced.major, debounced.q].filter(Boolean).join(" · ")}’ 관련 자료`
              : "전체 사례 (학교·학과를 넣으면 관련도가 높은 순으로 정렬)"}
          </p>
          <p className="font-semibold text-teal-deep">{items.length}건</p>
        </div>
      </div>

      {loading && (
        <p className="mt-8 inline-flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="size-4 animate-spin" />
          관련 사례를 모으는 중…
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
          <p className="font-semibold">불러오기 실패</p>
          <p className="mt-1 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="mt-8 text-sm text-ink-soft">
          검색 결과가 없습니다. 학교명·학과명을 짧게 바꿔 보세요. (예: 연세, 컴공)
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {items.map((sample) => {
          const expanded = openId === sample.id;
          const body = expanded
            ? [sample.fullText, sample.performanceText].filter(Boolean).join("\n\n")
            : sample.preview;

          return (
            <li
              key={sample.id}
              className="overflow-hidden rounded-2xl bg-white/75 ring-1 ring-line backdrop-blur-sm"
            >
              <button
                type="button"
                className="w-full p-5 text-left"
                onClick={() => setOpenId((id) => (id === sample.id ? null : sample.id))}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-teal-deep">
                  <span>{sample.university}</span>
                  <span className="text-ink/20">·</span>
                  <span>{sample.major}</span>
                  <span className="text-ink/20">·</span>
                  <span>{sample.admissionYear}</span>
                </div>
                <h2 className="mt-2 text-base font-semibold text-[#1E293B]">{sample.title}</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  {sample.subject} · {sample.tags.join(" · ")}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                  {body}
                </p>
                <p className="mt-3 text-xs text-teal-deep">
                  {expanded ? "접기" : "세특·수행평가 원문 펼치기"}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
