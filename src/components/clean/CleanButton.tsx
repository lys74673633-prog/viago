"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { PaywallModal } from "@/components/billing/PaywallModal";
import { useBilling } from "@/contexts/BillingContext";

interface CleanButtonProps {
  text: string;
  onCleaned: (cleaned: string) => void;
  disabled?: boolean;
}

export function CleanButton({ text, onCleaned, disabled }: CleanButtonProps) {
  const { canClean, spendClean, entitlements } = useBilling();
  const [paywall, setPaywall] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runClean() {
    if (!text.trim()) return;
    setError(null);

    if (!canClean) {
      setPaywall(true);
      return;
    }

    if (!spendClean()) {
      setPaywall(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "클리닝에 실패했습니다.");
      onCleaned(data.cleaned as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-1">
        <button
          type="button"
          disabled={disabled || loading || !text.trim()}
          onClick={() => void runClean()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-xs font-semibold text-[#059669] transition hover:bg-[#10B981]/15 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="size-3.5" />
          )}
          AI 안심 클리닝
          {!entitlements.isPremium && (
            <span className="font-normal text-[#059669]/80">
              · 토큰 {entitlements.cleanTokens}
            </span>
          )}
        </button>
        {error && <p className="text-xs text-coral">{error}</p>}
      </div>

      <PaywallModal
        open={paywall}
        reason="clean"
        onClose={() => setPaywall(false)}
        onPurchased={() => void runClean()}
      />
    </>
  );
}
