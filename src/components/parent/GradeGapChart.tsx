"use client";

import type { GradeGapAnalysis } from "@/lib/parent/report-engine";

interface GradeGapChartProps {
  analysis: GradeGapAnalysis;
}

/** 등급은 숫자가 작을수록 상위 — Y축을 뒤집어 시각적으로 ‘상승’이 위로 가게 표현 */
export function GradeGapChart({ analysis }: GradeGapChartProps) {
  const { chart, feasibility, gap, feasibleGap, currentGrade, targetGradeNeeded } = analysis;
  const w = 520;
  const h = 220;
  const pad = { t: 24, r: 16, b: 36, l: 40 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const allY = [...chart.currentLine, ...chart.targetLine, ...chart.realisticLine];
  const yMin = Math.max(1, Math.floor(Math.min(...allY) - 0.3));
  const yMax = Math.min(9, Math.ceil(Math.max(...allY) + 0.5));

  const xAt = (i: number) =>
    pad.l + (chart.labels.length <= 1 ? 0 : (i / (chart.labels.length - 1)) * innerW);
  const yAt = (grade: number) => pad.t + ((grade - yMin) / (yMax - yMin)) * innerH;

  const toPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`).join(" ");

  const feasColor =
    feasibility === "적정"
      ? "#059669"
      : feasibility === "도전적이나 가능"
        ? "#d97706"
        : "#e11d48";

  return (
    <div className="rounded-2xl bg-white/90 p-4 ring-1 ring-line md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">등급 갭 · 상승 필요량</h3>
          <p className="mt-1 text-xs text-ink-soft">
            현재 {currentGrade} → 목표 추정 {targetGradeNeeded} (필요 상승 {gap}등급) · 현실
            추정 {feasibleGap}등급 / 남은 기간
          </p>
        </div>
        <span
          className="rounded-md px-2 py-1 text-[11px] font-semibold text-white"
          style={{ backgroundColor: feasColor }}
        >
          {feasibility}
        </span>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full" role="img" aria-label="등급 추이 그래프">
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.t + t * innerH;
          const grade = yMin + t * (yMax - yMin);
          return (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#e2e8f0" strokeWidth={1} />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#64748b">
                {grade.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* 현실 가능 밴드 (현재~현실선 사이) */}
        <path
          d={`${toPath(chart.currentLine)} ${[...chart.realisticLine]
            .reverse()
            .map((v, i) => `L ${xAt(chart.realisticLine.length - 1 - i)} ${yAt(v)}`)
            .join(" ")} Z`}
          fill="#10B981"
          opacity={0.08}
        />

        <path d={toPath(chart.currentLine)} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" />
        <path d={toPath(chart.targetLine)} fill="none" stroke="#e11d48" strokeWidth={2} />
        <path d={toPath(chart.realisticLine)} fill="none" stroke="#059669" strokeWidth={2.5} />

        {chart.labels.map((label, i) => (
          <text
            key={label}
            x={xAt(i)}
            y={h - 12}
            textAnchor="middle"
            fontSize={10}
            fill="#64748b"
          >
            {label}
          </text>
        ))}
      </svg>

      <ul className="mt-2 flex flex-wrap gap-4 text-[11px] text-ink-soft">
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-slate-400" style={{ borderTop: "2px dashed #94a3b8" }} />
          현재 유지
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-[#059669]" />
          현실적 개선 경로
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-[#e11d48]" />
          목표 추정 등급
        </li>
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft">{analysis.feasibilityDetail}</p>
      <p className="mt-2 text-[10px] text-slate-400">
        ※ 등급·대학 매칭은 교육 참고용 추정이며 실제 합격선을 보장하지 않습니다.
      </p>
    </div>
  );
}
