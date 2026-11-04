import { NextResponse } from "next/server";
import { readAdminStore } from "@/lib/admin/store";

/** 공개: 관리자가 켠 전역 프리미엄 체험 상태 */
export async function GET() {
  const { premiumTrial } = readAdminStore();
  return NextResponse.json({
    ok: true,
    enabled: premiumTrial.enabled,
    updatedAt: premiumTrial.updatedAt,
    note: premiumTrial.note,
  });
}
