import { NextResponse } from "next/server";
import {
  allowMockPayments,
  getTossClientKey,
  isTossConfigured,
  isTossLiveMode,
} from "@/lib/payments/toss";

/** 클라이언트에 공개 가능한 결제 설정만 반환 */
export async function GET() {
  return NextResponse.json({
    tossConfigured: isTossConfigured(),
    clientKey: getTossClientKey() || null,
    live: isTossLiveMode(),
    allowMock: allowMockPayments(),
    methodsNote:
      "토스페이·카카오페이·네이버페이·카드 등은 토스페이먼츠 가맹점 설정에서 활성화됩니다.",
  });
}
