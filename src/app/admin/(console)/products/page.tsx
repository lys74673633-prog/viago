import Link from "next/link";
import { buildAdminOverview } from "@/lib/admin/overview";

function formatKrw(n: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function AdminProductsPage() {
  const overview = await buildAdminOverview();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            상품·결제
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            `src/lib/billing/products.ts` 기준 카탈로그입니다.
          </p>
        </div>
        <Link
          href="/pricing"
          className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft"
        >
          공개 요금제 보기
        </Link>
      </div>

      <div className="rounded-2xl border border-ink/8 bg-white/85 px-4 py-3 text-sm text-ink-soft">
        결제 모드:{" "}
        <strong className="text-ink">
          {!overview.services.toss.configured
            ? "목업"
            : overview.services.toss.live
              ? "토스 라이브"
              : "토스 테스트"}
        </strong>
        {overview.services.toss.allowMock ? " · 목업 허용" : " · 목업 차단"}
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {overview.products.map((p) => (
          <li
            key={p.id}
            className="flex flex-col rounded-2xl border border-ink/8 bg-white/85 p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-mono text-ink-soft">{p.id}</p>
                <h2 className="mt-1 font-display text-xl font-bold text-ink">{p.name}</h2>
              </div>
              {p.badge ? (
                <span className="rounded-md bg-teal/15 px-2 py-0.5 text-[11px] font-bold text-teal-deep">
                  {p.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
              {p.description}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="font-display text-2xl font-bold text-ink">
                {formatKrw(p.priceKrw)}
              </p>
              <Link
                href={`/checkout?productId=${encodeURIComponent(p.id)}`}
                className="rounded-lg border border-ink/12 px-3 py-2 text-xs font-semibold text-ink hover:bg-fog"
              >
                체크아웃 미리보기
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
