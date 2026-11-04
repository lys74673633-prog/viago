import { NextResponse } from "next/server";
import { buildAdminOverview } from "@/lib/admin/overview";
import { readAdminSession } from "@/lib/admin/session";

export async function GET() {
  const ok = await readAdminSession();
  if (!ok) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, data: await buildAdminOverview() });
}
