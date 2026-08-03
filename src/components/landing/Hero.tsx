import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Full-bleed atmospheric plane */}
      <div
        aria-hidden
        className="animate-shimmer absolute inset-0 bg-[linear-gradient(135deg,#e8f4f8_0%,#d8f3ee_42%,#c5e8f0_70%,#eef8f4_100%)]"
      />
      <div
        aria-hidden
        className="animate-drift absolute -right-[18%] top-[-10%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle_at_center,rgb(15_118_110/0.22),transparent_68%)]"
      />
      <div
        aria-hidden
        className="animate-pulse-soft absolute -left-[12%] bottom-[-8%] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle_at_center,rgb(212_240_90/0.35),transparent_65%)]"
      />

      {/* Dominant visual: stylized student-record document plane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[38%] md:left-[46%] md:top-[12%] md:right-[-4%]"
      >
        <div className="relative mx-auto h-full max-w-xl md:mx-0 md:max-w-none md:h-[78%]">
          <div className="absolute inset-[8%_6%_0] rotate-[-4deg] rounded-[2px] bg-white/55 shadow-[0_30px_80px_rgb(11_36_52/0.12)] ring-1 ring-ink/10 backdrop-blur-[2px] md:inset-[6%_10%_8%_0]" />
          <div className="absolute inset-[12%_10%_4%_12%] rotate-[2.5deg] rounded-[2px] bg-[#f7fcfb] shadow-[0_24px_60px_rgb(11_36_52/0.14)] ring-1 ring-ink/10 md:inset-[10%_14%_12%_6%]">
            <div className="absolute inset-x-[10%] top-[12%] h-[3px] bg-teal/80" />
            <div className="absolute inset-x-[10%] top-[22%] space-y-3">
              <div className="h-2 w-[42%] bg-ink/15" />
              <div className="h-2 w-[88%] bg-ink/10" />
              <div className="h-2 w-[76%] bg-ink/10" />
              <div className="h-2 w-[84%] bg-ink/8" />
              <div className="mt-6 h-2 w-[36%] bg-coral/50" />
              <div className="h-2 w-[80%] bg-ink/10" />
              <div className="h-2 w-[70%] bg-ink/10" />
            </div>
            <div className="absolute bottom-[14%] left-[10%] right-[10%] h-16 bg-[linear-gradient(90deg,rgb(15_118_110/0.12),rgb(212_240_90/0.25),rgb(255_107_74/0.12))]" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-28 pt-28 md:px-8 md:pb-24">
        <div className="max-w-xl md:max-w-lg">
          <p className="animate-rise font-display text-4xl font-bold tracking-tight text-[#1E293B] sm:text-5xl md:text-6xl">
            Viago
          </p>
          <h1 className="animate-rise-delay-1 mt-5 text-balance text-2xl font-semibold leading-snug tracking-tight text-ink sm:text-3xl md:text-[2.15rem]">
            키워드만 넣으면, 생기부 세특 문장이 완성됩니다
          </h1>
          <p className="animate-rise-delay-2 mt-4 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
            학업·진로·공동체 역량 버전으로 한 번에. 고등학생 세특·수행평가의
            막막함을 줄여 주는 AI 코파일럿.
          </p>

          <div className="animate-rise-delay-2 mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/setuk"
              className="group inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgb(11_36_52/0.22)] transition hover:-translate-y-0.5 hover:bg-ink-soft"
            >
              무료로 세특 작성하기
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-xl border border-ink/15 bg-white/50 px-5 py-3.5 text-sm font-semibold text-ink backdrop-blur-sm transition hover:border-ink/30 hover:bg-white/80"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
