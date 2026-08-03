"use client";

import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export function AuthPageClient({ mode }: { mode: "login" | "signup" }) {
  return (
    <Suspense fallback={<div className="text-sm text-ink-soft">불러오는 중…</div>}>
      <AuthForm mode={mode} />
    </Suspense>
  );
}
