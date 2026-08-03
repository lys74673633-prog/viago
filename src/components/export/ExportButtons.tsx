"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { PaywallModal } from "@/components/billing/PaywallModal";
import { useBilling } from "@/contexts/BillingContext";
import {
  exportDocument,
  type ExportDocumentInput,
  type ExportFormat,
} from "@/lib/export/document";

interface ExportButtonsProps {
  document: ExportDocumentInput | null;
  className?: string;
}

export function ExportButtons({ document, className }: ExportButtonsProps) {
  const { canExport, spendExport, entitlements } = useBilling();
  const [paywall, setPaywall] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);
  const [busy, setBusy] = useState(false);

  function runExport(format: ExportFormat) {
    if (!document) return;

    if (!canExport) {
      setPendingFormat(format);
      setPaywall(true);
      return;
    }

    setBusy(true);
    const ok = spendExport();
    if (!ok) {
      setPendingFormat(format);
      setPaywall(true);
      setBusy(false);
      return;
    }

    exportDocument(format, document);
    setBusy(false);
  }

  return (
    <>
      <div className={className}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!document || busy}
            onClick={() => runExport("pdf")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E293B] px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            PDF 다운로드
          </button>
          <button
            type="button"
            disabled={!document || busy}
            onClick={() => runExport("hwp")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink/12 bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:bg-fog disabled:opacity-40"
          >
            <FileText className="size-3.5" />
            HWP용 다운로드
          </button>
          {!entitlements.isPremium && (
            <span className="text-[11px] text-ink-soft">
              {entitlements.exportCredits > 0
                ? `잔여 ${entitlements.exportCredits}회 · 또는 프리미엄`
                : "건당 1,900원 · 프리미엄 무료"}
            </span>
          )}
        </div>
      </div>

      <PaywallModal
        open={paywall}
        reason="export"
        onClose={() => {
          setPaywall(false);
        }}
        onPurchased={() => {
          if (pendingFormat && document) {
            spendExport();
            exportDocument(pendingFormat, document);
            setPendingFormat(null);
          }
        }}
      />
    </>
  );
}
