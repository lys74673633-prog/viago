import { NextResponse } from "next/server";
import { PRODUCTS, type ProductId } from "@/lib/billing/products";
import { getTossSecretKey, isTossConfigured } from "@/lib/payments/toss";

interface ConfirmBody {
  paymentKey?: string;
  orderId?: string;
  amount?: number;
  productId?: ProductId;
}

/**
 * 토스페이먼츠 결제 승인 (서버 전용 secret key).
 * 성공 시 클라이언트가 entitlements를 활성화합니다.
 * 정산 계좌는 토스 가맹점 대시보드에 등록한 계좌로 입금됩니다 (앱에 계좌를 넣지 않음).
 */
export async function POST(request: Request) {
  if (!isTossConfigured()) {
    return NextResponse.json(
      {
        error: "TOSS_NOT_CONFIGURED",
        message:
          "NEXT_PUBLIC_TOSS_CLIENT_KEY / TOSS_SECRET_KEY 가 없습니다. 토스페이먼츠 개발자센터에서 키를 발급하세요.",
      },
      { status: 503 },
    );
  }

  let body: ConfirmBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const paymentKey = body.paymentKey?.trim();
  const orderId = body.orderId?.trim();
  const amount = body.amount;
  const productId = body.productId;

  if (!paymentKey || !orderId || typeof amount !== "number") {
    return NextResponse.json(
      { error: "paymentKey, orderId, amount 가 필요합니다." },
      { status: 400 },
    );
  }

  if (productId && productId in PRODUCTS) {
    const expected = PRODUCTS[productId].priceKrw;
    if (amount !== expected) {
      return NextResponse.json(
        { error: "결제 금액이 상품 가격과 일치하지 않습니다." },
        { status: 400 },
      );
    }
  }

  const secretKey = getTossSecretKey();
  const auth = Buffer.from(`${secretKey}:`).toString("base64");

  try {
    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const message =
        typeof data.message === "string"
          ? data.message
          : "토스 결제 승인에 실패했습니다.";
      return NextResponse.json(
        {
          error: "TOSS_CONFIRM_FAILED",
          message,
          code: data.code,
          detail: data,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: data.status ?? "DONE",
      provider: "tosspayments",
      orderId: data.orderId ?? orderId,
      paymentKey: data.paymentKey ?? paymentKey,
      amount: data.totalAmount ?? amount,
      method: data.method,
      easyPay: data.easyPay,
      approvedAt: data.approvedAt ?? new Date().toISOString(),
      productId: productId ?? null,
      raw: {
        orderName: data.orderName,
        card: data.card,
        easyPay: data.easyPay,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "TOSS_NETWORK_ERROR",
        message: err instanceof Error ? err.message : "토스 API 연결 실패",
      },
      { status: 502 },
    );
  }
}
