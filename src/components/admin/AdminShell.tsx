"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  LogOut,
  Package,
  Shield,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/admin/ops", label: "회원·결제", icon: Users },
  { href: "/admin/checklist", label: "상용화", icon: ListChecks },
  { href: "/admin/products", label: "상품", icon: Package },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(165deg,#eef6f4_0%,#f7faf9_42%,#e8f0f4_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-white/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40">
              <Logo size="sm" />
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
              <Shield className="size-3.5" aria-hidden />
              ADMIN
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-1">
            {NAV.map(({ href, label, icon: Icon, ...rest }) => {
              const exact = "exact" in rest && rest.exact;
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-teal/10 text-teal-deep"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => void logout()}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-coral/10 hover:text-coral"
            >
              <LogOut className="size-3.5" aria-hidden />
              로그아웃
            </button>
          </nav>
        </header>

        <main className="mt-6 flex-1 animate-rise">{children}</main>
      </div>
    </div>
  );
}
