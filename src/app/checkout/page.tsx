import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckoutClient } from "@/components/billing/CheckoutClient";

export const metadata = {
  title: "결제 | Viago",
  description: "토스페이·카카오페이·카드 등 간편결제로 Viago 상품을 결제합니다.",
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 px-5 pb-16 pt-28 md:px-8">
        <div className="mx-auto max-w-lg">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#1E293B]">
            결제하기
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            토스페이먼츠 결제창에서 카드·토스페이·카카오페이 등 원하는 수단을 선택할 수
            있습니다.
          </p>
          <Suspense fallback={<p className="mt-8 text-sm text-ink-soft">결제 준비 중…</p>}>
            <CheckoutClient />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
