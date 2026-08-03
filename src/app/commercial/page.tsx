import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "상용화 체크리스트 | Viago",
  description: "소셜 로그인·토스/카카오페이 실결제·정산을 위한 준비 순서",
};

export default function CommercialPage() {
  return (
    <>
      <Header />
      <main className="relative flex-1 px-5 pb-16 pt-28 md:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#1E293B]">
              상용화 준비 체크리스트
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              앱 코드에는 토스페이먼츠 실결제·소셜 로그인 연동이 들어가 있습니다. 다만{" "}
              <strong className="text-ink">사업자등록·가맹점 승인·OAuth 앱 등록</strong>은
              운영자 계정에서만 완료할 수 있습니다. 계좌번호는 채팅/코드에 넣지 말고, 토스
              가맹점 정산 설정에 등록하세요.
            </p>
          </div>

          <section className="space-y-3 rounded-2xl bg-white/80 p-5 ring-1 ring-line">
            <h2 className="font-semibold text-[#1E293B]">1) 간편결제 (토스·카카오페이)</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-soft">
              <li>
                <a
                  className="font-semibold text-teal underline"
                  href="https://developers.tosspayments.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  토스페이먼츠 개발자센터
                </a>
                에서 상점 생성
              </li>
              <li>테스트 키(`test_ck_` / `test_sk_`)로 결제창·승인 플로우 검증</li>
              <li>사업자등록 후 라이브 키 발급 + 카드/토스페이/카카오페이 등 수단 활성화</li>
              <li>정산 계좌를 토스 가맹점 대시보드에 등록 (나중에 알려주신 계좌)</li>
              <li>
                Vercel env: `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`,
                `NEXT_PUBLIC_APP_URL=https://viago-two.vercel.app`
              </li>
            </ol>
            <p className="text-xs text-ink-soft">
              카카오페이는 별도 SDK를 중복 붙이지 않고, 토스페이먼츠 결제위젯의 간편결제
              수단으로 제공합니다 (가맹점 계약에 포함 시).
            </p>
          </section>

          <section className="space-y-3 rounded-2xl bg-white/80 p-5 ring-1 ring-line">
            <h2 className="font-semibold text-[#1E293B]">2) 소셜 자동 로그인</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-soft">
              <li>Supabase 프로젝트 생성 (유효한 Project URL)</li>
              <li>
                Google / Kakao / Apple: Supabase → Authentication → Providers 에서 Enable +
                각 개발자 콘솔 Client ID/Secret
              </li>
              <li>
                네이버: `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` /
                `SUPABASE_SERVICE_ROLE_KEY`
              </li>
              <li>
                Redirect URL에 `https://viago-two.vercel.app/auth/callback` 및 네이버
                콜백 등록
              </li>
            </ol>
            <Link href="/setup" className="text-sm font-semibold text-teal underline">
              /setup 가이드 보기
            </Link>
          </section>

          <section className="space-y-3 rounded-2xl bg-amber-50 p-5 text-sm text-amber-950 ring-1 ring-amber-200">
            <h2 className="font-semibold">사업자등록 전 현실</h2>
            <p className="text-xs leading-relaxed">
              사업자 없이 라이브 키·실정산·카카오/토스 가맹 승인은 보통 불가합니다. 지금은
              앱·테스트 결제까지 완성하고, 사업자 나온 뒤 라이브 키와 정산 계좌만 바꾸면
              실돈이 들어오도록 설계되어 있습니다.
            </p>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"
            >
              요금제·결제 보기
            </Link>
            <Link
              href="/checkout?productId=premium_monthly"
              className="rounded-xl border border-ink/12 px-4 py-2.5 text-sm font-semibold"
            >
              체크아웃 미리보기
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
