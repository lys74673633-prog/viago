import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import type { ProductId } from "@/lib/billing/products";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "admin-store.json");

export type AdminMember = {
  id: string;
  email: string;
  /** 로컬 가입 시 관리자 열람용으로 동기화된 비밀번호 (MVP) */
  password: string;
  source: "local" | "supabase" | "manual";
  createdAt: string;
  updatedAt: string;
};

export type AdminPayment = {
  id: string;
  orderId: string;
  productId: ProductId | string;
  productName: string;
  amount: number;
  email: string | null;
  userId: string | null;
  provider: string;
  status: "DONE" | "FAILED";
  createdAt: string;
};

export type AdminStore = {
  visitors: {
    totalHits: number;
    uniqueKeys: string[];
    lastHitAt: string | null;
  };
  members: AdminMember[];
  payments: AdminPayment[];
  premiumTrial: {
    enabled: boolean;
    updatedAt: string | null;
    note: string | null;
  };
};

const EMPTY: AdminStore = {
  visitors: { totalHits: 0, uniqueKeys: [], lastHitAt: null },
  members: [],
  payments: [],
  premiumTrial: { enabled: false, updatedAt: null, note: null },
};

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

export function readAdminStore(): AdminStore {
  try {
    ensureDir();
    if (!existsSync(STORE_PATH)) return structuredClone(EMPTY);
    const raw = readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AdminStore>;
    return {
      visitors: {
        totalHits: Number(parsed.visitors?.totalHits ?? 0) || 0,
        uniqueKeys: Array.isArray(parsed.visitors?.uniqueKeys)
          ? parsed.visitors!.uniqueKeys.filter((k) => typeof k === "string").slice(-5000)
          : [],
        lastHitAt: parsed.visitors?.lastHitAt ?? null,
      },
      members: Array.isArray(parsed.members) ? parsed.members : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      premiumTrial: {
        enabled: Boolean(parsed.premiumTrial?.enabled),
        updatedAt: parsed.premiumTrial?.updatedAt ?? null,
        note: parsed.premiumTrial?.note ?? null,
      },
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

export function writeAdminStore(store: AdminStore) {
  ensureDir();
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function recordVisit(uniqueKey: string) {
  const store = readAdminStore();
  store.visitors.totalHits += 1;
  store.visitors.lastHitAt = new Date().toISOString();
  if (uniqueKey && !store.visitors.uniqueKeys.includes(uniqueKey)) {
    store.visitors.uniqueKeys.push(uniqueKey);
    if (store.visitors.uniqueKeys.length > 5000) {
      store.visitors.uniqueKeys = store.visitors.uniqueKeys.slice(-5000);
    }
  }
  writeAdminStore(store);
  return {
    totalHits: store.visitors.totalHits,
    uniqueVisitors: store.visitors.uniqueKeys.length,
  };
}

export function upsertMember(input: {
  id: string;
  email: string;
  password: string;
  source?: AdminMember["source"];
}) {
  const store = readAdminStore();
  const email = input.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const idx = store.members.findIndex(
    (m) => m.email === email || m.id === input.id,
  );
  const next: AdminMember = {
    id: input.id,
    email,
    password: input.password,
    source: input.source ?? "local",
    createdAt: idx >= 0 ? store.members[idx].createdAt : now,
    updatedAt: now,
  };
  if (idx >= 0) store.members[idx] = next;
  else store.members.unshift(next);
  writeAdminStore(store);
  return next;
}

export function recordPayment(input: {
  orderId: string;
  productId: string;
  productName: string;
  amount: number;
  email?: string | null;
  userId?: string | null;
  provider: string;
  status?: "DONE" | "FAILED";
}) {
  const store = readAdminStore();
  const existing = store.payments.findIndex((p) => p.orderId === input.orderId);
  const row: AdminPayment = {
    id: existing >= 0 ? store.payments[existing].id : crypto.randomUUID(),
    orderId: input.orderId,
    productId: input.productId,
    productName: input.productName,
    amount: input.amount,
    email: input.email?.trim().toLowerCase() || null,
    userId: input.userId ?? null,
    provider: input.provider,
    status: input.status ?? "DONE",
    createdAt: existing >= 0 ? store.payments[existing].createdAt : new Date().toISOString(),
  };
  if (existing >= 0) store.payments[existing] = row;
  else store.payments.unshift(row);
  // keep last 1000
  store.payments = store.payments.slice(0, 1000);
  writeAdminStore(store);
  return row;
}

export function setPremiumTrial(enabled: boolean, note?: string | null) {
  const store = readAdminStore();
  store.premiumTrial = {
    enabled,
    updatedAt: new Date().toISOString(),
    note: note ?? store.premiumTrial.note,
  };
  writeAdminStore(store);
  return store.premiumTrial;
}

export function getAdminStats() {
  const store = readAdminStore();
  return {
    totalHits: store.visitors.totalHits,
    uniqueVisitors: store.visitors.uniqueKeys.length,
    lastHitAt: store.visitors.lastHitAt,
    memberCount: store.members.length,
    paymentCount: store.payments.filter((p) => p.status === "DONE").length,
    revenueKrw: store.payments
      .filter((p) => p.status === "DONE")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    premiumTrial: store.premiumTrial,
    members: store.members,
    payments: store.payments,
  };
}
