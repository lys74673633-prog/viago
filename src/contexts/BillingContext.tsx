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
  applyProductPurchase,
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
import { buildCheckout, formatKrw } from "@/lib/payments/toss";

interface BillingContextValue {
  entitlements: Entitlements;
  ready: boolean;
  canExport: boolean;
  canClean: boolean;
  canArchive: boolean;
  canParentReport: boolean;
  refresh: () => void;
  /** 토스 목업 결제 → 권한 부여 */
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

  const purchase = useCallback(
    async (productId: ProductId) => {
      const checkout = buildCheckout(productId);
      try {
        const res = await fetch("/api/payments/mock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkout),
        });
        const data = await res.json();
        if (!res.ok) {
          return { ok: false, error: data.error ?? "결제에 실패했습니다." };
        }

        const next = applyProductPurchase(
          readEntitlementsClient(),
          productId,
          data.orderId ?? checkout.orderId,
        );
        persist(next);
        return { ok: true, orderId: data.orderId ?? checkout.orderId };
      } catch {
        return { ok: false, error: "결제 서버에 연결하지 못했습니다." };
      }
    },
    [persist],
  );

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
