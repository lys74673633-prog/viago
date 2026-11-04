import { NextResponse } from "next/server";
import { PRODUCTS, type ProductId } from "@/lib/billing/products";
import { recordPayment } from "@/lib/admin/store";

export async function POST(request: Request) {
  let body: {
    orderId?: string;
    productId?: string;
    amount?: number;
    email?: string | null;
    userId?: string | null;
    provider?: string;
    status?: "DONE" | "FAILED";
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  const productId = body.productId?.trim();
  if (!orderId || !productId) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }

  const product = productId in PRODUCTS ? PRODUCTS[productId as ProductId] : null;
  const amount =
    typeof body.amount === "number" ? body.amount : (product?.priceKrw ?? 0);

  try {
    const row = await recordPayment({
      orderId,
      productId,
      productName: product?.name ?? productId,
      amount,
      email: body.email ?? null,
      userId: body.userId ?? null,
      provider: body.provider ?? "client",
      status: body.status ?? "DONE",
    });

    return NextResponse.json({ ok: true, payment: row });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "PAYMENT_WRITE_FAILED",
        message: err instanceof Error ? err.message : "저장 실패",
      },
      { status: 500 },
    );
  }
}
