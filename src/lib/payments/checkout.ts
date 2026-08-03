"use client";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { ProductId } from "@/lib/billing/products";
import {
  buildCheckout,
  createCustomerKey,
  savePendingOrder,
  type CheckoutPayload,
} from "@/lib/payments/toss";

export type PurchaseResult = {
  ok: boolean;
  orderId?: string;
  error?: string;
  mode?: "mock" | "toss";
};

/**
 * 결제 시작:
 * - 토스 키 있음 → 결제창 (카드·토스페이·카카오페이 등 가맹점 설정 수단)
 * - 없음 → 목업 API (개발용)
 */
export async function startPurchase(productId: ProductId): Promise<PurchaseResult> {
  const checkout = buildCheckout(productId);

  if (checkout.mode === "toss") {
    return startTossPayment(checkout);
  }

  return startMockPayment(checkout);
}

async function startMockPayment(checkout: CheckoutPayload): Promise<PurchaseResult> {
  try {
    const res = await fetch("/api/payments/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkout),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.message ?? data.error ?? "결제에 실패했습니다." };
    }
    return { ok: true, orderId: data.orderId ?? checkout.orderId, mode: "mock" };
  } catch {
    return { ok: false, error: "결제 서버에 연결하지 못했습니다." };
  }
}

async function startTossPayment(checkout: CheckoutPayload): Promise<PurchaseResult> {
  try {
    const cfgRes = await fetch("/api/payments/config", { cache: "no-store" });
    const cfg = await cfgRes.json();
    if (!cfg.tossConfigured || !cfg.clientKey) {
      return {
        ok: false,
        error: "토스페이먼츠 키가 설정되지 않았습니다. Vercel env에 클라이언트/시크릿 키를 넣어 주세요.",
      };
    }

    savePendingOrder({
      orderId: checkout.orderId,
      productId: checkout.productId,
      amount: checkout.amount,
      orderName: checkout.orderName,
      createdAt: new Date().toISOString(),
    });

    const tossPayments = await loadTossPayments(cfg.clientKey as string);
    const payment = tossPayments.payment({ customerKey: createCustomerKey() });

    // 결제위젯 없이 통합 결제창 — 카드 + 간편결제(토스페이/카카오페이 등) 선택 UI
    await payment.requestPayment({
      method: "CARD",
      amount: {
        currency: "KRW",
        value: checkout.amount,
      },
      orderId: checkout.orderId,
      orderName: checkout.orderName,
      successUrl: checkout.successUrl,
      failUrl: checkout.failUrl,
    });

    // requestPayment는 성공 시 리다이렉트하므로 여기까지 오면 취소/이탈
    return { ok: false, error: "결제가 취소되었거나 창이 닫혔습니다.", mode: "toss" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "토스 결제창을 열지 못했습니다.";
    // 사용자 취소는 조용히
    if (/취소|cancel|closed|AbortError/i.test(message)) {
      return { ok: false, error: "결제가 취소되었습니다.", mode: "toss" };
    }
    return { ok: false, error: message, mode: "toss" };
  }
}
