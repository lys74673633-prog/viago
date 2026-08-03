import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthPageClient } from "@/components/auth/AuthPageClient";

export const metadata = {
  title: "회원가입 | Viago",
};

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(160deg,#e8f4f8,#d8f3ee_50%,#f3faf8)]"
        />
        <div className="relative mx-auto flex max-w-md flex-col px-5 pb-16 pt-28 md:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">회원가입</h1>
          <p className="mt-2 text-sm text-ink-soft">
            카카오·네이버·구글·애플로 바로 시작하거나 이메일로 가입하세요. 이미 계정이 있다면{" "}
            <Link href="/login" className="font-semibold text-teal hover:underline">
              로그인
            </Link>
          </p>
          <div className="mt-8">
            <AuthPageClient mode="signup" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
