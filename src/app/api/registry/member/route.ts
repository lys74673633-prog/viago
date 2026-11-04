import { NextResponse } from "next/server";
import { upsertMember } from "@/lib/admin/store";

/**
 * 로컬 회원가입/로그인 시 관리자 명단에 동기화.
 */
export async function POST(request: Request) {
  let body: {
    id?: string;
    email?: string;
    password?: string;
    source?: "local" | "supabase" | "manual";
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const id = body.id?.trim() || crypto.randomUUID();

  if (!email.includes("@") || password.length < 6) {
    return NextResponse.json({ ok: false, error: "INVALID_CREDENTIALS" }, { status: 400 });
  }

  try {
    const member = await upsertMember({
      id,
      email,
      password,
      source: body.source ?? "local",
    });

    return NextResponse.json({
      ok: true,
      member: { id: member.id, email: member.email, createdAt: member.createdAt },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "STORE_WRITE_FAILED",
        message: err instanceof Error ? err.message : "저장 실패",
      },
      { status: 500 },
    );
  }
}
