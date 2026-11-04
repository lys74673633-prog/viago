"use client";

import Link from "next/link";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { AdminOverview } from "@/lib/admin/overview";
import { StatusPill } from "@/components/admin/StatusPill";

function formatKrw(n: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatSeoul(iso: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminDashboardClient({ initial }: { initial: AdminOverview }) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/overview", { cache: "no-store" });
        if (!res.ok) {
          setError("세션이 만료되었을 수 있습니다. 다시 로그인해 주세요.");
          return;
        }
        const json = (await res.json()) as { data: AdminOverview };
        setData(json.data);
      } catch {
        setError("상태를 불러오지 못했습니다.");
      }
    });
  }, []);

  useEffect(() => {
    setData(initial);
  }, [initial]);

  const okCount = data.checklist.filter((c) => c.status === "ok").length;
  const warnCount = data.checklist.filter((c) => c.status === "warn").length;
  const missingCount = data.checklist.filter((c) => c.status === "missing").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            운영 대시보드
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            {data.appUrl} · 갱신 {formatSeoul(data.generatedAt)} (Asia/Seoul)
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink transition hover:bg-fog disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${pending ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "고유 방문자",
            value: String(data.live.uniqueVisitors),
            tone: "text-ink bg-white",
          },
          {
            label: "회원",
            value: String(data.live.memberCount),
            tone: "text-teal-deep bg-mint/70",
          },
          {
            label: "결제",
            value: String(data.live.paymentCount),
            tone: "text-ink bg-citrus/40",
          },
          {
            label: "프리미엄 체험",
            value: data.live.premiumTrial ? "ON" : "OFF",
            tone: data.live.premiumTrial
              ? "text-teal-deep bg-mint/70"
              : "text-ink bg-white",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border border-ink/8 px-4 py-4 ${s.tone}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {s.label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </section>

      <p className="text-xs text-ink-soft">
        연동 점검 · 정상 {okCount} · 주의 {warnCount} · 미설정 {missingCount} · 일일 무료{" "}
        {data.dailyFreeLimit}회 ·{" "}
        <Link href="/admin/ops" className="font-semibold text-teal hover:underline">
          회원·결제 명단 보기
        </Link>
      </p>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-ink/8 bg-white/85 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink">연동 상태</h2>
            <Link href="/admin/checklist" className="text-xs font-semibold text-teal hover:underline">
              상용화 전체 보기
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-ink/8">
            {data.checklist.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{item.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill status={item.status} />
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="rounded-md p-1 text-ink-soft hover:bg-fog hover:text-ink"
                      aria-label={`${item.label} 바로가기`}
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-ink/8 bg-white/85 p-5">
            <h2 className="font-display text-lg font-bold text-ink">서비스 스냅샷</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">AI</dt>
                <dd className="font-semibold text-ink">
                  {data.services.ai.provider ?? "데모 폴백"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">토스</dt>
                <dd className="font-semibold text-ink">
                  {!data.services.toss.configured
                    ? "미연결"
                    : data.services.toss.live
                      ? "라이브"
                      : "테스트"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Supabase</dt>
                <dd className="font-semibold text-ink">
                  {data.services.supabase.configured ? "연결" : "로컬 폴백"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">목업 결제</dt>
                <dd className="font-semibold text-ink">
                  {data.services.toss.allowMock ? "허용" : "차단"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-ink/8 bg-ink px-5 py-5 text-white">
            <h2 className="font-display text-lg font-bold">빠른 이동</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {data.routes.slice(0, 6).map((r) => (
                <li key={r.path}>
                  <Link
                    href={r.path}
                    className="block rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/20"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white/85 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-ink">상품</h2>
          <Link href="/admin/products" className="text-xs font-semibold text-teal hover:underline">
            상세
          </Link>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.products.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-ink/8 bg-fog/60 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{p.name}</p>
                {p.badge ? (
                  <span className="rounded bg-teal/15 px-1.5 py-0.5 text-[10px] font-bold text-teal-deep">
                    {p.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-ink-soft">{p.description}</p>
              <p className="mt-2 font-display text-lg font-bold text-ink">
                {formatKrw(p.priceKrw)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
