"use client";

import { useCallback, useEffect, useState } from "react";
import { Crown, Loader2, Lock, Search } from "lucide-react";
import { PaywallModal } from "@/components/billing/PaywallModal";
import { useBilling } from "@/contexts/BillingContext";
import type { ArchiveCaseListItem } from "@/types/archive";

export function ArchiveBrowser() {
  const { canArchive, entitlements } = useBilling();
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [items, setItems] = useState<ArchiveCaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(query.trim()), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/archive?q=${encodeURIComponent(debouncedQ)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "사례를 불러오지 못했습니다.");
      }
      setItems((data.items ?? []) as ArchiveCaseListItem[]);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "사례를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQ]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#059669]">
            <Crown className="size-3.5" />
            프리미엄 아카이브
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#1E293B] md:text-3xl">
            선배 합격자 생기부 벤치마킹
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            익명화 합격 사례를 검색·열람합니다. 전문은 프리미엄 회원에게만 제공됩니다.
          </p>
        </div>
        {!entitlements.isPremium && (
          <button
            type="button"
            onClick={() => setPaywall(true)}
            className="rounded-xl bg-[#1E293B] px-4 py-2.5 text-sm font-semibold text-white"
          >
            프리미엄으로 잠금 해제
          </button>
        )}
      </div>

      {!canArchive && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#10B981]/25 bg-[#10B981]/10 px-4 py-3 text-sm text-[#065f46]">
          <Lock className="mt-0.5 size-4 shrink-0" />
          <p>
            무료 회원은 제목과 미리보기만 볼 수 있습니다. 세특·수행평가 원문은{" "}
            <strong>프리미엄 전용</strong>입니다.
          </p>
        </div>
      )}

      <label className="relative mt-8 block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="대학·전공·과목·키워드 검색"
          className="w-full rounded-xl border border-ink/12 bg-white py-3 pl-10 pr-3.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </label>

      {loading && (
        <p className="mt-8 inline-flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="size-4 animate-spin" />
          사례를 불러오는 중…
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
          <p className="font-semibold">불러오기 실패</p>
          <p className="mt-1 whitespace-pre-wrap">{error}</p>
          <p className="mt-2 text-xs text-ink-soft">잠시 후 다시 시도해 주세요.</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="mt-8 text-sm text-ink-soft">검색 결과가 없습니다.</p>
      )}

      <ul className="mt-6 space-y-4">
        {items.map((sample) => {
          const locked = sample.locked || !canArchive;
          const expanded = openId === sample.id && !locked;
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
                onClick={() => {
                  if (locked) {
                    setPaywall(true);
                    return;
                  }
                  setOpenId((id) => (id === sample.id ? null : sample.id));
                }}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-teal-deep">
                  <span>{sample.university}</span>
                  <span className="text-ink/20">·</span>
                  <span>{sample.major}</span>
                  <span className="text-ink/20">·</span>
                  <span>{sample.admissionYear}</span>
                  {locked && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-ink/5 px-2 py-0.5 text-[11px] text-ink-soft">
                      <Lock className="size-3" />
                      Premium
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-base font-semibold text-[#1E293B]">{sample.title}</h2>
                <p className="mt-1 text-xs text-ink-soft">
                  {sample.subject} · {sample.tags.join(" · ")}
                </p>
                <p
                  className={`mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft ${
                    locked ? "select-none blur-[2.5px]" : ""
                  }`}
                >
                  {body}
                </p>
                {locked && (
                  <p className="mt-3 text-xs font-semibold text-[#059669]">
                    프리미엄 전용 콘텐츠입니다 — 탭하여 업그레이드
                  </p>
                )}
                {!locked && (
                  <p className="mt-3 text-xs text-teal-deep">
                    {expanded ? "접기" : "세특·수행평가 원문 펼치기"}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <PaywallModal
        open={paywall}
        reason="archive"
        onClose={() => setPaywall(false)}
        onPurchased={() => void load()}
      />
    </>
  );
}
