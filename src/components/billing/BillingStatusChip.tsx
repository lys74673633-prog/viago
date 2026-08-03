"use client";

import { Crown } from "lucide-react";
import { useBilling } from "@/contexts/BillingContext";
import { isDevPremiumUnlocked } from "@/lib/billing/entitlements";

/** 프리미엄일 때만 상태 뱃지 표시. 무료 유저의 '업그레이드' CTA는 요금제 메뉴로 통일. */
export function BillingStatusChip() {
  const { entitlements, ready } = useBilling();
  if (!ready || !entitlements.isPremium) return null;

  return (
    <span className="hidden items-center gap-1 rounded-lg bg-[#10B981]/15 px-2 py-1.5 text-xs font-semibold text-[#059669] sm:inline-flex">
      <Crown className="size-3.5" aria-hidden />
      {isDevPremiumUnlocked() ? "DEV Premium" : "Premium"}
    </span>
  );
}
