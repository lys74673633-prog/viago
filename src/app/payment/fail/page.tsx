import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "결제 실패 | Viago" };

export default function PaymentFailPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 px-5 pb-16 pt-28 md:px-8">
        <div className="mx-auto max-w-lg rounded-2xl bg-white/80 p-6 ring-1 ring-line">
          <h1 className="font-display text-2xl font-bold text-[#1E293B]">결제가 취소되었습니다</h1>
          <p className="mt-2 text-sm text-ink-soft">
            결제를 다시 시도하거나, 요금제 페이지에서 다른 상품을 선택해 주세요.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"
          >
            요금제로 돌아가기
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
