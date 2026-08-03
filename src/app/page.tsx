import Link from "next/link";
import { BookOpen, Layers3, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";

const steps = [
  {
    icon: BookOpen,
    title: "활동만 짧게 적기",
    body: "과목, 키워드, 역할과 느낀 점을 입력하면 됩니다.",
  },
  {
    icon: Layers3,
    title: "3가지 역량 버전",
    body: "학업·진로·공동체 관점으로 세특 문장을 동시에 받아보세요.",
  },
  {
    icon: ShieldCheck,
    title: "일일 무료 5회",
    body: "가입 없이도 MVP를 바로 써 보고, 필요할 때 로그인하세요.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />

        <section className="relative border-t border-line bg-white/50">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
              세특 작성, 이렇게 단순해집니다
            </h2>
            <p className="mt-3 max-w-xl text-ink-soft">
              막연한 활동을 생기부에 맞는 문장으로 정리하는 데 집중한 플로우입니다.
            </p>

            <ul className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {steps.map(({ icon: Icon, title, body }, index) => (
                <li key={title} className="relative">
                  <span className="font-display text-sm font-bold text-teal">
                    0{index + 1}
                  </span>
                  <div className="mt-3 flex items-start gap-3">
                    <Icon className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden />
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        {body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-wrap gap-3">
              <Link
                href="/setuk"
                className="inline-flex rounded-xl bg-teal px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-deep"
              >
                세특 생성기 열기
              </Link>
              <Link
                href="/performance"
                className="inline-flex rounded-xl border border-ink/15 bg-white/70 px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-ink/30"
              >
                수행평가 올인원 AI
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
