import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OAuthSetupGuide } from "@/components/setup/OAuthSetupGuide";
import { SetupEnvForm } from "@/components/setup/SetupEnvForm";

export const metadata = {
  title: "Supabase 연결 설정 | Viago",
};

export default function SetupPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(160deg,#e8f4f8,#eef8f4_50%,#f8fafc)]"
        />
        <div className="relative mx-auto max-w-xl px-5 pb-16 pt-28 md:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#1E293B]">
            Supabase 연결
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Failed to fetch 가 나면 대부분 Project URL 오타(DNS 실패)입니다. 대시보드에서
            URL·anon 키를 다시 복사해 저장하세요. 저장 시 연결을 검증합니다.
          </p>
          <SetupEnvForm />
          <OAuthSetupGuide />
        </div>
      </main>
      <Footer />
    </>
  );
}
