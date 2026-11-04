"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Crown, RefreshCw, Users, CreditCard, Eye } from "lucide-react";

type Member = {
  id: string;
  email: string;
  password: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

type Payment = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  amount: number;
  email: string | null;
  userId: string | null;
  provider: string;
  status: string;
  createdAt: string;
};

type Stats = {
  totalHits: number;
  uniqueVisitors: number;
  lastHitAt: string | null;
  memberCount: number;
  paymentCount: number;
  revenueKrw: number;
  premiumTrial: { enabled: boolean; updatedAt: string | null; note: string | null };
  members: Member[];
  payments: Payment[];
};

function formatSeoul(iso: string | null) {
  if (!iso) return "—";
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

function formatKrw(n: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);
}

export function AdminOpsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [trialBusy, setTrialBusy] = useState(false);

  const load = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!res.ok) {
          setError("세션이 만료되었을 수 있습니다. 다시 로그인해 주세요.");
          return;
        }
        const json = (await res.json()) as { data: Stats };
        setStats(json.data);
      } catch {
        setError("통계를 불러오지 못했습니다.");
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleTrial(enabled: boolean) {
    setTrialBusy(true);
    try {
      const res = await fetch("/api/admin/premium-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          note: enabled ? "관리자 콘솔에서 켠 전역 체험" : null,
        }),
      });
      if (!res.ok) {
        setError("프리미엄 체험 설정에 실패했습니다.");
        return;
      }
      load();
    } finally {
      setTrialBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            회원·결제·체험
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            접속 수, 가입 명단, 결제자, 전역 프리미엄 체험을 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink hover:bg-fog disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${pending ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Eye className="size-4" />}
          label="총 접속"
          value={stats ? String(stats.totalHits) : "…"}
        />
        <StatCard
          icon={<Eye className="size-4" />}
          label="고유 방문자"
          value={stats ? String(stats.uniqueVisitors) : "…"}
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="회원"
          value={stats ? String(stats.memberCount) : "…"}
        />
        <StatCard
          icon={<CreditCard className="size-4" />}
          label="결제 건수 / 합계"
          value={
            stats
              ? `${stats.paymentCount} · ${formatKrw(stats.revenueKrw)}`
              : "…"
          }
        />
      </section>

      <p className="text-xs text-ink-soft">
        최근 접속: {formatSeoul(stats?.lastHitAt ?? null)} (Asia/Seoul)
      </p>

      <section className="rounded-2xl border border-ink/8 bg-white/85 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-citrus/60 text-ink">
              <Crown className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                프리미엄 기능 체험
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                켜면 모든 방문자가 결제 없이 프리미엄 기능(문서변환·클리닝·합격사례·학부모
                리포트)을 쓸 수 있습니다.
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                상태:{" "}
                <strong className="text-ink">
                  {stats?.premiumTrial.enabled ? "ON" : "OFF"}
                </strong>
                {stats?.premiumTrial.updatedAt
                  ? ` · ${formatSeoul(stats.premiumTrial.updatedAt)}`
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={trialBusy || stats?.premiumTrial.enabled}
              onClick={() => void toggleTrial(true)}
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-40"
            >
              체험 켜기
            </button>
            <button
              type="button"
              disabled={trialBusy || !stats?.premiumTrial.enabled}
              onClick={() => void toggleTrial(false)}
              className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-fog disabled:opacity-40"
            >
              체험 끄기
            </button>
            <Link
              href="/archive"
              className="rounded-xl border border-teal/30 bg-mint/50 px-4 py-2.5 text-sm font-semibold text-teal-deep"
            >
              기능 열어보기
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white/85 p-5">
        <h2 className="font-display text-lg font-bold text-ink">회원가입 명단</h2>
        <p className="mt-1 text-xs text-ink-soft">
          로컬 가입/로그인 시 아이디(이메일)·비밀번호가 관리자 저장소에 동기화됩니다. Supabase
          소셜 로그인은 비밀번호가 없습니다.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-soft">
                <th className="py-2 pr-3 font-semibold">이메일(아이디)</th>
                <th className="py-2 pr-3 font-semibold">비밀번호</th>
                <th className="py-2 pr-3 font-semibold">출처</th>
                <th className="py-2 font-semibold">가입/갱신</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.members ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-ink-soft">
                    아직 동기화된 회원이 없습니다. /signup 에서 가입하면 여기에 나타납니다.
                  </td>
                </tr>
              ) : (
                stats!.members.map((m) => (
                  <tr key={m.id} className="border-b border-ink/6 align-top">
                    <td className="py-3 pr-3 font-medium text-ink">{m.email}</td>
                    <td className="py-3 pr-3 font-mono text-xs text-ink">{m.password}</td>
                    <td className="py-3 pr-3 text-ink-soft">{m.source}</td>
                    <td className="py-3 text-xs text-ink-soft">
                      {formatSeoul(m.createdAt)}
                      <br />
                      <span className="opacity-70">{formatSeoul(m.updatedAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white/85 p-5">
        <h2 className="font-display text-lg font-bold text-ink">결제자 명단</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink-soft">
                <th className="py-2 pr-3 font-semibold">시각</th>
                <th className="py-2 pr-3 font-semibold">주문자</th>
                <th className="py-2 pr-3 font-semibold">상품</th>
                <th className="py-2 pr-3 font-semibold">금액</th>
                <th className="py-2 pr-3 font-semibold">수단</th>
                <th className="py-2 font-semibold">주문번호</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.payments ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-ink-soft">
                    아직 결제 기록이 없습니다. /pricing 에서 결제(목업 포함)하면 기록됩니다.
                  </td>
                </tr>
              ) : (
                stats!.payments.map((p) => (
                  <tr key={p.id} className="border-b border-ink/6 align-top">
                    <td className="py-3 pr-3 text-xs text-ink-soft">
                      {formatSeoul(p.createdAt)}
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-medium text-ink">{p.email ?? "비회원/미상"}</p>
                      {p.userId ? (
                        <p className="font-mono text-[10px] text-ink-soft">{p.userId}</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 text-ink">{p.productName}</td>
                    <td className="py-3 pr-3 font-semibold text-ink">
                      {formatKrw(p.amount)}
                    </td>
                    <td className="py-3 pr-3 text-ink-soft">{p.provider}</td>
                    <td className="py-3 font-mono text-[11px] text-ink-soft">{p.orderId}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white/85 px-4 py-4">
      <div className="flex items-center gap-2 text-ink-soft">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
