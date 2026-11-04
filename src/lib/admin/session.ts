import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "viago_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

/**
 * 프로덕션 기본 비밀번호의 SHA-256 (평문은 저장소에 넣지 않음).
 * Vercel env `ADMIN_PASSWORD` 가 있으면 그걸 우선 사용.
 */
const DEFAULT_ADMIN_PASSWORD_SHA256 =
  "2432331b152fb987e4b42cdaca315c6927fe588c2e073199fdd3f21f80553f04";

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  try {
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** env 평문 비밀번호 (있으면 최우선) */
function getEnvAdminPassword(): string | null {
  const fromEnv = (process.env.ADMIN_PASSWORD ?? "").trim();
  return fromEnv || null;
}

export function isAdminPasswordConfigured(): boolean {
  return true; // env 또는 기본 해시로 항상 로그인 가능
}

export function verifyAdminPassword(password: string): boolean {
  const envPassword = getEnvAdminPassword();
  if (envPassword) {
    const a = Buffer.from(password);
    const b = Buffer.from(envPassword);
    if (a.length !== b.length) return false;
    try {
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  // 개발 편의 기본값
  if (process.env.NODE_ENV !== "production" && password === "viago-admin") {
    return true;
  }

  // 프로덕션/공통 기본 해시 검증
  return safeEqualHex(sha256Hex(password), DEFAULT_ADMIN_PASSWORD_SHA256);
}

function getSigningSecret(): string {
  const envPassword = getEnvAdminPassword();
  if (envPassword) return `viago-admin-v1:${envPassword}`;
  // env 없을 때는 해시 기반 고정 시크릿
  return `viago-admin-v1:sha256:${DEFAULT_ADMIN_PASSWORD_SHA256}`;
}

function sign(payload: string): string {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

export function createAdminSessionToken(): string {
  const issuedAt = Date.now().toString(36);
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  const expected = sign(issuedAt);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const issuedMs = parseInt(issuedAt, 36);
  if (!Number.isFinite(issuedMs)) return false;
  return Date.now() - issuedMs < SESSION_TTL_MS;
}

export async function readAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export function adminCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
