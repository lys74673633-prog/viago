"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { GUIDE_5, GUIDE_9, type GradeScale } from "@/lib/parent/grade-scale";

interface GradeScaleGuideProps {
  open: GradeScale | null;
  onClose: () => void;
}

export function GradeScaleGuide({ open, onClose }: GradeScaleGuideProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const guide = open === "5" ? GUIDE_5 : GUIDE_9;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="grade-guide-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="grade-guide-title" className="font-display text-lg font-bold text-[#1E293B]">
              {guide.title}
            </h2>
            <p className="mt-1 text-xs text-ink-soft">{guide.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-fog"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink">
          {guide.bullets.map((b) => (
            <li key={b.slice(0, 24)} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#10B981]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 overflow-hidden rounded-xl ring-1 ring-line">
          <table className="w-full text-left text-xs">
            <thead className="bg-fog/80 text-ink-soft">
              <tr>
                {open === "5" ? (
                  <>
                    <th className="px-3 py-2 font-semibold">5등급</th>
                    <th className="px-3 py-2 font-semibold">9등급 환산(참고)</th>
                    <th className="px-3 py-2 font-semibold">의미</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2 font-semibold">9등급</th>
                    <th className="px-3 py-2 font-semibold">누적 비율 감각</th>
                    <th className="px-3 py-2 font-semibold">의미</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {guide.table.map((row) => (
                <tr key={row.five + row.nine} className="border-t border-line">
                  <td className="px-3 py-2 font-medium text-ink">{row.five}</td>
                  <td className="px-3 py-2 text-ink-soft">{row.nine}</td>
                  <td className="px-3 py-2 text-ink-soft">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#1E293B] px-4 py-2.5 text-sm font-semibold text-white"
        >
          확인
        </button>
      </div>
    </div>
  );
}
