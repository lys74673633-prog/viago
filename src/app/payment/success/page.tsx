import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "결제 완료 | Viago" };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; productId?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <Header />
      <main className="relative flex-1 px-5 pb-16 pt-28 md:px-8">
        <div className="mx-auto max-w-lg rounded-2xl bg-white/80 p-6 ring-1 ring-line">
          <h1 className="font-display text-2xl font-bold text-[#1E293B]">결제가 완료되었습니다</h1>
          <p className="mt-2 text-sm text-ink-soft">
            주문번호: {params.orderId ?? "-"}
            <br />
            상품: {params.productId ?? "-"}
          </p>
          <p className="mt-4 text-sm text-ink">
            목업 환경에서는 요금제 페이지의 ‘목업 결제하기’가 권한을 바로 활성화합니다. 실제
            토스 연동 시 이 페이지에서 paymentKey를 서버로 넘겨 confirm합니다.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/pricing"
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"
            >
              요금제로 이동
            </Link>
            <Link
              href="/setuk"
              className="rounded-xl border border-ink/12 px-4 py-2.5 text-sm font-semibold"
            >
              세특 생성기
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
