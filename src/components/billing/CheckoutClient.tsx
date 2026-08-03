"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { Loader2 } from "lucide-react";
import { PRODUCTS, type ProductId } from "@/lib/billing/products";
import {
  createCustomerKey,
  createOrderId,
  formatKrw,
  savePendingOrder,
} from "@/lib/payments/toss";

type PaymentWidgets = Awaited<
  ReturnType<Awaited<ReturnType<typeof loadTossPayments>>["widgets"]>
>;

function isProductId(v: string | null): v is ProductId {
  return Boolean(v && v in PRODUCTS);
}

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const product = isProductId(productId) ? PRODUCTS[productId] : null;

  const [widgets, setWidgets] = useState<PaymentWidgets | null>(null);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"toss" | "mock" | "loading">("loading");

  const orderId = useMemo(
    () => (product ? createOrderId(product.id) : ""),
    [product],
  );

  useEffect(() => {
    if (!product) return;
    let cancelled = false;

    async function init() {
      setError(null);
      try {
        const cfgRes = await fetch("/api/payments/config", { cache: "no-store" });
        const cfg = await cfgRes.json();
        if (cancelled) return;

        if (!cfg.tossConfigured || !cfg.clientKey) {
          setMode("mock");
          return;
        }

        setMode("toss");
        const tossPayments = await loadTossPayments(cfg.clientKey as string);
        const w = tossPayments.widgets({ customerKey: createCustomerKey() });
        await w.setAmount({ currency: "KRW", value: product!.priceKrw });
        await Promise.all([
          w.renderPaymentMethods({
            selector: "#viago-payment-methods",
            variantKey: "DEFAULT",
          }),
          w.renderAgreement({
            selector: "#viago-payment-agreement",
            variantKey: "AGREEMENT",
          }),
        ]);
        if (!cancelled) {
          setWidgets(w);
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "결제 위젯을 불러오지 못했습니다. 토스 키·도메인을 확인하세요.",
          );
          setMode("mock");
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [product]);

  if (!product) {
    return (
      <div className="mt-8 rounded-2xl bg-white/80 p-5 ring-1 ring-line">
        <p className="text-sm text-coral">상품이 지정되지 않았습니다.</p>
        <Link href="/pricing" className="mt-4 inline-block text-sm font-semibold underline">
          요금제로 돌아가기
        </Link>
      </div>
    );
  }

  async function payWithToss() {
    if (!widgets || !product) return;
    setPaying(true);
    setError(null);
    try {
      savePendingOrder({
        orderId,
        productId: product.id,
        amount: product.priceKrw,
        orderName: product.name,
        createdAt: new Date().toISOString(),
      });

      const origin = window.location.origin;
      await widgets.requestPayment({
        orderId,
        orderName: product.name,
        successUrl: `${origin}/payment/success?orderId=${encodeURIComponent(orderId)}&productId=${encodeURIComponent(product.id)}`,
        failUrl: `${origin}/payment/fail?orderId=${encodeURIComponent(orderId)}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "결제 요청 실패";
      if (!/취소|cancel|closed/i.test(message)) setError(message);
    } finally {
      setPaying(false);
    }
  }

  async function payWithMock() {
    if (!product) return;
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          orderId,
          amount: product.priceKrw,
          orderName: product.name,
          mode: "mock",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "목업 결제 실패");
      router.push(
        `/payment/success?orderId=${encodeURIComponent(data.orderId ?? orderId)}&productId=${encodeURIComponent(product.id)}&mock=1`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "결제 실패");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-line">
        <p className="text-xs font-semibold text-teal-deep">주문 상품</p>
        <h2 className="mt-1 text-lg font-semibold text-[#1E293B]">{product.name}</h2>
        <p className="mt-1 text-sm text-ink-soft">{product.description}</p>
        <p className="mt-4 font-display text-2xl font-bold">{formatKrw(product.priceKrw)}</p>
      </div>

      {mode === "loading" && (
        <p className="inline-flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="size-4 animate-spin" />
          결제 수단 불러오는 중…
        </p>
      )}

      {mode === "toss" && (
        <>
          <div
            id="viago-payment-methods"
            className="min-h-[200px] overflow-hidden rounded-2xl bg-white ring-1 ring-line"
          />
          <div id="viago-payment-agreement" className="rounded-2xl bg-white/80 p-2 ring-1 ring-line" />
          <button
            type="button"
            disabled={!ready || paying}
            onClick={() => void payWithToss()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {paying && <Loader2 className="size-4 animate-spin" />}
            {formatKrw(product.priceKrw)} 결제하기
          </button>
          <p className="text-xs text-ink-soft">
            카드·토스페이·카카오페이 등 가능한 수단은 토스페이먼츠 가맹점 계약·설정에 따라
            표시됩니다. 실정산은 사업자 등록 및 라이브 키 발급 후 계좌로 입금됩니다.
          </p>
        </>
      )}

      {mode === "mock" && (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-semibold">토스 키가 아직 없습니다 (개발 목업 모드)</p>
          <p className="text-xs leading-relaxed">
            토스페이먼츠에서 테스트 키(`test_ck_` / `test_sk_`)를 발급해 Vercel 환경변수에
            넣으면 실제 결제창(카드·간편결제)이 열립니다. 라이브 키와 사업자 등록 전까지는
            실돈이 정산되지 않습니다.
          </p>
          <button
            type="button"
            disabled={paying}
            onClick={() => void payWithMock()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {paying && <Loader2 className="size-4 animate-spin" />}
            목업으로 권한만 활성화
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
          {error}
        </p>
      )}

      <Link href="/pricing" className="inline-block text-sm font-semibold text-ink-soft underline">
        요금제로 돌아가기
      </Link>
    </div>
  );
}
