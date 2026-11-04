import Link from "next/link";
import { StatusPill } from "@/components/admin/StatusPill";
import { buildAdminOverview } from "@/lib/admin/overview";

const MANUAL = [
  {
    title: "1. 간편결제 (토스·카카오페이)",
    steps: [
      "토스페이먼츠 개발자센터에서 상점 생성",
      "테스트 키로 결제창·승인 플로우 검증",
      "사업자등록 후 라이브 키 + 결제수단 활성화",
      "정산 계좌를 토스 가맹점 대시보드에 등록",
      "Vercel env에 토스 키·NEXT_PUBLIC_APP_URL 반영",
    ],
  },
  {
    title: "2. 소셜 로그인",
    steps: [
      "Supabase 프로젝트 생성",
      "Google / Kakao / Apple Providers Enable",
      "네이버: NAVER_CLIENT_ID / SECRET + SERVICE_ROLE_KEY",
      "Redirect URL에 /auth/callback 등록",
    ],
  },
  {
    title: "3. AI·쿼터",
    steps: [
      "OPENAI_API_KEY 또는 GEMINI_API_KEY 설정",
      "DAILY_FREE_LIMIT 확인 (기본 5)",
      "프로덕션에서 ALLOW_MOCK_PAYMENTS=false",
    ],
  },
] as const;

export default function AdminChecklistPage() {
  const overview = buildAdminOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          상용화 체크리스트
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          env 자동 감지 항목과 운영자 수동 작업을 함께 봅니다. 공개 가이드:{" "}
          <Link href="/commercial" className="font-semibold text-teal hover:underline">
            /commercial
          </Link>
        </p>
      </div>

      <section className="rounded-2xl border border-ink/8 bg-white/85 p-5">
        <h2 className="font-display text-lg font-bold text-ink">자동 감지</h2>
        <ul className="mt-4 space-y-3">
          {overview.checklist.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/8 bg-fog/50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{item.detail}</p>
              </div>
              <StatusPill status={item.status} />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {MANUAL.map((block) => (
          <article
            key={block.title}
            className="rounded-2xl border border-ink/8 bg-white/85 p-5"
          >
            <h2 className="font-display text-base font-bold text-ink">{block.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-relaxed text-ink-soft">
              {block.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    </div>
  );
}
