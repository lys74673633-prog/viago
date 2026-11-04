import { NextResponse } from "next/server";
import { upsertMember } from "@/lib/admin/store";

/**
 * 로컬 회원가입/로그인 시 관리자 명단에 동기화.
 * (MVP: 운영자가 회원 아이디·비밀번호를 관리자 콘솔에서 확인)
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

  const member = upsertMember({
    id,
    email,
    password,
    source: body.source ?? "local",
  });

  return NextResponse.json({
    ok: true,
    member: { id: member.id, email: member.email, createdAt: member.createdAt },
  });
}
