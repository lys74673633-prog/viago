"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, HeartHandshake, Route } from "lucide-react";
import { CleanButton } from "@/components/clean/CleanButton";
import { ExportButtons } from "@/components/export/ExportButtons";
import type { ExportDocumentInput } from "@/lib/export/document";
import type { SetukVersion } from "@/types";

const ICONS = {
  academic: GraduationCap,
  career: Route,
  community: HeartHandshake,
} as const;

interface SetukResultsProps {
  versions: SetukVersion[];
  onVersionsChange?: (versions: SetukVersion[]) => void;
  loading?: boolean;
}

export function SetukResults({ versions, onVersionsChange, loading }: SetukResultsProps) {
  const exportDoc: ExportDocumentInput | null = useMemo(() => {
    if (versions.length === 0) return null;
    return {
      title: "Viago 세특 문장",
      subtitle: "학업·진로·공동체 역량 버전",
      sections: versions.map((v) => ({
        heading: v.label,
        body: v.content,
      })),
    };
  }, [versions]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-xl bg-ink/[0.06] ring-1 ring-line"
          />
        ))}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-ink/15 bg-white/40 px-6 py-10 text-center">
        <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
          왼쪽 폼을 채우고 생성하면, 학업·진로·공동체 역량 세특 문장이 여기에
          나타납니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ExportButtons document={exportDoc} />
      <ul className="space-y-4" aria-live="polite">
        {versions.map((version, index) => (
          <ResultItem
            key={version.type}
            version={version}
            onCleaned={(cleaned) => {
              if (!onVersionsChange) return;
              const next = versions.map((v, i) =>
                i === index ? { ...v, content: cleaned } : v,
              );
              onVersionsChange(next);
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function ResultItem({
  version,
  onCleaned,
}: {
  version: SetukVersion;
  onCleaned: (cleaned: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = ICONS[version.type];

  async function handleCopy() {
    await navigator.clipboard.writeText(version.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <li className="rounded-xl bg-white/70 p-5 ring-1 ring-line backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-mint text-teal">
            <Icon className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="font-semibold text-ink">{version.label}</h3>
            <p className="mt-0.5 text-xs text-ink-soft">{version.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-teal" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              복사
            </>
          )}
        </button>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink whitespace-pre-wrap">
        {version.content}
      </p>
      <div className="mt-4">
        <CleanButton text={version.content} onCleaned={onCleaned} />
      </div>
    </li>
  );
}
