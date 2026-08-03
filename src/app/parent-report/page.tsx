import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParentReportDashboard } from "@/components/parent/ParentReportDashboard";

export const metadata = {
  title: "학부모 입시 진단 리포트 | Viago",
  description: "모의고사·생기부 데이터로 학부모가 읽기 쉬운 대입 가능성 리포트를 발급합니다.",
};

export default function ParentReportPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,#f8fafc_0%,#e8f4f8_45%,#eef8f4_100%)]"
        />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-24 md:px-8 md:pb-20 md:pt-28">
          <ParentReportDashboard />
        </div>
      </main>
      <Footer />
    </>
  );
}
