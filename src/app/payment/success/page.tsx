import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PaymentSuccessClient } from "@/components/billing/PaymentSuccessClient";

export const metadata = { title: "결제 완료 | Viago" };

export default function PaymentSuccessPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 px-5 pb-16 pt-28 md:px-8">
        <Suspense
          fallback={<p className="mx-auto max-w-lg text-sm text-ink-soft">결제 확인 중…</p>}
        >
          <PaymentSuccessClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
