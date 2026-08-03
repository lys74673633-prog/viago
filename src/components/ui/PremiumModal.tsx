"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Crown, X } from "lucide-react";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumModal({ open, onClose }: PremiumModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-line animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-citrus/70 text-ink">
            <Crown className="size-5" aria-hidden />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <h2 id="premium-title" className="mt-4 font-display text-xl font-bold text-ink">
          오늘의 무료 횟수를 모두 사용했어요
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          무료 플랜은 하루 5회까지 AI 생성이 가능합니다. 프리미엄으로 업그레이드하면
          세특·수행평가 생성을 더 여유 있게 이용할 수 있어요.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-ink">
          <li className="flex gap-2">
            <span className="text-teal">✓</span> 일일 생성 한도 대폭 확대
          </li>
          <li className="flex gap-2">
            <span className="text-teal">✓</span> 세특·수행평가 올인원 무제한에 가깝게
          </li>
          <li className="flex gap-2">
            <span className="text-teal">✓</span> 토스페이먼츠 간편 결제 (준비 중)
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink-soft"
          >
            프리미엄 소식 받기
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-ink/12 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-fog"
          >
            내일 다시 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
