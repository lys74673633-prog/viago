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
import type { ProductId } from "@/lib/billing/products";
import { formatKrw } from "@/lib/payments/toss";

interface BillingContextValue {
  entitlements: Entitlements;
  ready: boolean;
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
  const [entitlements, setEntitlements] = useState<Entitlements>(DEFAULT_ENTITLEMENTS);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setEntitlements(readEntitlementsClient());
  }, []);

  useEffect(() => {
    // DEV 강제해제가 꺼진 뒤에도 예전 프리미엄 쿠키가 남지 않도록 동기화
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

  const persist = useCallback((next: Entitlements) => {
    writeEntitlementsClient(next);
    setEntitlements(next);
  }, []);

  const purchase = useCallback(async (productId: ProductId) => {
    if (typeof window === "undefined") {
      return { ok: false, error: "브라우저에서만 결제할 수 있습니다." };
    }
    window.location.assign(`/checkout?productId=${encodeURIComponent(productId)}`);
    return { ok: true };
  }, []);

  const spendExport = useCallback(() => {
    const current = readEntitlementsClient();
    if (!canExportDocument(current)) return false;
    persist(consumeExportCredit(current));
    return true;
  }, [persist]);

  const spendClean = useCallback(() => {
    const current = readEntitlementsClient();
    if (!canCleanText(current)) return false;
    persist(consumeCleanToken(current));
    return true;
  }, [persist]);

  const spendParentReport = useCallback(() => {
    const current = readEntitlementsClient();
    if (!canGenerateParentReport(current)) return false;
    persist(consumeParentReportCredit(current));
    return true;
  }, [persist]);

  const value = useMemo<BillingContextValue>(
    () => ({
      entitlements,
      ready,
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
