import { NextResponse } from "next/server";
import { getAdminStats, setPremiumTrial } from "@/lib/admin/store";
import { readAdminSession } from "@/lib/admin/session";

export async function GET() {
  if (!(await readAdminSession())) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const stats = await getAdminStats();
  return NextResponse.json({ ok: true, data: stats.premiumTrial });
}

export async function POST(request: Request) {
  if (!(await readAdminSession())) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  let enabled = true;
  let note: string | null = null;
  try {
    const body = (await request.json()) as { enabled?: boolean; note?: string };
    enabled = body.enabled !== false;
    note = body.note?.trim() || null;
  } catch {
    // default enable
  }

  const trial = await setPremiumTrial(enabled, note);
  return NextResponse.json({ ok: true, data: trial });
}
