"use client";

import { Crown } from "lucide-react";
import { useBilling } from "@/contexts/BillingContext";

/** 결제(요금제)로 프리미엄이 활성화된 경우에만 표시 */
export function BillingStatusChip() {
  const { entitlements, ready } = useBilling();
  if (!ready || !entitlements.isPremium) return null;

  return (
    <span className="hidden items-center gap-1 rounded-lg bg-[#10B981]/15 px-2 py-1.5 text-xs font-semibold text-[#059669] sm:inline-flex">
      <Crown className="size-3.5" aria-hidden />
      Premium
    </span>
  );
}
