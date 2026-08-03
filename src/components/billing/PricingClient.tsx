"use client";

import { useState } from "react";
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
  const [message, setMessage] = useState<string | null>(null);

  async function buy(id: ProductId) {
    setMessage(null);
    setLoading(id);
    const result = await purchase(id);
    setLoading(null);
    setMessage(
      result.ok
        ? `결제가 완료되었습니다. (주문 ${result.orderId})`
        : result.error ?? "결제 실패",
    );
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
                목업 결제하기
              </button>
            </li>
          );
        })}
      </ul>

      {message && (
        <p className="rounded-xl bg-mint/50 px-4 py-3 text-sm text-teal-deep" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
