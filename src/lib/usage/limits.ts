import type { UsageStatus } from "@/types";

/** 일일 무료 이용 횟수 (기본 5회) */
export const DAILY_FREE_LIMIT = Number(process.env.DAILY_FREE_LIMIT ?? 5);

/** KST 기준 날짜 키 (YYYY-MM-DD) */
export function getKstDateKey(date = new Date()): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/**
 * @deprecated 서버 할당량(`lib/usage/quota.ts` + users.daily_quota)을 사용하세요.
 * 게스트/오프라인 폴백용 localStorage 헬퍼만 유지합니다.
 */
const STORAGE_PREFIX = "studypilot:usage:";

export function readLocalUsage(dateKey = getKstDateKey()): UsageStatus {
  if (typeof window === "undefined") {
    return { used: 0, limit: DAILY_FREE_LIMIT, remaining: DAILY_FREE_LIMIT, dateKey };
  }

  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${dateKey}`);
  const used = Math.min(Number(raw ?? 0) || 0, DAILY_FREE_LIMIT);

  return {
    used,
    limit: DAILY_FREE_LIMIT,
    remaining: Math.max(0, DAILY_FREE_LIMIT - used),
    dateKey,
  };
}

export function incrementLocalUsage(dateKey = getKstDateKey()): UsageStatus {
  const current = readLocalUsage(dateKey);
  if (current.remaining <= 0) return current;

  const used = current.used + 1;
  window.localStorage.setItem(`${STORAGE_PREFIX}${dateKey}`, String(used));

  return {
    used,
    limit: DAILY_FREE_LIMIT,
    remaining: Math.max(0, DAILY_FREE_LIMIT - used),
    dateKey,
  };
}

export function canGenerate(status: UsageStatus): boolean {
  return status.remaining > 0;
}
