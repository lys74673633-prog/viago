"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyPremiumUnlockOverlay,
  canCleanText,
  canExportDocument,
  canGenerateParentReport,
  canViewArchiveFull,
  consumeCleanToken,
  consumeExportCredit,
  consumeParentReportCredit,
  DEFAULT_ENTITLEMENTS,
  readEntitlementsClient,
  writeEntitlementsClient,
  type Entitlements,
} from "@/lib/billing/entitlements";
import { syncPremiumCookie } from "@/lib/billing/premium-cookie";
import type { ProductId } from "@/lib/billing/products";
import { formatKrw } from "@/lib/payments/toss";

interface BillingContextValue {
  entitlements: Entitlements;
  ready: boolean;
  trialActive: boolean;
  canExport: boolean;
  canClean: boolean;
  canArchive: boolean;
  canParentReport: boolean;
  refresh: () => void;
  /** 체크아웃(토스 결제위젯)으로 이동 */
  purchase: (productId: ProductId) => Promise<{ ok: boolean; orderId?: string; error?: string }>;
  spendExport: () => boolean;
  spendClean: () => boolean;
  spendParentReport: () => boolean;
  formatKrw: typeof formatKrw;
}

const BillingContext = createContext<BillingContextValue | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [base, setBase] = useState<Entitlements>(DEFAULT_ENTITLEMENTS);
  const [trialActive, setTrialActive] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setBase(readEntitlementsClient());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "viago:entitlements:v1") refresh();
    };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("viago:entitlements", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("viago:entitlements", onCustom as EventListener);
    };
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    async function loadTrial() {
      try {
        const res = await fetch("/api/billing/trial", { cache: "no-store" });
        const data = (await res.json()) as { enabled?: boolean };
        if (!cancelled) setTrialActive(Boolean(data.enabled));
      } catch {
        if (!cancelled) setTrialActive(false);
      }
    }
    void loadTrial();
    const id = window.setInterval(() => void loadTrial(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const entitlements = useMemo(
    () => (trialActive ? applyPremiumUnlockOverlay(base) : base),
    [base, trialActive],
  );

  useEffect(() => {
    // 미들웨어/쿠키 게이트와 맞춤 (체험 중에도 Premium 배지·아카이브 접근)
    syncPremiumCookie(entitlements.isPremium);
  }, [entitlements.isPremium]);

  const persist = useCallback((next: Entitlements) => {
    writeEntitlementsClient(next);
    setBase(next);
  }, []);

  const purchase = useCallback(async (productId: ProductId) => {
    if (typeof window === "undefined") {
      return { ok: false, error: "브라우저에서만 결제할 수 있습니다." };
    }
    window.location.assign(`/checkout?productId=${encodeURIComponent(productId)}`);
    return { ok: true };
  }, []);

  const spendExport = useCallback(() => {
    if (trialActive) return true;
    const current = readEntitlementsClient();
    if (!canExportDocument(current)) return false;
    persist(consumeExportCredit(current));
    return true;
  }, [persist, trialActive]);

  const spendClean = useCallback(() => {
    if (trialActive) return true;
    const current = readEntitlementsClient();
    if (!canCleanText(current)) return false;
    persist(consumeCleanToken(current));
    return true;
  }, [persist, trialActive]);

  const spendParentReport = useCallback(() => {
    if (trialActive) return true;
    const current = readEntitlementsClient();
    if (!canGenerateParentReport(current)) return false;
    persist(consumeParentReportCredit(current));
    return true;
  }, [persist, trialActive]);

  const value = useMemo<BillingContextValue>(
    () => ({
      entitlements,
      ready,
      trialActive,
      canExport: canExportDocument(entitlements),
      canClean: canCleanText(entitlements),
      canArchive: canViewArchiveFull(entitlements),
      canParentReport: canGenerateParentReport(entitlements),
      refresh,
      purchase,
      spendExport,
      spendClean,
      spendParentReport,
      formatKrw,
    }),
    [
      entitlements,
      ready,
      trialActive,
      refresh,
      purchase,
      spendExport,
      spendClean,
      spendParentReport,
    ],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling() {
  const ctx = useContext(BillingContext);
  if (!ctx) {
    throw new Error("useBilling must be used within BillingProvider");
  }
  return ctx;
}
