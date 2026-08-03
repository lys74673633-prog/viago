import { cookies } from "next/headers";
import { DAILY_FREE_LIMIT, getKstDateKey } from "@/lib/usage/limits";
import type { QuotaResult, UsageStatus } from "@/types";

const COOKIE_NAME = "sp_guest_quota";

interface GuestQuotaCookie {
  dateKey: string;
  remaining: number;
}

function parseCookie(raw: string | undefined): GuestQuotaCookie | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as GuestQuotaCookie;
    if (!data.dateKey || typeof data.remaining !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

export async function getGuestUsageStatus(): Promise<UsageStatus> {
  const dateKey = getKstDateKey();
  const store = await cookies();
  const parsed = parseCookie(store.get(COOKIE_NAME)?.value);

  if (!parsed || parsed.dateKey !== dateKey) {
    return {
      used: 0,
      limit: DAILY_FREE_LIMIT,
      remaining: DAILY_FREE_LIMIT,
      dateKey,
      authenticated: false,
    };
  }

  const remaining = Math.max(0, Math.min(DAILY_FREE_LIMIT, parsed.remaining));
  return {
    used: DAILY_FREE_LIMIT - remaining,
    limit: DAILY_FREE_LIMIT,
    remaining,
    dateKey,
    authenticated: false,
  };
}

export async function consumeGuestQuota(): Promise<QuotaResult> {
  const dateKey = getKstDateKey();
  const store = await cookies();
  const parsed = parseCookie(store.get(COOKIE_NAME)?.value);
  const current =
    parsed && parsed.dateKey === dateKey ? parsed.remaining : DAILY_FREE_LIMIT;

  if (current <= 0) {
    return {
      ok: false,
      error: "QUOTA_EXCEEDED",
      remaining: 0,
      limit: DAILY_FREE_LIMIT,
      exhausted: true,
    };
  }

  const remaining = current - 1;
  store.set(COOKIE_NAME, JSON.stringify({ dateKey, remaining }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 48,
  });

  return {
    ok: true,
    remaining,
    limit: DAILY_FREE_LIMIT,
    exhausted: remaining <= 0,
  };
}
