"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { FileDown, Loader2, LineChart } from "lucide-react";
import { PaywallModal } from "@/components/billing/PaywallModal";
import { ExportButtons } from "@/components/export/ExportButtons";
import { useBilling } from "@/contexts/BillingContext";
import type { ExportDocumentInput } from "@/lib/export/document";

const inputClass =
  "w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

interface ReportResult {
  summary: string;
  strengths: string[];
  risks: string[];
  nextActions: string[];
  fitBand: string;
}

export function ParentReportDashboard() {
  const { canParentReport, spendParentReport, entitlements } = useBilling();
  const [paywall, setPaywall] = useState(false);
  const [loading, setLoading] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("고2");
  const [mockScore, setMockScore] = useState("");
  const [targetUniv, setTargetUniv] = useState("");
  const [recordNotes, setRecordNotes] = useState("");
  const [report, setReport] = useState<ReportResult | null>(null);

  const exportDoc: ExportDocumentInput | null = useMemo(() => {
    if (!report) return null;
    return {
      title: `${studentName || "학생"} 대입 가능성 리포트`,
      subtitle: `${grade} · 목표 ${targetUniv || "미정"} · Viago 학부모 진단`,
      sections: [
        { heading: "한눈에 보는 요약", body: report.summary },
        { heading: "강점", body: report.strengths.map((s) => `• ${s}`).join("\n") },
        { heading: "보완 포인트", body: report.risks.map((s) => `• ${s}`).join("\n") },
        { heading: "이번 학기 액션", body: report.nextActions.map((s) => `• ${s}`).join("\n") },
        { heading: "종합 밴드", body: report.fitBand },
      ],
      footerNote: "본 리포트는 참고용이며, 실제 입시 결과는 전형·경쟁률에 따라 달라질 수 있습니다.",
    };
  }, [report, studentName, grade, targetUniv]);

  function buildReport(): ReportResult {
    const score = Number(mockScore) || 0;
    const band =
      score >= 1 && score <= 2
        ? "상위권 안정~도전 가능 구간"
        : score <= 4
          ? "적정·소신 병행 구간"
          : "상향 지원 전 내신·세특 보강이 유리한 구간";

    return {
      summary: `${studentName || "학생"} 학생의 모의고사(추정 등급 ${mockScore || "-"})와 생기부 메모를 종합하면, ${targetUniv || "목표 대학"} 기준으로 ${band}로 보입니다. 교과 세특의 구체성과 활동의 연결고리를 강화하는 것이 핵심입니다.`,
      strengths: [
        recordNotes.trim()
          ? "제공하신 생기부 메모에서 활동 키워드가 확인됩니다. 이를 과목별 역량 문장으로 확장할 여지가 큽니다."
          : "기본 학업 데이터가 입력되어 진단 프레임을 구성할 수 있습니다.",
        "학부모가 이해하기 쉬운 ‘강점-리스크-다음 행동’ 구조로 정리 가능합니다.",
        grade === "고3"
          ? "고3 시점에는 원서 전략과 세특 마감을 병렬로 관리하는 것이 중요합니다."
          : "아직 생기부를 쌓을 시간이 있어, 탐구의 깊이를 키우기 좋은 시기입니다.",
      ],
      risks: [
        !mockScore
          ? "모의고사 등급 입력이 없어 정량 신호가 제한적입니다."
          : "단일 모의고사만으로는 추세 파악이 부족할 수 있습니다.",
        "세특 문장이 추상적이면 합격 사례 대비 차별화가 약해질 수 있습니다.",
        "목표 대학 전형(학종/교과/정시) 미구분 시 우선순위가 흐려질 수 있습니다.",
      ],
      nextActions: [
        "이번 달: 과목별 세특 키워드 3개씩 정리 (Viago 세특 생성기 활용)",
        "수행평가 1건을 보고서+발표 대본까지 완성해 포트폴리오화",
        "합격생 아카이브에서 동일 계열 2~3사례 벤치마킹 후 활동 공백 메우기",
      ],
      fitBand: band,
    };
  }

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
      setReport(buildReport());
      setLoading(false);
    }, 700);
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
          모의고사와 생기부 메모를 넣으면, 학부모가 읽기 쉬운 요약 리포트를 만들어 PDF로 받을 수
          있어요.
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
          <Field label="최근 모의고사 평균 등급">
            <input
              value={mockScore}
              onChange={(e) => setMockScore(e.target.value)}
              className={inputClass}
              placeholder="예: 2.4"
              required
            />
          </Field>
          <Field label="목표 대학·전형">
            <input
              value={targetUniv}
              onChange={(e) => setTargetUniv(e.target.value)}
              className={inputClass}
              placeholder="예: 서울대 학종 / 연세대 교과"
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
        <section className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">리포트 미리보기</h2>
            <ExportButtons document={exportDoc} />
          </div>

          <article className="rounded-2xl bg-white/80 p-5 ring-1 ring-line md:p-6">
            <p className="text-sm font-semibold text-[#059669]">{report.fitBand}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{report.summary}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ListBlock title="강점" items={report.strengths} />
              <ListBlock title="보완 포인트" items={report.risks} />
              <ListBlock title="다음 행동" items={report.nextActions} />
            </div>
          </article>
        </section>
      )}

      <PaywallModal open={paywall} reason="parent_report" onClose={() => setPaywall(false)} />
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
