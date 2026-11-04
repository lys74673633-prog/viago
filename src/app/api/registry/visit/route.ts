import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/admin/store";

export async function POST(request: Request) {
  const fwd = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = request.headers.get("user-agent") ?? "";
  const raw = `${fwd}|${ua.slice(0, 120)}`;
  const uniqueKey = createHash("sha256").update(raw).digest("hex").slice(0, 24);

  try {
    const stats = await recordVisit(uniqueKey);
    return NextResponse.json({ ok: true, ...stats });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "VISIT_WRITE_FAILED",
        message: err instanceof Error ? err.message : "저장 실패",
      },
      { status: 500 },
    );
  }
}
