"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  applyProductPurchase,
  readEntitlementsClient,
  writeEntitlementsClient,
} from "@/lib/billing/entitlements";
import { PRODUCTS, type ProductId } from "@/lib/billing/products";
import {
  clearPendingOrder,
  formatKrw,
  readPendingOrder,
} from "@/lib/payments/toss";

function isProductId(v: string | null): v is ProductId {
  return Boolean(v && v in PRODUCTS);
}

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("결제를 확인하고 있습니다…");
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");
    const productIdParam = searchParams.get("productId");
    const isMock = searchParams.get("mock") === "1";

    const pending = readPendingOrder();
    const productId = isProductId(productIdParam)
      ? productIdParam
      : pending && isProductId(pending.productId)
        ? pending.productId
        : null;

    async function run() {
      // 목업 성공 리다이렉트
      if (isMock && productId && orderId) {
        const next = applyProductPurchase(
          readEntitlementsClient(),
          productId,
          orderId,
        );
        writeEntitlementsClient(next);
        clearPendingOrder();
        setState("ok");
        setMessage("결제가 반영되었습니다 (목업).");
        setDetail(`${PRODUCTS[productId].name} · ${formatKrw(PRODUCTS[productId].priceKrw)}`);
        return;
      }

      if (!paymentKey || !orderId || !amountParam) {
        setState("error");
        setMessage("결제 정보가 부족합니다. 요금제에서 다시 시도해 주세요.");
        return;
      }

      const amount = Number(amountParam);
      if (!Number.isFinite(amount)) {
        setState("error");
        setMessage("결제 금액이 올바르지 않습니다.");
        return;
      }

      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
            productId,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message ?? data.error ?? "결제 승인 실패");
        }

        if (productId) {
          const next = applyProductPurchase(
            readEntitlementsClient(),
            productId,
            String(data.orderId ?? orderId),
          );
          writeEntitlementsClient(next);
        }

        clearPendingOrder();
        setState("ok");
        setMessage("결제가 승인되었습니다.");
        const method =
          typeof data.method === "string"
            ? data.method
            : data.easyPay
              ? "간편결제"
              : "결제";
        setDetail(
          `주문 ${data.orderId ?? orderId} · ${method} · ${formatKrw(Number(data.amount ?? amount))}`,
        );
      } catch (err) {
        setState("error");
        setMessage(err instanceof Error ? err.message : "결제 확인에 실패했습니다.");
      }
    }

    void run();
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white/80 p-6 ring-1 ring-line">
      {state === "loading" && (
        <p className="inline-flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="size-4 animate-spin" />
          {message}
        </p>
      )}

      {state === "ok" && (
        <>
          <p className="inline-flex items-center gap-2 text-[#059669]">
            <CheckCircle2 className="size-5" />
            <span className="font-display text-2xl font-bold text-[#1E293B]">결제 완료</span>
          </p>
          <p className="mt-3 text-sm text-ink">{message}</p>
          {detail && <p className="mt-1 text-sm text-ink-soft">{detail}</p>}
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            라이브 결제 대금은 토스페이먼츠 가맹점에 등록한 정산 계좌로 입금됩니다. 앱에
            계좌번호를 넣을 필요는 없습니다.
          </p>
        </>
      )}

      {state === "error" && (
        <>
          <p className="inline-flex items-center gap-2 text-coral">
            <XCircle className="size-5" />
            <span className="font-display text-2xl font-bold text-[#1E293B]">결제 확인 실패</span>
          </p>
          <p className="mt-3 text-sm text-coral">{message}</p>
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/pricing"
          className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"
        >
          요금제
        </Link>
        <Link
          href="/setuk"
          className="rounded-xl border border-ink/12 px-4 py-2.5 text-sm font-semibold"
        >
          세특 생성기
        </Link>
      </div>
    </div>
  );
}
