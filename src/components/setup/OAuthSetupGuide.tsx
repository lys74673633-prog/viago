export function OAuthSetupGuide() {
  return (
    <section className="mt-10 space-y-4 rounded-2xl bg-white/75 p-5 text-sm text-ink ring-1 ring-line">
      <h2 className="font-display text-lg font-bold text-[#1E293B]">
        소셜 로그인 Provider 설정 가이드
      </h2>
      <p className="text-ink-soft">
        공통: Supabase →{" "}
        <strong>Authentication → URL Configuration</strong> 에 아래 Redirect URL을
        추가하세요.
      </p>
      <pre className="overflow-x-auto rounded-xl bg-ink/[0.04] p-3 text-[11px] leading-relaxed">
        {`http://localhost:3000/auth/callback
https://YOUR_DOMAIN/auth/callback
http://localhost:3000/api/auth/oauth/naver/callback`}
      </pre>

      <div className="space-y-3">
        <GuideBlock
          title="1) Google"
          body={`Supabase → Authentication → Providers → Google → Enable
Google Cloud Console OAuth 클라이언트 ID/시크릿을 넣고 Redirect URI에
https://YOUR_PROJECT.supabase.co/auth/v1/callback 를 등록합니다.`}
        />
        <GuideBlock
          title="2) 카카오톡 (Kakao)"
          body={`Supabase → Providers → Kakao → Enable
Kakao Developers에서 REST API 키·Client Secret을 발급하고,
Redirect URI에 https://YOUR_PROJECT.supabase.co/auth/v1/callback 을 등록합니다.
카카오 로그인·이메일 동의를 활성화하세요.`}
        />
        <GuideBlock
          title="3) Apple"
          body={`Supabase → Providers → Apple → Enable
Apple Developer에서 Services ID, Key(p8), Team ID, Key ID를 설정합니다.
로컬 테스트는 HTTPS/실디바이스가 필요할 수 있습니다.`}
        />
        <GuideBlock
          title="4) 네이버 (커스텀 OAuth)"
          body={`네이버는 Supabase 네이티브 Provider가 없어 Viago API 라우트로 연동합니다.
1. 네이버 개발자센터에서 애플리케이션 등록
2. Callback URL: http://localhost:3000/api/auth/oauth/naver/callback
3. .env.local 에 추가:
   NAVER_CLIENT_ID=...
   NAVER_CLIENT_SECRET=...
   SUPABASE_SERVICE_ROLE_KEY=...  (세션 생성용)
4. 서버 재시작 후 /login 에서 '네이버로 계속' 클릭`}
        />
      </div>
    </section>
  );
}

function GuideBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-semibold text-ink">{title}</h3>
      <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-ink/[0.03] p-3 text-[11px] leading-relaxed text-ink-soft">
        {body}
      </pre>
    </div>
  );
}
