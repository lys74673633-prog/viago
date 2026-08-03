import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PerformanceGenerator } from "@/components/performance/PerformanceGenerator";

export const metadata = {
  title: "수행평가 올인원 AI | Viago",
  description:
    "교과 단원과 키워드로 추천 주제, 보고서 초안, 3분 발표 대본, APA 참고문헌까지 생성합니다.",
};

export default function PerformancePage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,#eef8f4_0%,#e8f4f8_45%,#f3faf8_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-32 h-72 w-72 rounded-full bg-citrus/25 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-24 md:px-8 md:pb-20 md:pt-28">
          <PerformanceGenerator />
        </div>
      </main>
      <Footer />
    </>
  );
}
