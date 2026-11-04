import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin/store";
import { readAdminSession } from "@/lib/admin/session";

export async function GET() {
  if (!(await readAdminSession())) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, data: await getAdminStats() });
}
