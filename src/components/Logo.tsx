import { useId } from "react";
import { cn } from "@/lib/cn";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  /** full: 심볼 + Viago 워드마크 / mark: 심볼만 (파비콘·앱아이콘용) */
  variant?: "full" | "mark";
  size?: LogoSize;
  className?: string;
  title?: string;
}

const SIZE_MAP: Record<
  LogoSize,
  { mark: string; text: string; gap: string }
> = {
  sm: { mark: "h-8 w-8", text: "text-[1.35rem]", gap: "gap-2.5" },
  md: { mark: "h-9 w-9", text: "text-[1.55rem]", gap: "gap-2.5" },
  lg: { mark: "h-12 w-12", text: "text-[2rem]", gap: "gap-3" },
};

/**
 * Viago 로고
 * - 캘리그라피 스우시 → 일체형 민트 체크
 * - 워드마크: 모던 산세리프 "Viago"
 */
export function Logo({
  variant = "full",
  size = "md",
  className,
  title = "Viago",
}: LogoProps) {
  const s = SIZE_MAP[size];

  if (variant === "mark") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 overflow-visible p-0.5",
          s.mark,
          className,
        )}
        title={title}
      >
        <LogoMarkSvg className="h-full w-full overflow-visible" />
        <span className="sr-only">{title}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center overflow-visible py-1",
        s.gap,
        className,
      )}
    >
      <span
        className={cn("inline-flex shrink-0 overflow-visible p-0.5", s.mark)}
        aria-hidden
      >
        <LogoMarkSvg className="h-full w-full overflow-visible" />
      </span>
      <span
        className={cn(
          "font-display font-bold tracking-tight text-[#0F172A]",
          "leading-[1.25] [overflow-wrap:normal]",
          s.text,
        )}
      >
        Viago
      </span>
    </span>
  );
}

/**
 * √/체크 진입형 캘리그라피
 * viewBox에 여유를 두어 스트로크가 잘리지 않도록 함
 */
export function LogoMarkSvg({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={`${gid}-ink`}
          x1="5"
          y1="9"
          x2="29"
          y2="35"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0F172A" />
          <stop offset="0.72" stopColor="#1E293B" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
      </defs>

      <path
        d="M6 15.5
           C10.5 8.2 18.2 7.4 23 14.2
           C25.8 18.2 26.6 23.8 26.2 28.6
           C26.1 30.4 26.6 31.8 27.8 33.1"
        stroke={`url(#${gid}-ink)`}
        strokeWidth="2.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M27.8 33.1
           L31.2 36.4
           L39.2 14.8"
        stroke="#10B981"
        strokeWidth="2.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
