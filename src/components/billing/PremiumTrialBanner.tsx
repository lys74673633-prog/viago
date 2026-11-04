"use client";

import Link from "next/link";
import { useBilling } from "@/contexts/BillingContext";
import { isDevPremiumUnlocked } from "@/lib/billing/entitlements";

/** 관리자가 켠 전역 프리미엄 체험 배너 */
export function PremiumTrialBanner() {
  const { trialActive, entitlements } = useBilling();
  if (!trialActive || isDevPremiumUnlocked()) return null;
  if (!entitlements.isPremium) return null;

  return (
    <div className="relative z-50 bg-teal px-3 py-2 text-center text-xs font-semibold text-white">
      관리자 프리미엄 체험 중 — 문서변환 / 클리닝 / 합격사례 / 학부모 리포트 이용 가능 ·{" "}
      <Link href="/archive" className="underline">
        합격사례
      </Link>{" "}
      ·{" "}
      <Link href="/parent-report" className="underline">
        학부모
      </Link>{" "}
      ·{" "}
      <Link href="/pricing" className="underline">
        요금제
      </Link>
    </div>
  );
}
