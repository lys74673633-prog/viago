"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export function AdminLoginForm({ hint }: { hint?: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#0b2434_0%,#134e4a_48%,#0f766e_100%)] px-5 py-12">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="animate-drift absolute -left-16 top-20 size-72 rounded-full bg-citrus/15 blur-3xl" />
        <div className="animate-pulse-soft absolute -right-10 bottom-10 size-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md animate-rise rounded-3xl border border-white/15 bg-white/95 p-7 shadow-[0_24px_80px_rgba(11,36,52,0.35)] backdrop-blur"
      >
        <div className="flex items-center justify-between gap-3">
          <Logo size="md" />
          <span className="rounded-md bg-ink px-2 py-1 text-[10px] font-bold tracking-wider text-white">
            ADMIN
          </span>
        </div>

        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">
          관리자 로그인
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          서비스 상태·상용화 체크리스트·상품을 한곳에서 확인합니다.
        </p>

        <label className="mt-6 block text-sm font-medium text-ink">
          비밀번호
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/12 bg-white py-3.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
              placeholder="ADMIN_PASSWORD"
              required
            />
          </div>
        </label>

        {hint ? (
          <p className="mt-3 rounded-lg bg-mint/60 px-3 py-2 text-xs text-teal-deep">{hint}</p>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg bg-coral/10 px-3 py-2 text-xs font-medium text-coral">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-ink-soft disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          들어가기
        </button>
      </form>
    </div>
  );
}
