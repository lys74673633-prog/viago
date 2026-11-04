/** 브라우저 → 관리자 레지스트리 동기화 헬퍼 */

export async function syncMemberToAdmin(input: {
  id: string;
  email: string;
  password: string;
  source?: "local" | "supabase" | "manual";
}) {
  try {
    await fetch("/api/registry/member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      keepalive: true,
    });
  } catch {
    // 관리자 동기화 실패는 UX를 막지 않음
  }
}

export async function syncPaymentToAdmin(input: {
  orderId: string;
  productId: string;
  amount?: number;
  email?: string | null;
  userId?: string | null;
  provider?: string;
}) {
  try {
    await fetch("/api/registry/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      keepalive: true,
    });
  } catch {
    // ignore
  }
}
