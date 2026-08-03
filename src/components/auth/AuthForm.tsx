"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useAuth } from "@/contexts/AuthContext";
import { localSignIn, localSignUp } from "@/lib/auth/local";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode: authMode, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagHint, setDiagHint] = useState<string | null>(null);
  const [usingLocal, setUsingLocal] = useState(authMode === "local");

  useEffect(() => {
    setUsingLocal(authMode === "local");
  }, [authMode]);

  useEffect(() => {
    const qErr = searchParams.get("error");
    if (qErr) setError(qErr);
  }, [searchParams]);

  async function runDiagnose() {
    try {
      const res = await fetch("/api/auth/diagnose", { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) {
        setDiagHint(`${data.message}${data.hint ? ` → ${data.hint}` : ""}`);
        return data;
      }
      setDiagHint(null);
      return data;
    } catch {
      setDiagHint("진단 API에 연결하지 못했습니다.");
      return { ok: false };
    }
  }

  async function finishLocalAuth() {
    await refresh();
    router.push("/setuk");
    router.refresh();
  }

  async function handleLocalAuth() {
    const result =
      mode === "signup"
        ? await localSignUp(email, password)
        : await localSignIn(email, password);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setMessage(
      mode === "signup"
        ? "가입이 완료되었습니다. (이 브라우저에 계정이 저장됩니다)"
        : null,
    );
    await finishLocalAuth();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDiagHint(null);
    setLoading(true);

    try {
      if (usingLocal || authMode === "local") {
        await handleLocalAuth();
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setUsingLocal(true);
        await handleLocalAuth();
        return;
      }

      const diag = await runDiagnose();
      if (diag && diag.ok === false) {
        // 잘못된 Supabase URL/키여도 서비스가 되게 로컬 인증으로 전환
        setUsingLocal(true);
        setMessage("클라우드 Auth 연결에 실패해 로컬 계정으로 진행합니다.");
        await handleLocalAuth();
        return;
      }

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/setuk`,
          },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          router.push("/setuk");
          router.refresh();
          return;
        }

        const { data: signedIn, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (!signInError && signedIn.session) {
          router.push("/setuk");
          router.refresh();
          return;
        }

        setMessage(
          "가입이 접수되었습니다. 이메일 확인이 켜져 있다면 인증 메일을 확인하세요.",
        );
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (!data.session) {
          throw new Error("세션이 생성되지 않았습니다.");
        }
        router.push("/setuk");
        router.refresh();
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "인증에 실패했습니다.";
      const lower = raw.toLowerCase();

      if (
        lower.includes("failed to fetch") ||
        lower.includes("networkerror") ||
        lower.includes("fetch failed")
      ) {
        setUsingLocal(true);
        setMessage("Supabase에 연결되지 않아 로컬 계정으로 전환합니다.");
        try {
          await handleLocalAuth();
        } catch {
          setError("로컬 인증에도 실패했습니다. 잠시 후 다시 시도하세요.");
        }
      } else if (lower.includes("email not confirmed")) {
        setError(
          "이메일 인증이 완료되지 않았습니다. 메일의 확인 링크를 누르거나 Confirm email을 끄세요.",
        );
      } else if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (lower.includes("user already registered")) {
        setError("이미 가입된 이메일입니다. 로그인해 주세요.");
      } else {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {!usingLocal && authMode === "supabase" && <SocialLoginButtons />}

      {usingLocal && (
        <p className="rounded-xl bg-[#ecfdf5] px-3.5 py-2.5 text-xs leading-relaxed text-[#065f46]">
          로컬 계정 모드입니다. 이메일·비밀번호로 바로 가입/로그인되며, 이 브라우저에만
          저장됩니다.
        </p>
      )}

      {!usingLocal && authMode === "supabase" && (
        <div className="relative py-1 text-center text-xs text-ink-soft">
          <span className="relative z-10 bg-white/80 px-2">또는 이메일</span>
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/10" />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl bg-white/75 p-5 ring-1 ring-line backdrop-blur-sm md:p-6"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">이메일</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
            placeholder="you@school.com"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">비밀번호</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
            placeholder="6자 이상"
          />
        </label>

        {error && (
          <div className="space-y-2 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
            <p>{error}</p>
            {diagHint && <p className="text-xs leading-relaxed text-[#9f1239]/90">{diagHint}</p>}
            {authMode === "supabase" && !usingLocal && (
              <div className="flex flex-wrap gap-3 text-xs font-semibold">
                <button
                  type="button"
                  className="underline"
                  onClick={() => setUsingLocal(true)}
                >
                  로컬 계정으로 계속
                </button>
                <a
                  href="/api/auth/diagnose"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  진단 JSON 보기
                  <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {message && (
          <p className="rounded-lg bg-mint px-3 py-2 text-sm text-teal-deep" role="status">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-soft disabled:opacity-50"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {mode === "login" ? "이메일로 로그인" : "이메일로 회원가입"}
        </button>

        <p className="text-center text-xs text-ink-soft">
          {mode === "login" ? (
            <>
              계정이 없나요?{" "}
              <Link href="/signup" className="font-semibold text-teal hover:underline">
                회원가입
              </Link>
            </>
          ) : (
            <>
              이미 계정이 있나요?{" "}
              <Link href="/login" className="font-semibold text-teal hover:underline">
                로그인
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
