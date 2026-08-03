"use client";

import { Gauge } from "lucide-react";
import type { UsageStatus } from "@/types";

interface UsageBadgeProps {
  status: UsageStatus;
}

export function UsageBadge({ status }: UsageBadgeProps) {
  const exhausted = status.remaining <= 0;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ring-1 ${
        exhausted
          ? "bg-coral/10 text-coral ring-coral/25"
          : "bg-mint/60 text-teal-deep ring-teal/20"
      }`}
    >
      <Gauge className="size-4" aria-hidden />
      <span>
        오늘 무료{" "}
        <strong className="font-semibold">
          {status.remaining}/{status.limit}
        </strong>
        회 남음
      </span>
    </div>
  );
}
