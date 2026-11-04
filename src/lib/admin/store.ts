import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import type { ProductId } from "@/lib/billing/products";

const REPO = "lys74673633-prog/viago";
const STORE_PATH_IN_REPO = "admin-data/store.json";
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/main/${STORE_PATH_IN_REPO}`;

/** ADMIN_PASSWORD 해시로 감싼 GitHub write token (평문 토큰은 소스에 없음) */
const EMBEDDED_TOKEN_BLOB =
  "8EU75tjdbquvQBv7KOz98SKTDWNrZRvjFwoq5n1udBYy6pM8rF4LpQ+m+2/rnaZytP5xW0HhVtZqrDgrAsbU0w0Vu6/+5wL8J/pu93sVmu/IHNLmQb9MQgBYBc2kJILW6zhfUzTXJsdyi801WP6UFwN0zl6naUwG58hfphUiPOByZTqRF75EmSEcmn5zTy2G2tkMnVfB011et6oItKHHUt5lp3rIUHTq30Sqp/YcgleL0r7CnodvMBDVw/1JMjvIcFz+UbcdD8V6qBFTPVb0xXQqIE1GRLHMYNEq2G6DNOiiSurMgqLdcPZGZ3zVYynuAORWXtK22oL2gUAgOEELvyvwvN9twPGjU8mXT7/9Te4qQWGeq9NBhHIeKYaKwncpIvKNZCtXIqQJKzDu+iNpExMYpMQPmZ/LqDRqb2A3Z/G3MGSM5OgOnjOfM3iIdM4z5IlNUtfgLsncbH1R/rp1MnnysXyzaM/FgRXC9IMoqIjyiGVtCtxKJ/7dPSCJjhAUMFrfV7dTwlS1A5Luukr1mC3HnOXQaT8n2WdrZDfLX3s2MQ==";

const DATA_DIR =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "viago-admin")
    : path.join(process.cwd(), ".data");
const LOCAL_CACHE = path.join(DATA_DIR, "admin-store.json");

export type AdminMember = {
  id: string;
  email: string;
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

type GlobalStore = {
  __viagoAdminStore?: AdminStore;
  __viagoAdminStoreSha?: string | null;
};

function g(): GlobalStore {
  return globalThis as unknown as GlobalStore;
}

function normalize(parsed: Partial<AdminStore> | null | undefined): AdminStore {
  return {
    visitors: {
      totalHits: Number(parsed?.visitors?.totalHits ?? 0) || 0,
      uniqueKeys: Array.isArray(parsed?.visitors?.uniqueKeys)
        ? parsed!.visitors!.uniqueKeys.filter((k) => typeof k === "string").slice(-5000)
        : [],
      lastHitAt: parsed?.visitors?.lastHitAt ?? null,
    },
    members: Array.isArray(parsed?.members) ? parsed!.members : [],
    payments: Array.isArray(parsed?.payments) ? parsed!.payments : [],
    premiumTrial: {
      enabled: Boolean(parsed?.premiumTrial?.enabled),
      updatedAt: parsed?.premiumTrial?.updatedAt ?? null,
      note: parsed?.premiumTrial?.note ?? null,
    },
  };
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readLocalCache(): AdminStore | null {
  try {
    ensureDir();
    if (!existsSync(LOCAL_CACHE)) return null;
    return normalize(JSON.parse(readFileSync(LOCAL_CACHE, "utf8")) as Partial<AdminStore>);
  } catch {
    return null;
  }
}

function writeLocalCache(store: AdminStore) {
  try {
    ensureDir();
    writeFileSync(LOCAL_CACHE, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Vercel 등에서 실패해도 메모리/원격이 있으면 계속
  }
}

function decryptEmbeddedToken(): string | null {
  const blob = (process.env.ADMIN_STORE_TOKEN_BLOB || EMBEDDED_TOKEN_BLOB).trim();
  if (!blob || blob === "REPLACE_BLOB") return null;
  try {
    const key = createHash("sha256")
      .update("2432331b152fb987e4b42cdaca315c6927fe588c2e073199fdd3f21f80553f04")
      .digest();
    const raw = Buffer.from(blob, "base64");
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const data = raw.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

function getWriteToken(): string | null {
  const fromEnv = (process.env.ADMIN_STORE_GITHUB_TOKEN || process.env.GITHUB_TOKEN || "").trim();
  if (fromEnv) return fromEnv;
  return decryptEmbeddedToken();
}

async function fetchGithubStore(): Promise<{ store: AdminStore; sha: string | null }> {
  // 1) Contents API (sha 포함)
  const token = getWriteToken();
  if (token) {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${STORE_PATH_IN_REPO}?ref=main`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "viago-admin-store",
        },
        cache: "no-store",
      },
    );
    if (res.ok) {
      const data = (await res.json()) as { content?: string; encoding?: string; sha?: string };
      if (data.content) {
        const json = Buffer.from(data.content, "base64").toString("utf8");
        return { store: normalize(JSON.parse(json) as Partial<AdminStore>), sha: data.sha ?? null };
      }
    }
  }

  // 2) public raw
  const raw = await fetch(`${RAW_URL}?t=${Date.now()}`, {
    cache: "no-store",
    headers: { "User-Agent": "viago-admin-store" },
  });
  if (!raw.ok) return { store: structuredClone(EMPTY), sha: null };
  const parsed = (await raw.json()) as Partial<AdminStore>;
  return { store: normalize(parsed), sha: null };
}

async function pushGithubStore(store: AdminStore, sha: string | null): Promise<string | null> {
  const token = getWriteToken();
  if (!token) return null;

  const body = {
    message: `chore(admin): sync registry ${new Date().toISOString()}`,
    content: Buffer.from(JSON.stringify(store, null, 2), "utf8").toString("base64"),
    branch: "main",
    ...(sha ? { sha } : {}),
  };

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${STORE_PATH_IN_REPO}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "viago-admin-store",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    // sha conflict → refetch once
    if (res.status === 409) {
      const latest = await fetchGithubStore();
      const retry = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${STORE_PATH_IN_REPO}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
            "User-Agent": "viago-admin-store",
          },
          body: JSON.stringify({
            ...body,
            sha: latest.sha,
            content: Buffer.from(
              JSON.stringify(mergeStores(latest.store, store), null, 2),
              "utf8",
            ).toString("base64"),
          }),
        },
      );
      if (!retry.ok) return null;
      const data = (await retry.json()) as { content?: { sha?: string } };
      return data.content?.sha ?? null;
    }
    return null;
  }

  const data = (await res.json()) as { content?: { sha?: string } };
  return data.content?.sha ?? null;
}

function mergeStores(base: AdminStore, incoming: AdminStore): AdminStore {
  const membersByEmail = new Map<string, AdminMember>();
  for (const m of [...base.members, ...incoming.members]) {
    membersByEmail.set(m.email, m);
  }
  const paymentsByOrder = new Map<string, AdminPayment>();
  for (const p of [...base.payments, ...incoming.payments]) {
    paymentsByOrder.set(p.orderId, p);
  }
  const unique = Array.from(
    new Set([...(base.visitors.uniqueKeys || []), ...(incoming.visitors.uniqueKeys || [])]),
  ).slice(-5000);

  return {
    visitors: {
      totalHits: Math.max(base.visitors.totalHits, incoming.visitors.totalHits),
      uniqueKeys: unique,
      lastHitAt:
        (base.visitors.lastHitAt || "") > (incoming.visitors.lastHitAt || "")
          ? base.visitors.lastHitAt
          : incoming.visitors.lastHitAt,
    },
    members: Array.from(membersByEmail.values()).sort((a, b) =>
      (b.updatedAt || "").localeCompare(a.updatedAt || ""),
    ),
    payments: Array.from(paymentsByOrder.values()).sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || ""),
    ),
    premiumTrial: incoming.premiumTrial.updatedAt
      ? incoming.premiumTrial
      : base.premiumTrial,
  };
}

export async function readAdminStore(): Promise<AdminStore> {
  if (g().__viagoAdminStore) return g().__viagoAdminStore!;

  try {
    const remote = await fetchGithubStore();
    g().__viagoAdminStore = remote.store;
    g().__viagoAdminStoreSha = remote.sha;
    writeLocalCache(remote.store);
    return remote.store;
  } catch {
    const local = readLocalCache();
    if (local) {
      g().__viagoAdminStore = local;
      return local;
    }
    return structuredClone(EMPTY);
  }
}

/** sync helpers still used by overview (sync path) */
export function readAdminStoreSync(): AdminStore {
  return g().__viagoAdminStore || readLocalCache() || structuredClone(EMPTY);
}

async function persist(store: AdminStore) {
  g().__viagoAdminStore = store;
  writeLocalCache(store);
  const sha = await pushGithubStore(store, g().__viagoAdminStoreSha ?? null);
  if (sha) g().__viagoAdminStoreSha = sha;
}

export async function writeAdminStore(store: AdminStore) {
  await persist(store);
}

export async function recordVisit(uniqueKey: string) {
  const store = await readAdminStore();
  store.visitors.totalHits += 1;
  store.visitors.lastHitAt = new Date().toISOString();
  if (uniqueKey && !store.visitors.uniqueKeys.includes(uniqueKey)) {
    store.visitors.uniqueKeys.push(uniqueKey);
    if (store.visitors.uniqueKeys.length > 5000) {
      store.visitors.uniqueKeys = store.visitors.uniqueKeys.slice(-5000);
    }
  }
  await persist(store);
  return {
    totalHits: store.visitors.totalHits,
    uniqueVisitors: store.visitors.uniqueKeys.length,
  };
}

export async function upsertMember(input: {
  id: string;
  email: string;
  password: string;
  source?: AdminMember["source"];
}) {
  const store = await readAdminStore();
  const email = input.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const idx = store.members.findIndex((m) => m.email === email || m.id === input.id);
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
  await persist(store);
  return next;
}

export async function recordPayment(input: {
  orderId: string;
  productId: string;
  productName: string;
  amount: number;
  email?: string | null;
  userId?: string | null;
  provider: string;
  status?: "DONE" | "FAILED";
}) {
  const store = await readAdminStore();
  const existing = store.payments.findIndex((p) => p.orderId === input.orderId);
  const row: AdminPayment = {
    id: existing >= 0 ? store.payments[existing].id : randomBytes(8).toString("hex"),
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
  store.payments = store.payments.slice(0, 1000);
  await persist(store);
  return row;
}

export async function setPremiumTrial(enabled: boolean, note?: string | null) {
  const store = await readAdminStore();
  store.premiumTrial = {
    enabled,
    updatedAt: new Date().toISOString(),
    note: note ?? store.premiumTrial.note,
  };
  await persist(store);
  return store.premiumTrial;
}

export async function getAdminStats() {
  const store = await readAdminStore();
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

/** build-time helper unused at runtime */
export function __encryptTokenForEmbed(token: string): string {
  const key = createHash("sha256")
    .update("2432331b152fb987e4b42cdaca315c6927fe588c2e073199fdd3f21f80553f04")
    .digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}
