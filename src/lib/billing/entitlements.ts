import type { ProductId } from "@/lib/billing/products";
import { syncPremiumCookie } from "@/lib/billing/premium-cookie";

export const ENTITLEMENTS_KEY = "viago:entitlements:v1";

/**
 * 개발용 프리미엄 강제 해제.
 * 기본값: OFF — 결제(또는 목업 결제 완료) 후에만 프리미엄.
 * 로컬에서만 필요하면 NEXT_PUBLIC_DEV_UNLOCK_PREMIUM=true
 */
export function isDevPremiumUnlocked(): boolean {
  return process.env.NEXT_PUBLIC_DEV_UNLOCK_PREMIUM === "true";
}

export function applyDevPremiumUnlock(e: Entitlements): Entitlements {
  if (!isDevPremiumUnlocked()) return e;
  const until = new Date();
  until.setFullYear(until.getFullYear() + 1);
  return {
    ...e,
    isPremium: true,
    premiumUntil: until.toISOString(),
    exportCredits: Math.max(e.exportCredits, 99),
    cleanTokens: Math.max(e.cleanTokens, 99),
    parentReportCredits: Math.max(e.parentReportCredits, 99),
  };
}

export interface Entitlements {
  isPremium: boolean;
  /** 프리미엄 만료(ISO). 목업에서는 구독 시 +30일 */
  premiumUntil: string | null;
  /** HWP/PDF 단건 다운로드 잔여 횟수 */
  exportCredits: number;
  /** AI 클리닝 애드온 토큰 */
  cleanTokens: number;
  /** 학부모 리포트 발급권 */
  parentReportCredits: number;
  /** 최근 목업 결제 내역 */
  lastOrderId: string | null;
  updatedAt: string;
}

export const DEFAULT_ENTITLEMENTS: Entitlements = {
  isPremium: false,
  premiumUntil: null,
  exportCredits: 0,
  cleanTokens: 0,
  parentReportCredits: 0,
  lastOrderId: null,
  updatedAt: new Date(0).toISOString(),
};

export function normalizeEntitlements(raw: Partial<Entitlements> | null): Entitlements {
  const base = { ...DEFAULT_ENTITLEMENTS, ...raw };
  if (base.isPremium && base.premiumUntil) {
    if (new Date(base.premiumUntil).getTime() < Date.now()) {
      base.isPremium = false;
      base.premiumUntil = null;
    }
  }
  return base;
}

export function readEntitlementsClient(): Entitlements {
  if (typeof window === "undefined") {
    return applyDevPremiumUnlock(DEFAULT_ENTITLEMENTS);
  }
  try {
    const raw = window.localStorage.getItem(ENTITLEMENTS_KEY);
    const base = raw
      ? normalizeEntitlements(JSON.parse(raw) as Partial<Entitlements>)
      : DEFAULT_ENTITLEMENTS;
    const unlocked = applyDevPremiumUnlock(base);
    syncPremiumCookie(unlocked.isPremium);
    return unlocked;
  } catch {
    const unlocked = applyDevPremiumUnlock(DEFAULT_ENTITLEMENTS);
    syncPremiumCookie(unlocked.isPremium);
    return unlocked;
  }
}

export function writeEntitlementsClient(next: Entitlements) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENTITLEMENTS_KEY, JSON.stringify(next));
  syncPremiumCookie(next.isPremium);
  window.dispatchEvent(new CustomEvent("viago:entitlements", { detail: next }));
}

export function canExportDocument(e: Entitlements): boolean {
  return e.isPremium || e.exportCredits > 0;
}

export function canCleanText(e: Entitlements): boolean {
  return e.isPremium || e.cleanTokens > 0;
}

export function canViewArchiveFull(e: Entitlements): boolean {
  return e.isPremium;
}

export function canGenerateParentReport(e: Entitlements): boolean {
  return e.isPremium || e.parentReportCredits > 0;
}

export function applyProductPurchase(
  current: Entitlements,
  productId: ProductId,
  orderId: string,
): Entitlements {
  const next = { ...current, lastOrderId: orderId, updatedAt: new Date().toISOString() };

  switch (productId) {
    case "premium_monthly": {
      const until = new Date();
      until.setDate(until.getDate() + 30);
      next.isPremium = true;
      next.premiumUntil = until.toISOString();
      next.cleanTokens += 30;
      next.exportCredits += 10;
      next.parentReportCredits += 1;
      break;
    }
    case "export_once":
      next.exportCredits += 1;
      break;
    case "clean_token_pack":
      next.cleanTokens += 5;
      break;
    case "parent_report":
      next.parentReportCredits += 1;
      break;
  }

  return next;
}

export function consumeExportCredit(e: Entitlements): Entitlements {
  if (e.isPremium) return { ...e, updatedAt: new Date().toISOString() };
  return {
    ...e,
    exportCredits: Math.max(0, e.exportCredits - 1),
    updatedAt: new Date().toISOString(),
  };
}

export function consumeCleanToken(e: Entitlements): Entitlements {
  if (e.isPremium) {
    // 프리미엄도 토큰 풀이 있으면 차감(월 지급분), 없어도 허용
    if (e.cleanTokens > 0) {
      return {
        ...e,
        cleanTokens: e.cleanTokens - 1,
        updatedAt: new Date().toISOString(),
      };
    }
    return { ...e, updatedAt: new Date().toISOString() };
  }
  return {
    ...e,
    cleanTokens: Math.max(0, e.cleanTokens - 1),
    updatedAt: new Date().toISOString(),
  };
}

export function consumeParentReportCredit(e: Entitlements): Entitlements {
  if (e.isPremium) return { ...e, updatedAt: new Date().toISOString() };
  return {
    ...e,
    parentReportCredits: Math.max(0, e.parentReportCredits - 1),
    updatedAt: new Date().toISOString(),
  };
}
