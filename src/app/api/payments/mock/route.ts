import { NextResponse } from "next/server";
import { PRODUCTS, type ProductId } from "@/lib/billing/products";
import { allowMockPayments } from "@/lib/payments/toss";

interface MockBody {
  productId?: ProductId;
  orderId?: string;
  amount?: number;
  orderName?: string;
  mode?: "mock" | "toss";
}

/**
 * 개발용 목업 승인. 토스 키가 있으면 /api/payments/confirm 을 사용하세요.
 */
export async function POST(request: Request) {
  if (!allowMockPayments()) {
    return NextResponse.json(
      {
        error: "MOCK_DISABLED",
        message: "목업 결제가 비활성화되어 있습니다. 토스 실결제를 사용하세요.",
      },
      { status: 403 },
    );
  }

  let body: MockBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const productId = body.productId;
  if (!productId || !(productId in PRODUCTS)) {
    return NextResponse.json({ error: "알 수 없는 상품입니다." }, { status: 400 });
  }

  const product = PRODUCTS[productId];
  if (typeof body.amount === "number" && body.amount !== product.priceKrw) {
    return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });
  }

  // 목업: 즉시 승인
  await new Promise((r) => setTimeout(r, 400));

  return NextResponse.json({
    ok: true,
    status: "DONE",
    provider: body.mode === "toss" ? "toss-mock" : "mock",
    orderId: body.orderId ?? `viago_mock_${Date.now()}`,
    productId,
    amount: product.priceKrw,
    orderName: product.name,
    approvedAt: new Date().toISOString(),
    message: "목업 결제가 승인되었습니다. 클라이언트에서 권한을 활성화하세요.",
  });
}
