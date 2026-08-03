import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthNav } from "@/components/auth/AuthNav";
import { BillingStatusChip } from "@/components/billing/BillingStatusChip";
import { Logo } from "@/components/Logo";

const navLinkClass =
  "rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft transition hover:text-ink";

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 md:px-8">
        <Link
          href="/"
          className="shrink-0 rounded-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/40"
          aria-label="Viago 홈"
        >
          <Logo size="md" />
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5">
          <Link href="/archive" className={`hidden lg:inline ${navLinkClass}`}>
            합격사례
          </Link>
          <Link href="/performance" className={`hidden sm:inline ${navLinkClass}`}>
            수행평가
          </Link>
          <Link href="/parent-report" className={`hidden md:inline ${navLinkClass}`}>
            학부모
          </Link>
          <Link href="/pricing" className={`hidden sm:inline ${navLinkClass}`}>
            요금제
          </Link>

          <BillingStatusChip />
          <AuthNav />

          <Link
            href="/setuk"
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-ink-soft"
          >
            <Sparkles className="size-3.5" aria-hidden />
            세특
          </Link>
        </nav>
      </div>
    </header>
  );
}
