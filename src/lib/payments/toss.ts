import type { ProductId } from "@/lib/billing/products";
import { PRODUCTS } from "@/lib/billing/products";

/**
 * 토스페이먼츠 설정.
 * - test_ck_ / test_sk_ : 테스트 (카드 승인 시뮬레이션, 실정산 없음)
 * - live_ck_ / live_sk_ : 라이브 (사업자·가맹점 승인 후 실결제·정산)
 * 카카오페이·토스페이는 토스 결제위젯/간편결제 수단으로 함께 노출됩니다.
 */
export function getAppOrigin() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getTossClientKey() {
  return (process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "").trim();
}

export function getTossSecretKey() {
  return (process.env.TOSS_SECRET_KEY ?? "").trim();
}

export function isTossConfigured(): boolean {
  return Boolean(getTossClientKey() && getTossSecretKey());
}

export function isTossLiveMode(): boolean {
  const ck = getTossClientKey();
  const sk = getTossSecretKey();
  return ck.startsWith("live_") && sk.startsWith("live_");
}

/** 키가 없을 때만 목업 허용 (상용 준비 전 로컬 개발용) */
export function allowMockPayments(): boolean {
  if (process.env.ALLOW_MOCK_PAYMENTS === "true") return true;
  if (process.env.ALLOW_MOCK_PAYMENTS === "false") return false;
  return !isTossConfigured();
}

export function createOrderId(productId: ProductId): string {
  return `viago_${productId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createCustomerKey(): string {
  if (typeof window === "undefined") return `guest_${Date.now()}`;
  const key = "viago:customer-key:v1";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = `viago_${crypto.randomUUID().replace(/-/g, "")}`;
  window.localStorage.setItem(key, next);
  return next;
}

export interface CheckoutPayload {
  productId: ProductId;
  orderId: string;
  amount: number;
  orderName: string;
  successUrl: string;
  failUrl: string;
  mode: "mock" | "toss";
  live: boolean;
}

export function buildCheckout(productId: ProductId): CheckoutPayload {
  const product = PRODUCTS[productId];
  const orderId = createOrderId(productId);
  const origin = typeof window !== "undefined" ? window.location.origin : getAppOrigin();
  const toss = isTossConfigured();

  return {
    productId,
    orderId,
    amount: product.priceKrw,
    orderName: product.name,
    successUrl: `${origin}/payment/success?orderId=${encodeURIComponent(orderId)}&productId=${encodeURIComponent(productId)}`,
    failUrl: `${origin}/payment/fail?orderId=${encodeURIComponent(orderId)}`,
    mode: toss ? "toss" : "mock",
    live: isTossLiveMode(),
  };
}

export function formatKrw(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export const PENDING_ORDER_KEY = "viago:pending-order:v1";

export type PendingOrder = {
  orderId: string;
  productId: ProductId;
  amount: number;
  orderName: string;
  createdAt: string;
};

export function savePendingOrder(order: PendingOrder) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
}

export function readPendingOrder(): PendingOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingOrder;
  } catch {
    return null;
  }
}

export function clearPendingOrder() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_ORDER_KEY);
}
