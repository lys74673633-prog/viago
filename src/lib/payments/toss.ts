import type { ProductId } from "@/lib/billing/products";
import { PRODUCTS } from "@/lib/billing/products";

/**
 * 토스페이먼츠 연동 뼈대 + 목업 결제 헬퍼.
 * 실서비스: 클라이언트 SDK → /api/payments/confirm → entitlements 반영
 */
export const tossConfig = {
  clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "",
  secretKey: process.env.TOSS_SECRET_KEY ?? "",
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/payment/success`,
  failUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/payment/fail`,
} as const;

export function isTossConfigured(): boolean {
  return Boolean(tossConfig.clientKey && tossConfig.secretKey);
}

export function createOrderId(productId: ProductId): string {
  return `viago_${productId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface MockCheckoutPayload {
  productId: ProductId;
  orderId: string;
  amount: number;
  orderName: string;
  successUrl: string;
  failUrl: string;
  mode: "mock" | "toss";
}

/** 결제 요청 페이로드 생성 (목업 기본) */
export function buildCheckout(productId: ProductId): MockCheckoutPayload {
  const product = PRODUCTS[productId];
  const orderId = createOrderId(productId);
  return {
    productId,
    orderId,
    amount: product.priceKrw,
    orderName: product.name,
    successUrl: `${tossConfig.successUrl}?orderId=${orderId}&productId=${productId}`,
    failUrl: `${tossConfig.failUrl}?orderId=${orderId}`,
    mode: isTossConfigured() ? "toss" : "mock",
  };
}

export function formatKrw(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}
