"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useBilling } from "@/contexts/BillingContext";
import { PRODUCTS, type ProductId } from "@/lib/billing/products";

const ORDER: ProductId[] = [
  "premium_monthly",
  "export_once",
  "clean_token_pack",
  "parent_report",
];

export function PricingClient() {
  const { purchase, formatKrw, entitlements } = useBilling();
  const [loading, setLoading] = useState<ProductId | null>(null);
  const [paymentMode, setPaymentMode] = useState<"unknown" | "toss" | "mock">("unknown");

  useEffect(() => {
    void fetch("/api/payments/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPaymentMode(d.tossConfigured ? "toss" : "mock"))
      .catch(() => setPaymentMode("mock"));
  }, []);

  async function buy(id: ProductId) {
    setLoading(id);
    await purchase(id);
    // 토스/체크아웃으로 이동하면 언마운트됨
    setLoading(null);
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-ink-soft ring-1 ring-line">
        현재 상태:{" "}
        <strong className="text-ink">
          {entitlements.isPremium ? "프리미엄" : "무료"}
        </strong>
        {" · "}
        내보내기 {entitlements.exportCredits}회 · 클리닝 토큰 {entitlements.cleanTokens} ·
        학부모 리포트 {entitlements.parentReportCredits}회
      </div>

      <div className="rounded-2xl border border-[#10B981]/20 bg-[#ecfdf5] px-4 py-3 text-sm text-[#065f46]">
        <p className="font-semibold">결제: 토스페이먼츠 (카드·토스페이·카카오페이)</p>
        <p className="mt-1 text-xs leading-relaxed">
          {paymentMode === "toss"
            ? "토스 결제 키가 연결되어 있습니다. 결제하기를 누르면 실제 결제창이 열립니다."
            : "아직 토스 키가 없어 개발용 목업만 가능합니다. 토스페이먼츠에서 키를 발급해 Vercel env에 넣으면 실결제창이 활성화됩니다."}
          {" "}
          실수익 정산은 사업자 등록 후 라이브 키·정산 계좌를 토스에 등록하면 그 계좌로
          입금됩니다.
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {ORDER.map((id) => {
          const p = PRODUCTS[id];
          const busy = loading === id;
          return (
            <li
              key={id}
              className="flex flex-col rounded-2xl bg-white/80 p-5 ring-1 ring-line"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-[#1E293B]">{p.name}</h2>
                {p.badge && (
                  <span className="rounded-md bg-[#10B981]/15 px-2 py-0.5 text-[11px] font-semibold text-[#059669]">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm text-ink-soft">{p.description}</p>
              <p className="mt-4 font-display text-2xl font-bold text-ink">
                {formatKrw(p.priceKrw)}
              </p>
              <button
                type="button"
                disabled={Boolean(loading)}
                onClick={() => void buy(id)}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {paymentMode === "toss" ? "결제하기" : "결제하기 (키 없으면 목업)"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
