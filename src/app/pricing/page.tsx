import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PricingClient } from "@/components/billing/PricingClient";

export const metadata = {
  title: "요금제 | Viago",
  description: "프리미엄 구독과 단건 결제(문서 변환·클리닝·학부모 리포트) 요금제",
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(160deg,#e8f4f8,#eef8f4_50%,#f8fafc)]"
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-24 md:px-8 md:pt-28">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#1E293B]">
            요금제
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            토스페이먼츠 목업으로 바로 체험할 수 있어요. 실제 결제 연동 시 동일 상품 ID를
            사용합니다.
          </p>
          <PricingClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
