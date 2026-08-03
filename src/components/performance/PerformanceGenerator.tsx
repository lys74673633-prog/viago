"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  BookMarked,
  Check,
  Copy,
  FileText,
  Loader2,
  Mic,
  Sparkles,
} from "lucide-react";
import { PaywallModal } from "@/components/billing/PaywallModal";
import { CleanButton } from "@/components/clean/CleanButton";
import { ExportButtons } from "@/components/export/ExportButtons";
import { UsageBadge } from "@/components/setuk/UsageBadge";
import { useQuota } from "@/hooks/useQuota";
import type { ExportDocumentInput } from "@/lib/export/document";
import type {
  PerformanceExpandResult,
  RecommendedTopic,
} from "@/types";

type Step = "input" | "topics" | "result";

export function PerformanceGenerator() {
  const {
    usage,
    premiumOpen,
    setPremiumOpen,
    applyQuotaFromResponse,
    handleQuotaError,
  } = useQuota();

  const [unit, setUnit] = useState("");
  const [keywords, setKeywords] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [topics, setTopics] = useState<RecommendedTopic[]>([]);
  const [selected, setSelected] = useState<RecommendedTopic | null>(null);
  const [result, setResult] = useState<PerformanceExpandResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportDoc: ExportDocumentInput | null = useMemo(() => {
    if (!result) return null;
    return {
      title: result.topicTitle,
      subtitle: `${unit} · ${keywords}`,
      sections: [
        { heading: "보고서 초안", body: result.reportDraft },
        { heading: "3분 발표 대본", body: result.speechScript },
        {
          heading: "APA 참고문헌",
          body: result.references.map((r) => r.citation).join("\n"),
        },
      ],
    };
  }, [result, unit, keywords]);

  async function requestTopics(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (usage.remaining <= 0) {
      setPremiumOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "topics", unit, keywords }),
      });
      const data = await res.json();
      if (handleQuotaError(res.status, data)) return;
      if (!res.ok) throw new Error(data.message ?? data.error ?? "주제 추천에 실패했습니다.");

      setTopics(data.topics as RecommendedTopic[]);
      setSelected(null);
      setResult(null);
      setStep("topics");
      applyQuotaFromResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function expandTopic(topic: RecommendedTopic) {
    setError(null);
    setSelected(topic);

    if (usage.remaining <= 0) {
      setPremiumOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "expand",
          unit,
          keywords,
          selectedTopic: topic.title,
        }),
      });
      const data = await res.json();
      if (handleQuotaError(res.status, data)) return;
      if (!res.ok) throw new Error(data.message ?? data.error ?? "초안 생성에 실패했습니다.");

      setResult(data.result as PerformanceExpandResult);
      setStep("result");
      applyQuotaFromResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
              수행평가 올인원 AI
            </h1>
            <p className="mt-1 text-sm text-ink-soft md:text-base">
              주제 추천 → 보고서 초안 → 3분 대본 → APA 참고문헌까지 한 번에.
            </p>
          </div>
          <UsageBadge status={usage} />
        </div>

        <form
          onSubmit={requestTopics}
          className="grid gap-4 rounded-2xl bg-white/70 p-5 ring-1 ring-line backdrop-blur-sm md:grid-cols-2 md:p-6"
        >
          <label className="block space-y-1.5 md:col-span-1">
            <span className="text-sm font-semibold text-ink">교과 단원</span>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              placeholder="예: 생명과학Ⅰ - 세포의 생명 활동"
              className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </label>
          <label className="block space-y-1.5 md:col-span-1">
            <span className="text-sm font-semibold text-ink">궁금한 주제 키워드</span>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
              placeholder="예: 미토콘드리아, 노화, 운동"
              className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </label>

          {error && (
            <p
              className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral md:col-span-2"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading || usage.remaining <= 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading && step === "input" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  추천 주제 생성 중…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  트렌디 주제 5개 추천받기
                </>
              )}
            </button>
          </div>
        </form>

        {(step === "topics" || step === "result") && (
          <section aria-label="추천 주제">
            <h2 className="text-lg font-semibold text-ink">추천 주제 5개</h2>
            <p className="mt-1 text-sm text-ink-soft">
              주제를 고르면 보고서 초안·발표 대본·APA 참고문헌을 생성합니다. (1회 차감)
            </p>
            <ul className="mt-4 grid gap-3">
              {topics.map((topic) => {
                const active = selected?.id === topic.id;
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void expandTopic(topic)}
                      className={`w-full rounded-xl p-4 text-left ring-1 transition ${
                        active
                          ? "bg-mint/50 ring-teal/40"
                          : "bg-white/70 ring-line hover:ring-teal/30"
                      }`}
                    >
                      <p className="font-semibold text-ink">{topic.title}</p>
                      <p className="mt-1 text-sm text-ink-soft">{topic.hook}</p>
                      <p className="mt-1 text-xs text-teal-deep">{topic.angle}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
            {loading && step === "topics" && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft">
                <Loader2 className="size-4 animate-spin" />
                선택한 주제로 초안을 작성하는 중…
              </p>
            )}
          </section>
        )}

        {result && (
          <section className="space-y-4" aria-label="생성 결과">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">{result.topicTitle}</h2>
              <ExportButtons document={exportDoc} />
            </div>

            <ResultBlock
              icon={FileText}
              title="보고서 초안"
              content={result.reportDraft}
              onCleaned={(cleaned) =>
                setResult((r) => (r ? { ...r, reportDraft: cleaned } : r))
              }
            />
            <ResultBlock
              icon={Mic}
              title="3분 발표 대본"
              content={result.speechScript}
              onCleaned={(cleaned) =>
                setResult((r) => (r ? { ...r, speechScript: cleaned } : r))
              }
            />
            <div className="rounded-xl bg-white/70 p-5 ring-1 ring-line">
              <div className="flex items-center gap-2">
                <BookMarked className="size-4 text-teal" aria-hidden />
                <h3 className="font-semibold text-ink">APA 참고문헌</h3>
              </div>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink">
                {result.references.map((ref) => (
                  <li key={ref.id}>
                    <span className="text-ink">{ref.citation}</span>
                    <span className="ml-2 text-xs text-ink-soft">({ref.sourceType})</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </div>

      <PaywallModal
        open={premiumOpen}
        reason="quota"
        onClose={() => setPremiumOpen(false)}
      />
    </>
  );
}

function ResultBlock({
  icon: Icon,
  title,
  content,
  onCleaned,
}: {
  icon: typeof FileText;
  title: string;
  content: string;
  onCleaned: (cleaned: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-xl bg-white/70 p-5 ring-1 ring-line">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-teal" aria-hidden />
          <h3 className="font-semibold text-ink">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-teal" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              복사
            </>
          )}
        </button>
      </div>
      <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
        {content}
      </pre>
      <div className="mt-4">
        <CleanButton text={content} onCleaned={onCleaned} />
      </div>
    </div>
  );
}
