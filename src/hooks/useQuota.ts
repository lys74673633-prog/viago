"use client";

import { useCallback, useEffect, useState } from "react";
import type { UsageStatus } from "@/types";

const empty: UsageStatus = {
  used: 0,
  limit: 5,
  remaining: 5,
  dateKey: "",
};

export function useQuota() {
  const [usage, setUsage] = useState<UsageStatus>(empty);
  const [premiumOpen, setPremiumOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (!res.ok) return;
      const data = (await res.json()) as UsageStatus;
      setUsage(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function applyQuotaFromResponse(data: { remaining?: number; limit?: number }) {
    if (typeof data.remaining === "number") {
      setUsage((prev) => ({
        ...prev,
        remaining: data.remaining!,
        limit: data.limit ?? prev.limit,
        used: Math.max(0, (data.limit ?? prev.limit) - data.remaining!),
      }));
    }
  }

  function handleQuotaError(status: number, data: { error?: string }) {
    if (status === 402 || data.error === "QUOTA_EXCEEDED") {
      setUsage((prev) => ({ ...prev, remaining: 0, used: prev.limit }));
      setPremiumOpen(true);
      return true;
    }
    return false;
  }

  return {
    usage,
    setUsage,
    refresh,
    premiumOpen,
    setPremiumOpen,
    applyQuotaFromResponse,
    handleQuotaError,
  };
}
