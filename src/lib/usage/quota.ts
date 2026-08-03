import { createClient } from "@/lib/supabase/server";
import { consumeGuestQuota, getGuestUsageStatus } from "@/lib/usage/guest-quota";
import { DAILY_FREE_LIMIT, getKstDateKey } from "@/lib/usage/limits";
import type { QuotaResult, UsageStatus } from "@/types";

/**
 * 일일 할당량 조회
 * - 로그인 + Supabase: users.daily_quota (RPC get_daily_quota)
 * - 그 외: HttpOnly 게스트 쿠키
 */
export async function getQuotaStatus(): Promise<UsageStatus> {
  const supabase = await createClient();
  const dateKey = getKstDateKey();

  if (!supabase) {
    return getGuestUsageStatus();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return getGuestUsageStatus();
  }

  const { data, error } = await supabase.rpc("get_daily_quota", {
    p_limit: DAILY_FREE_LIMIT,
  });

  if (error || !data) {
    // RPC 미적용 환경 폴백: users 테이블 직접 조회
    const direct = await readUsersTable(supabase, user.id);
    if (direct) return direct;
    return getGuestUsageStatus();
  }

  const payload = data as {
    remaining: number;
    limit: number;
    used: number;
    is_premium?: boolean;
    authenticated?: boolean;
  };

  return {
    remaining: payload.remaining,
    limit: payload.limit ?? DAILY_FREE_LIMIT,
    used: payload.used ?? Math.max(0, DAILY_FREE_LIMIT - payload.remaining),
    dateKey,
    isPremium: Boolean(payload.is_premium),
    authenticated: true,
  };
}

/**
 * AI 호출 직전 1회 차감.
 * 실패 시 QUOTA_EXCEEDED — 클라이언트에서 프리미엄 모달 표시.
 */
export async function consumeQuota(): Promise<QuotaResult> {
  const supabase = await createClient();

  if (!supabase) {
    return consumeGuestQuota();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return consumeGuestQuota();
  }

  const { data, error } = await supabase.rpc("consume_daily_quota", {
    p_limit: DAILY_FREE_LIMIT,
  });

  if (error || !data) {
    const fallback = await consumeUsersTable(supabase, user.id);
    if (fallback) return fallback;
    return consumeGuestQuota();
  }

  const payload = data as QuotaResult & { error?: string };

  return {
    ok: Boolean(payload.ok),
    remaining: payload.remaining ?? 0,
    limit: payload.limit ?? DAILY_FREE_LIMIT,
    exhausted: Boolean(payload.exhausted) || payload.error === "QUOTA_EXCEEDED",
    isPremium: Boolean(payload.isPremium ?? (payload as { is_premium?: boolean }).is_premium),
    error: payload.error,
  };
}

async function readUsersTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
): Promise<UsageStatus | null> {
  const today = getKstDateKey();
  const { data: row } = await supabase
    .from("users")
    .select("daily_quota, quota_date, is_premium")
    .eq("id", userId)
    .maybeSingle();

  if (!row) return null;

  let remaining = row.daily_quota as number;
  if (row.is_premium) {
    return {
      remaining: DAILY_FREE_LIMIT,
      limit: DAILY_FREE_LIMIT,
      used: 0,
      dateKey: today,
      isPremium: true,
      authenticated: true,
    };
  }

  if (row.quota_date !== today) {
    remaining = DAILY_FREE_LIMIT;
    await supabase
      .from("users")
      .update({ daily_quota: DAILY_FREE_LIMIT, quota_date: today })
      .eq("id", userId);
  }

  return {
    remaining,
    limit: DAILY_FREE_LIMIT,
    used: Math.max(0, DAILY_FREE_LIMIT - remaining),
    dateKey: today,
    authenticated: true,
  };
}

async function consumeUsersTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
): Promise<QuotaResult | null> {
  const status = await readUsersTable(supabase, userId);
  if (!status) return null;

  if (status.isPremium) {
    return {
      ok: true,
      remaining: status.limit,
      limit: status.limit,
      isPremium: true,
      exhausted: false,
    };
  }

  if (status.remaining <= 0) {
    return {
      ok: false,
      error: "QUOTA_EXCEEDED",
      remaining: 0,
      limit: status.limit,
      exhausted: true,
    };
  }

  const remaining = status.remaining - 1;
  const { error } = await supabase
    .from("users")
    .update({
      daily_quota: remaining,
      quota_date: getKstDateKey(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return null;

  return {
    ok: true,
    remaining,
    limit: status.limit,
    exhausted: remaining <= 0,
  };
}

export function quotaExceededResponse(quota: QuotaResult) {
  return {
    error: "QUOTA_EXCEEDED",
    message: "오늘 무료 이용 횟수를 모두 사용했습니다.",
    remaining: 0,
    limit: quota.limit,
    upgrade: true,
  };
}
