import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-10 text-center md:px-8 md:py-12">
        {/* 브랜드 블록 — 여유 패딩으로 잘림 방지, 중앙 정렬 */}
        <div className="flex w-full flex-col items-center justify-center px-2 py-3">
          <Link
            href="/"
            aria-label="Viago 홈"
            className="inline-flex items-center justify-center rounded-lg px-2 py-2 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/40"
          >
            <Logo size="md" />
          </Link>
          <p className="mt-2.5 max-w-xs text-[13px] font-medium leading-relaxed text-slate-400">
            고등학생을 위한 세특·수행평가 코파일럿
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
          <Link href="/setuk" className="transition hover:text-[#0F172A]">
            세특 생성기
          </Link>
          <Link href="/performance" className="transition hover:text-[#0F172A]">
            수행평가 AI
          </Link>
          <Link href="/archive" className="transition hover:text-[#0F172A]">
            합격사례
          </Link>
          <Link href="/parent-report" className="transition hover:text-[#0F172A]">
            학부모 리포트
          </Link>
          <Link href="/pricing" className="transition hover:text-[#0F172A]">
            요금제
          </Link>
        </nav>
      </div>
    </footer>
  );
}
