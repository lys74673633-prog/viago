"use client";

import Link from "next/link";
import { isDevPremiumUnlocked } from "@/lib/billing/entitlements";

/** 개발용 프리미엄 해제 중일 때만 보이는 안내 배너 */
export function DevPremiumBanner() {
  if (!isDevPremiumUnlocked()) return null;

  return (
    <div className="relative z-50 bg-amber-400 px-3 py-2 text-center text-xs font-semibold text-amber-950">
      DEV · 프리미엄 제한 임시 해제 중 — 문서변환 / 클리닝 / 합격사례 / 학부모 리포트 모두 열려
      있음. 다시 잠그려면{" "}
      <code className="rounded bg-amber-200/80 px-1">NEXT_PUBLIC_DEV_UNLOCK_PREMIUM=false</code>{" "}
      ·{" "}
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
