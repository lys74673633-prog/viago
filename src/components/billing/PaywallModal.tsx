"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, FileDown, Loader2, Sparkles, X } from "lucide-react";
import { useBilling } from "@/contexts/BillingContext";
import { PRODUCTS, type ProductId } from "@/lib/billing/products";

export type PaywallReason = "export" | "clean" | "archive" | "parent_report" | "quota";

interface PaywallModalProps {
  open: boolean;
  reason: PaywallReason;
  onClose: () => void;
  onPurchased?: (productId: ProductId) => void;
}

const COPY: Record<
  PaywallReason,
  { title: string; body: string; primary: ProductId; secondary?: ProductId }
> = {
  export: {
    title: "학교 제출용 문서로 변환할까요?",
    body: "HWP/PDF 다운로드는 건당 1,900원 또는 프리미엄 구독으로 이용할 수 있어요.",
    primary: "export_once",
    secondary: "premium_monthly",
  },
  clean: {
    title: "AI 안심 클리닝은 유료 기능이에요",
    body: "NEIS·웹 문구와 겹치지 않도록 독창적 어조로 다듬습니다. 토큰 팩 또는 프리미엄으로 이용하세요.",
    primary: "clean_token_pack",
    secondary: "premium_monthly",
  },
  archive: {
    title: "프리미엄 전용 콘텐츠입니다",
    body: "명문대 합격생 세특 사례 전문은 프리미엄 구독 후 확인할 수 있어요.",
    primary: "premium_monthly",
  },
  parent_report: {
    title: "학부모 입시 진단 리포트",
    body: "모의고사·생기부 기반 대입 가능성 PDF를 발급하려면 리포트권 또는 프리미엄이 필요해요.",
    primary: "parent_report",
    secondary: "premium_monthly",
  },
  quota: {
    title: "오늘의 무료 횟수를 모두 사용했어요",
    body: "프리미엄으로 업그레이드하면 세특·수행평가 생성을 더 여유 있게 이용할 수 있어요.",
    primary: "premium_monthly",
  },
};

export function PaywallModal({ open, reason, onClose, onPurchased }: PaywallModalProps) {
  const { purchase, formatKrw } = useBilling();
  const [loading, setLoading] = useState<ProductId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const copy = COPY[reason];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function buy(productId: ProductId) {
    setError(null);
    setLoading(productId);
    const result = await purchase(productId);
    setLoading(null);
    if (!result.ok) {
      setError(result.error ?? "결제에 실패했습니다.");
      return;
    }
    onPurchased?.(productId);
    onClose();
  }

  const Icon =
    reason === "export" ? FileDown : reason === "clean" ? Sparkles : Crown;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-line animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#059669]">
            <Icon className="size-5" aria-hidden />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-soft transition hover:bg-ink/5"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <h2 id="paywall-title" className="mt-4 font-display text-xl font-bold text-[#1E293B]">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{copy.body}</p>

        <div className="mt-5 space-y-2">
          <PayButton
            productId={copy.primary}
            loading={loading}
            onClick={() => void buy(copy.primary)}
            formatKrw={formatKrw}
            primary
          />
          {copy.secondary && (
            <PayButton
              productId={copy.secondary}
              loading={loading}
              onClick={() => void buy(copy.secondary!)}
              formatKrw={formatKrw}
            />
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
            {error}
          </p>
        )}

        <p className="mt-4 text-center text-xs text-ink-soft">
          토스페이먼츠 목업 결제 ·{" "}
          <Link href="/pricing" className="font-semibold text-teal hover:underline">
            요금제 자세히
          </Link>
        </p>
      </div>
    </div>
  );
}

function PayButton({
  productId,
  loading,
  onClick,
  formatKrw,
  primary,
}: {
  productId: ProductId;
  loading: ProductId | null;
  onClick: () => void;
  formatKrw: (n: number) => string;
  primary?: boolean;
}) {
  const product = PRODUCTS[productId];
  const busy = loading === productId;

  return (
    <button
      type="button"
      disabled={Boolean(loading)}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition disabled:opacity-60 ${
        primary
          ? "bg-[#1E293B] text-white hover:bg-slate-800"
          : "border border-ink/12 bg-white text-ink hover:bg-fog"
      }`}
    >
      <span>
        {product.name}
        {product.badge && (
          <span className="ml-2 rounded bg-[#10B981]/20 px-1.5 py-0.5 text-[10px] text-[#059669]">
            {product.badge}
          </span>
        )}
      </span>
      <span className="inline-flex items-center gap-2">
        {busy && <Loader2 className="size-3.5 animate-spin" />}
        {formatKrw(product.priceKrw)}
      </span>
    </button>
  );
}
