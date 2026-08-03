/**
 * Supabase 없이 동작하는 브라우저 로컬 인증 (MVP/데모).
 * 계정은 해당 브라우저 localStorage에만 저장됩니다.
 */

export const LOCAL_USERS_KEY = "viago:local-users:v1";
export const LOCAL_SESSION_KEY = "viago:local-session:v1";

export type LocalAuthUser = {
  id: string;
  email: string;
};

type StoredUser = LocalAuthUser & {
  passwordHash: string;
  createdAt: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`viago:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function readLocalSession(): LocalAuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as LocalAuthUser;
    if (!session?.id || !session?.email) return null;
    return { id: session.id, email: session.email };
  } catch {
    return null;
  }
}

export function writeLocalSession(user: LocalAuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(LOCAL_SESSION_KEY);
  } else {
    window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new CustomEvent("viago:local-auth", { detail: user }));
}

export async function localSignUp(
  email: string,
  password: string,
): Promise<{ user: LocalAuthUser } | { error: string }> {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return { error: "올바른 이메일을 입력하세요." };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다." };
  }

  const users = readUsers();
  if (users.some((u) => u.email === normalized)) {
    return { error: "이미 가입된 이메일입니다. 로그인해 주세요." };
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: normalized,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  const session = { id: user.id, email: user.email };
  writeLocalSession(session);
  return { user: session };
}

export async function localSignIn(
  email: string,
  password: string,
): Promise<{ user: LocalAuthUser } | { error: string }> {
  const normalized = normalizeEmail(email);
  const users = readUsers();
  const found = users.find((u) => u.email === normalized);
  if (!found) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  const hash = await hashPassword(password);
  if (hash !== found.passwordHash) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  const session = { id: found.id, email: found.email };
  writeLocalSession(session);
  return { user: session };
}

export function localSignOut() {
  writeLocalSession(null);
}
