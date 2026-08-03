import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthPageClient } from "@/components/auth/AuthPageClient";

export const metadata = {
  title: "로그인 | Viago",
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(160deg,#e8f4f8,#d8f3ee_50%,#f3faf8)]"
        />
        <div className="relative mx-auto flex max-w-md flex-col px-5 pb-16 pt-28 md:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">로그인</h1>
          <p className="mt-2 text-sm text-ink-soft">
            소셜 계정 또는 이메일로 로그인하세요. 계정이 없다면{" "}
            <Link href="/signup" className="font-semibold text-teal hover:underline">
              회원가입
            </Link>
          </p>
          <div className="mt-8">
            <AuthPageClient mode="login" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
