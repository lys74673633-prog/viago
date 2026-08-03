import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArchiveBrowser } from "@/components/archive/ArchiveBrowser";

export const metadata = {
  title: "합격생 세특 벤치마킹 | Viago",
  description: "명문대 합격생 세특 사례 아카이브. 프리미엄 회원에게 전문을 제공합니다.",
};

export default function ArchivePage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,#eef8f4_0%,#e8f4f8_50%,#f8fafc_100%)]"
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-24 md:px-8 md:pb-20 md:pt-28">
          <ArchiveBrowser />
        </div>
      </main>
      <Footer />
    </>
  );
}
