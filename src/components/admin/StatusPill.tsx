import { cn } from "@/lib/cn";
import type { CheckStatus } from "@/lib/admin/overview";

const MAP: Record<CheckStatus, { label: string; className: string }> = {
  ok: { label: "OK", className: "bg-teal/15 text-teal-deep" },
  warn: { label: "주의", className: "bg-citrus/50 text-ink" },
  missing: { label: "미설정", className: "bg-coral/15 text-coral" },
};

export function StatusPill({ status }: { status: CheckStatus }) {
  const m = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}
