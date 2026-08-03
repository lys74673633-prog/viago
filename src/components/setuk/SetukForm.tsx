"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { SetukResults } from "@/components/setuk/SetukResults";
import { UsageBadge } from "@/components/setuk/UsageBadge";
import { PaywallModal } from "@/components/billing/PaywallModal";
import { useQuota } from "@/hooks/useQuota";
import type { SetukInput, SetukVersion } from "@/types";

const SUBJECTS = [
  "국어",
  "수학",
  "영어",
  "한국사",
  "통합사회",
  "통합과학",
  "물리학",
  "화학",
  "생명과학",
  "지구과학",
  "사회·문화",
  "경제",
  "정치와 법",
  "윤리와 사상",
  "정보",
  "기술·가정",
  "음악",
  "미술",
  "체육",
  "기타",
] as const;

export function SetukGenerator() {
  const {
    usage,
    premiumOpen,
    setPremiumOpen,
    applyQuotaFromResponse,
    handleQuotaError,
  } = useQuota();

  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [roleAndReflection, setRoleAndReflection] = useState("");
  const [versions, setVersions] = useState<SetukVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (usage.remaining <= 0) {
      setPremiumOpen(true);
      return;
    }

    const input: SetukInput = {
      subject: subject.trim(),
      keywords: keywords.trim(),
      roleAndReflection: roleAndReflection.trim(),
    };

    if (!input.subject || !input.keywords || !input.roleAndReflection) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/setuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (handleQuotaError(res.status, data)) return;
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "생성에 실패했습니다.");
      }

      setVersions(data.versions as SetukVersion[]);
      applyQuotaFromResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white/70 p-5 ring-1 ring-line backdrop-blur-sm md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
                세특 AI 생성기
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                활동 키워드를 넣으면 3가지 역량 버전으로 정리합니다.
              </p>
            </div>
            <UsageBadge status={usage} />
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">과목</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
            >
              <option value="" disabled>
                과목을 선택하세요
              </option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">활동 내용 키워드</span>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
              rows={3}
              placeholder="예: 미세플라스틱 조사, 실험 설계, 데이터 시각화, 발표"
              className="w-full resize-y rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">나의 역할 및 느낀 점</span>
            <textarea
              value={roleAndReflection}
              onChange={(e) => setRoleAndReflection(e.target.value)}
              required
              rows={5}
              placeholder="예: 조장으로 실험 일정을 조율했고, 그래프 해석에서 오차를 줄이는 방법을 배웠습니다."
              className="w-full resize-y rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || usage.remaining <= 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                세특 문장 생성 중…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                3가지 버전 생성하기
              </>
            )}
          </button>
        </form>

        <section aria-label="생성 결과">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">생성 결과</h2>
            {versions.length > 0 && (
              <p className="text-xs text-ink-soft">
                복사 후 생기부 양식에 맞게 다듬어 주세요
              </p>
            )}
          </div>
          <SetukResults
            versions={versions}
            onVersionsChange={setVersions}
            loading={loading}
          />
        </section>
      </div>

      <PaywallModal
        open={premiumOpen}
        reason="quota"
        onClose={() => setPremiumOpen(false)}
      />
    </>
  );
}
