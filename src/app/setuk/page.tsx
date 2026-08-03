import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SetukGenerator } from "@/components/setuk/SetukForm";

export const metadata = {
  title: "세특 AI 생성기 | StudyPilot AI",
  description: "과목·키워드·역할을 입력해 학업·진로·공동체 역량 세특 문장을 생성하세요.",
};

export default function SetukPage() {
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
          className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-teal/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-24 md:px-8 md:pb-20 md:pt-28">
          <SetukGenerator />
        </div>
      </main>
      <Footer />
    </>
  );
}
