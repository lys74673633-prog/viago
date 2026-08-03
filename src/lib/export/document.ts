export type ExportFormat = "pdf" | "hwp";

export interface ExportDocumentInput {
  title: string;
  subtitle?: string;
  sections: { heading: string; body: string }[];
  footerNote?: string;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildPrintHtml(doc: ExportDocumentInput): string {
  const sections = doc.sections
    .map(
      (s) => `
      <section style="margin:0 0 28px;">
        <h2 style="font-size:14pt;margin:0 0 10px;color:#0f766e;">${escapeHtml(s.heading)}</h2>
        <p style="margin:0;white-space:pre-wrap;line-height:1.7;">${escapeHtml(s.body)}</p>
      </section>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(doc.title)}</title>
<style>
  @page { margin: 18mm; }
  body { font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; color: #1e293b; }
  h1 { font-size: 18pt; margin: 0 0 6px; }
  .sub { color: #64748b; font-size: 10pt; margin-bottom: 24px; }
  .foot { margin-top: 36px; font-size: 9pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
</style>
</head>
<body>
  <h1>${escapeHtml(doc.title)}</h1>
  ${doc.subtitle ? `<p class="sub">${escapeHtml(doc.subtitle)}</p>` : ""}
  ${sections}
  <p class="foot">${escapeHtml(doc.footerNote ?? "Viago로 생성 · 제출 전 학교 양식에 맞게 검토하세요.")}</p>
</body>
</html>`;
}

function buildHwpText(doc: ExportDocumentInput): string {
  const lines = [
    doc.title,
    doc.subtitle ?? "",
    "".padEnd(32, "─"),
    ...doc.sections.flatMap((s) => ["", `[${s.heading}]`, s.body, ""]),
    "".padEnd(32, "─"),
    doc.footerNote ?? "Viago 생성본 · 한글(HWP)에 붙여넣어 제출 양식에 맞게 정리하세요.",
  ];
  return lines.join("\n");
}

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** PDF: 인쇄 대화상자(다른 이름으로 저장 → PDF) + HTML 백업 다운로드 */
export function exportAsPdf(doc: ExportDocumentInput) {
  const html = buildPrintHtml(doc);
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(`viago-${stamp}.html`, html, "text/html;charset=utf-8");

  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  window.setTimeout(() => {
    w.print();
  }, 300);
}

/** HWP: 한글에 바로 붙여넣기 좋은 UTF-8 텍스트 */
export function exportAsHwp(doc: ExportDocumentInput) {
  const stamp = new Date().toISOString().slice(0, 10);
  const text = "\uFEFF" + buildHwpText(doc); // BOM for Hangul/Excel friendliness
  triggerDownload(`viago-${stamp}-hwp.txt`, text, "text/plain;charset=utf-8");
}

export function exportDocument(format: ExportFormat, doc: ExportDocumentInput) {
  if (format === "pdf") exportAsPdf(doc);
  else exportAsHwp(doc);
}
