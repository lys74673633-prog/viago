import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "viago_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function getAdminPassword(): string | null {
  const fromEnv = (process.env.ADMIN_PASSWORD ?? "").trim();
  if (fromEnv) return fromEnv;
  // 로컬/프리뷰에서만 기본값 — 프로덕션은 env 필수
  if (process.env.NODE_ENV !== "production") return "viago-admin";
  return null;
}

function getSigningSecret(): string | null {
  const password = getAdminPassword();
  if (!password) return null;
  return `viago-admin-v1:${password}`;
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean((process.env.ADMIN_PASSWORD ?? "").trim()) || process.env.NODE_ENV !== "production";
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function sign(payload: string): string | null {
  const secret = getSigningSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAdminSessionToken(): string | null {
  const issuedAt = Date.now().toString(36);
  const sig = sign(issuedAt);
  if (!sig) return null;
  return `${issuedAt}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  const expected = sign(issuedAt);
  if (!expected) return false;
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
