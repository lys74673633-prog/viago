"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function AuthNav() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <span className="px-2.5 py-2 text-sm text-ink-soft">…</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-1">
        <span className="hidden max-w-[120px] truncate text-xs text-ink-soft md:inline">
          {user.email}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft transition hover:text-ink"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/login"
        className="rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft transition hover:text-ink"
      >
        로그인
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-[#1E293B] px-2.5 py-2 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
      >
        회원가입
      </Link>
    </div>
  );
}
