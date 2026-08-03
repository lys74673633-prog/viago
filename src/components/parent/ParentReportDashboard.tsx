"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  BookOpen,
  CircleHelp,
  FileDown,
  Loader2,
  LineChart,
  Sparkles,
  Target,
  University,
} from "lucide-react";
import { PaywallModal } from "@/components/billing/PaywallModal";
import { ExportButtons } from "@/components/export/ExportButtons";
import { GradeGapChart } from "@/components/parent/GradeGapChart";
import { GradeScaleGuide } from "@/components/parent/GradeScaleGuide";
import { useBilling } from "@/contexts/BillingContext";
import type { ExportDocumentInput } from "@/lib/export/document";
import type { GradeScale } from "@/lib/parent/grade-scale";
import {
  buildParentReport,
  type ParentReportResult,
} from "@/lib/parent/report-engine";

const inputClass =
  "w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

export function ParentReportDashboard() {
  const { canParentReport, spendParentReport, entitlements } = useBilling();
  const [loading, setLoading] = useState(false);
  const [paywall, setPaywall] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("고2");
  const [gradeScale, setGradeScale] = useState<GradeScale>("5");
  const [guideOpen, setGuideOpen] = useState<GradeScale | null>(null);
  const [mockScore, setMockScore] = useState("");
  const [targetUniv, setTargetUniv] = useState("");
  const [targetMajor, setTargetMajor] = useState("");
  const [recordNotes, setRecordNotes] = useState("");
  const [report, setReport] = useState<ParentReportResult | null>(null);

  const exportDoc: ExportDocumentInput | null = useMemo(() => {
    if (!report) return null;
    return {
      title: `${studentName || "학생"} 대입 가능성 리포트`,
      subtitle: `${grade} · ${report.gradeGap.scaleLabel} · 목표 ${targetUniv || "미정"} ${targetMajor} · Viago 학부모 진단`,
      sections: [
        { heading: "한눈에 보는 요약", body: report.summary },
        {
          heading: "등급 갭 진단",
          body: [
            `체계: ${report.gradeGap.scaleLabel}`,
            `현재 ${report.gradeGap.currentGrade} / 목표 추정 ${report.gradeGap.targetGradeNeeded}`,
            `필요 상승 ${report.gradeGap.gap} · 현실 추정 ${report.gradeGap.feasibleGap}`,
            `판단: ${report.gradeGap.feasibility}`,
            report.gradeGap.feasibilityDetail,
          ].join("\n"),
        },
        {
          heading: "현재 등급대 지원 가능(참고)",
          body: report.reachable
            .map((r) => `• [${r.fit}] ${r.university} ${r.major} — ${r.note}`)
            .join("\n"),
        },
        {
          heading: "도전 지원군",
          body:
            report.stretchTargets.length > 0
              ? report.stretchTargets
                  .map((r) => `• ${r.university} ${r.major} — ${r.note}`)
                  .join("\n")
              : "해당 구간 추가 도전군 없음(또는 이미 상위권)",
        },
        {
          heading: "목표 맞춤 활동 로드맵",
          body: report.activities
            .map(
              (a, i) =>
                `${i + 1}. ${a.title}\n왜: ${a.why}\n단계:\n${a.steps.map((s) => `  - ${s}`).join("\n")}\n교과: ${a.subjects.join(", ")}\n증거: ${a.evidenceTip}`,
            )
            .join("\n\n"),
        },
        {
          heading: "선배 활동 사례(익명)",
          body: report.examples
            .map(
              (e) =>
                `• ${e.university} ${e.major} — ${e.title}\n  ${e.preview}\n  배움: ${e.takeaway}`,
            )
            .join("\n\n"),
        },
        { heading: "강점", body: report.strengths.map((s) => `• ${s}`).join("\n") },
        { heading: "보완 포인트", body: report.risks.map((s) => `• ${s}`).join("\n") },
        { heading: "이번 학기 액션", body: report.nextActions.map((s) => `• ${s}`).join("\n") },
        { heading: "종합 밴드", body: report.fitBand },
      ],
      footerNote:
        "본 리포트는 교육 참고용 추정이며, 실제 입시 결과는 전형·경쟁률·대학 평가에 따라 달라질 수 있습니다.",
    };
  }, [report, studentName, grade, targetUniv, targetMajor]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canParentReport) {
      setPaywall(true);
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      const ok = spendParentReport();
      if (!ok) {
        setPaywall(true);
        setLoading(false);
        return;
      }
      setReport(
        buildParentReport({
          studentName,
          grade,
          mockScore: Number(mockScore) || 0,
          gradeScale,
          targetUniv,
          targetMajor,
          recordNotes,
        }),
      );
      setLoading(false);
    }, 650);
  }

  return (
    <>
      <div>
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-deep">
          <LineChart className="size-3.5" />
          학부모 대시보드
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#1E293B] md:text-3xl">
          입시 진단 리포트
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          등급 갭 그래프, 현재 지원 가능 대학·학과, 목표 맞춤 활동, 선배 사례까지 한 번에
          정리합니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4 rounded-2xl bg-white/75 p-5 ring-1 ring-line md:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="학생 이름(가명 가능)">
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className={inputClass}
              placeholder="예: 김OO"
              required
            />
          </Field>
          <Field label="학년">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={inputClass}
            >
              <option>고1</option>
              <option>고2</option>
              <option>고3</option>
            </select>
          </Field>
          <div className="space-y-2 sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">최근 모의고사 평균 등급</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setGuideOpen("5")}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#10B981]/30 bg-[#ecfdf5] px-2.5 py-1.5 text-[11px] font-semibold text-[#065f46] hover:bg-[#d1fae5]"
                >
                  <CircleHelp className="size-3.5" />
                  5등급제 기준 자료 안내
                </button>
                <button
                  type="button"
                  onClick={() => setGuideOpen("9")}
                  className="inline-flex items-center gap-1 rounded-lg border border-ink/12 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink hover:bg-fog"
                >
                  <CircleHelp className="size-3.5" />
                  9등급제 기준 자료 안내
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,140px)_1fr]">
              <select
                value={gradeScale}
                onChange={(e) => setGradeScale(e.target.value as GradeScale)}
                className={inputClass}
                aria-label="등급 체계"
              >
                <option value="5">5등급제 (2009년생~)</option>
                <option value="9">9등급제 (기존)</option>
              </select>
              <input
                value={mockScore}
                onChange={(e) => setMockScore(e.target.value)}
                className={inputClass}
                placeholder={gradeScale === "5" ? "예: 2.0 (1~5)" : "예: 2.4 (1~9)"}
                required
                inputMode="decimal"
              />
            </div>
            <p className="text-[11px] text-ink-soft">
              2009년생부터는 5등급제 기준으로 입력하는 것을 권장합니다. 안내 버튼에서 환산표를 확인할
              수 있어요.
            </p>
          </div>
          <Field label="목표 대학·전형">
            <input
              value={targetUniv}
              onChange={(e) => setTargetUniv(e.target.value)}
              className={inputClass}
              placeholder="예: 연세대 학종"
              required
            />
          </Field>
          <Field label="희망 학과·계열">
            <input
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
              className={inputClass}
              placeholder="예: 컴퓨터공학 / 경영 / 생명공학"
              required
            />
          </Field>
        </div>
        <Field label="생기부·활동 메모">
          <textarea
            value={recordNotes}
            onChange={(e) => setRecordNotes(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="예: 생명과학 탐구 우수, 정보 동아리 부장, 봉사 20시간…"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
          진단 리포트 생성
          {!entitlements.isPremium && (
            <span className="font-normal opacity-80">
              · 잔여 {entitlements.parentReportCredits}회
            </span>
          )}
        </button>
      </form>

      {report && (
        <section className="mt-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">리포트 미리보기</h2>
            <ExportButtons document={exportDoc} />
          </div>

          <article className="space-y-5 rounded-2xl bg-white/80 p-5 ring-1 ring-line md:p-6">
            <div>
              <p className="text-sm font-semibold text-[#059669]">{report.fitBand}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink">{report.summary}</p>
            </div>

            <GradeGapChart analysis={report.gradeGap} />

            <div className="grid gap-4 lg:grid-cols-2">
              <UnivBlock
                icon={<University className="size-4" />}
                title="현재 등급대에서 갈 수 있는 대학·학과 (참고)"
                items={report.reachable}
              />
              <UnivBlock
                icon={<Target className="size-4" />}
                title="도전으로 남겨둘 상위 지원군"
                items={report.stretchTargets}
                empty="추가 도전군이 없거나, 이미 상위권 구간에 있습니다."
              />
            </div>

            <div>
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Sparkles className="size-4 text-[#059669]" />
                목표 학교·학과를 위한 활동 로드맵
              </h3>
              <ul className="mt-3 space-y-4">
                {report.activities.map((a) => (
                  <li
                    key={a.title}
                    className="rounded-xl border border-ink/8 bg-fog/40 px-4 py-3"
                  >
                    <p className="font-semibold text-[#1E293B]">{a.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{a.why}</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-ink">
                      {a.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                    <p className="mt-2 text-[11px] text-teal-deep">
                      연계 교과: {a.subjects.join(" · ")}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-soft">증거 팁: {a.evidenceTip}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <BookOpen className="size-4 text-[#059669]" />
                다른 학생이 실제로 한 활동 예시
              </h3>
              <p className="mt-1 text-xs text-ink-soft">
                Viago 익명 합격사례에서 추출한 벤치마킹 자료입니다.{" "}
                <Link href="/archive" className="font-semibold underline">
                  아카이브에서 더 보기
                </Link>
              </p>
              <ul className="mt-3 space-y-3">
                {report.examples.map((ex) => (
                  <li key={ex.title} className="rounded-xl bg-white px-4 py-3 ring-1 ring-line">
                    <p className="text-[11px] font-semibold text-teal-deep">
                      {ex.university} · {ex.major} · {ex.sourceLabel}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#1E293B]">{ex.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{ex.preview}</p>
                    <p className="mt-2 text-[11px] text-ink">
                      <span className="font-semibold">배울 점:</span> {ex.takeaway}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">{ex.tags.join(" · ")}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <ListBlock title="강점" items={report.strengths} />
              <ListBlock title="보완 포인트" items={report.risks} />
              <ListBlock title="다음 행동" items={report.nextActions} />
            </div>
          </article>
        </section>
      )}

      <GradeScaleGuide open={guideOpen} onClose={() => setGuideOpen(null)} />
      <PaywallModal
        open={paywall}
        reason="parent_report"
        onClose={() => setPaywall(false)}
      />
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink-soft">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function UnivBlock({
  icon,
  title,
  items,
  empty,
}: {
  icon: ReactNode;
  title: string;
  items: { university: string; major: string; fit: string; note: string }[];
  empty?: string;
}) {
  return (
    <div className="rounded-xl border border-ink/8 bg-fog/30 px-4 py-3">
      <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
        {icon}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-ink-soft">{empty ?? "해당 항목 없음"}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((r) => (
            <li key={`${r.university}-${r.major}`}>
              <p className="text-sm font-semibold text-[#1E293B]">
                <span className="mr-1.5 rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-bold text-ink-soft">
                  {r.fit}
                </span>
                {r.university}
              </p>
              <p className="text-xs text-teal-deep">{r.major}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">{r.note}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
