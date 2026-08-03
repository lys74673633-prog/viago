"use client";

import { useState, type FormEvent } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";

export function SetupEnvForm() {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setDone(false);

    try {
      const res = await fetch("/api/setup/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl: url.trim(),
          supabaseAnonKey: anonKey.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "저장에 실패했습니다.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-5">
      <ol className="space-y-3 rounded-2xl bg-white/75 p-5 text-sm text-ink ring-1 ring-line">
        <li className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1E293B] text-xs font-bold text-white">
            1
          </span>
          <div>
            <p className="font-semibold">Supabase에서 API 설정 열기</p>
            <a
              href="https://supabase.com/dashboard/project/_/settings/api"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 font-medium text-[#059669] hover:underline"
            >
              Project Settings → API 바로가기
              <ExternalLink className="size-3.5" />
            </a>
            <p className="mt-1 text-xs text-ink-soft">
              프로젝트를 고른 뒤, 왼쪽 메뉴의 Project Settings(톱니바퀴) → API 로
              들어가도 됩니다.
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1E293B] text-xs font-bold text-white">
            2
          </span>
          <div>
            <p className="font-semibold">이 두 값을 복사</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-ink-soft">
              <li>
                <strong className="text-ink">Project URL</strong> —{" "}
                <code className="text-xs">https://xxxx.supabase.co</code>
              </li>
              <li>
                <strong className="text-ink">anon public</strong> 또는{" "}
                <strong className="text-ink">publishable</strong> 키 —{" "}
                <code className="text-xs">eyJ...</code> 또는{" "}
                <code className="text-xs">sb_publishable_...</code>
              </li>
            </ul>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1E293B] text-xs font-bold text-white">
            3
          </span>
          <p className="font-semibold">아래에 붙여넣고 저장 → 서버 재시작</p>
        </li>
      </ol>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/80 p-5 ring-1 ring-line">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">Project URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://xxxxxxxx.supabase.co"
            className="w-full rounded-xl border border-ink/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">anon public key</span>
          <textarea
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            required
            rows={4}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full resize-y rounded-xl border border-ink/12 bg-white px-3.5 py-3 font-mono text-xs outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
            {error}
          </p>
        )}

        {done && (
          <div
            className="space-y-2 rounded-xl bg-[#10B981]/10 px-3.5 py-3 text-sm text-[#065f46]"
            role="status"
          >
            <p className="inline-flex items-center gap-1.5 font-semibold">
              <Check className="size-4" />
              연결 검증 통과 · .env.local 저장 완료
            </p>
            <p>
              반드시 개발 서버를 재시작하세요.
              <br />
              <code className="rounded bg-white/80 px-1">Ctrl + C</code> →{" "}
              <code className="rounded bg-white/80 px-1">npm run dev</code>
            </p>
            <p className="text-xs">
              재시작 후{" "}
              <a href="/login" className="font-semibold underline">
                /login
              </a>
              ·{" "}
              <a href="/api/auth/diagnose" className="font-semibold underline">
                /api/auth/diagnose
              </a>
              를 확인하세요. Email Confirm은 로컬에서 OFF 권장.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          저장하기
        </button>
      </form>
    </div>
  );
}
