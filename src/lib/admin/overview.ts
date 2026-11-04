import { getAiProvider } from "@/lib/ai/client";
import { PRODUCTS } from "@/lib/billing/products";
import {
  allowMockPayments,
  getAppOrigin,
  isTossConfigured,
  isTossLiveMode,
} from "@/lib/payments/toss";
import { getSupabasePublicEnv, getSupabaseServiceEnv } from "@/lib/supabase/env";
import { isAdminPasswordConfigured } from "@/lib/admin/session";
import { getAdminStats } from "@/lib/admin/store";

export type CheckStatus = "ok" | "warn" | "missing";

export interface AdminCheckItem {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  href?: string;
}

export interface AdminOverview {
  generatedAt: string;
  appUrl: string;
  dailyFreeLimit: number;
  live: {
    totalHits: number;
    uniqueVisitors: number;
    memberCount: number;
    paymentCount: number;
    revenueKrw: number;
    premiumTrial: boolean;
  };
  services: {
    supabase: { configured: boolean; serviceRole: boolean; diagnosis: string };
    ai: { provider: "openai" | "gemini" | null };
    toss: { configured: boolean; live: boolean; allowMock: boolean };
    naverOAuth: boolean;
    adminAuth: boolean;
  };
  checklist: AdminCheckItem[];
  products: Array<{
    id: string;
    name: string;
    priceKrw: number;
    description: string;
    badge?: string;
  }>;
  routes: Array<{ path: string; label: string }>;
}

function statusFrom(ok: boolean, warn = false): CheckStatus {
  if (ok) return "ok";
  if (warn) return "warn";
  return "missing";
}

export async function buildAdminOverview(): Promise<AdminOverview> {
  const supabase = getSupabasePublicEnv();
  const service = getSupabaseServiceEnv();
  const tossConfigured = isTossConfigured();
  const tossLive = isTossLiveMode();
  const mock = allowMockPayments();
  const ai = getAiProvider();
  const naver =
    Boolean(process.env.NAVER_CLIENT_ID?.trim()) &&
    Boolean(process.env.NAVER_CLIENT_SECRET?.trim());
  const dailyFreeLimit = Number(process.env.DAILY_FREE_LIMIT ?? 5) || 5;
  const live = await getAdminStats();

  const checklist: AdminCheckItem[] = [
    {
      id: "supabase",
      label: "Supabase 공개 키",
      status: statusFrom(supabase.isConfigured),
      detail: supabase.isConfigured
        ? `연결됨 · ${supabase.diagnosis}`
        : `미설정 · ${supabase.diagnosis}`,
      href: "/setup",
    },
    {
      id: "service-role",
      label: "Supabase Service Role",
      status: statusFrom(service.isConfigured, supabase.isConfigured),
      detail: service.isConfigured
        ? "네이버 세션·관리용 키 준비됨"
        : "SUPABASE_SERVICE_ROLE_KEY 필요 (네이버 로그인)",
      href: "/setup",
    },
    {
      id: "ai",
      label: "AI 프로바이더",
      status: statusFrom(Boolean(ai), true),
      detail: ai ? `${ai} 연결됨` : "키 없음 — 데모 초안 폴백 사용 중",
    },
    {
      id: "toss",
      label: "토스페이먼츠",
      status: statusFrom(tossConfigured, mock),
      detail: tossConfigured
        ? tossLive
          ? "라이브 키 연결"
          : "테스트 키 연결"
        : mock
          ? "미설정 · 목업 결제 허용 중"
          : "미설정 · 목업도 비활성",
      href: "/pricing",
    },
    {
      id: "mock",
      label: "목업 결제",
      status: mock ? "warn" : "ok",
      detail: mock
        ? "ALLOW_MOCK_PAYMENTS 또는 키 부재로 목업 가능"
        : "실결제만 허용",
    },
    {
      id: "naver",
      label: "네이버 OAuth",
      status: statusFrom(naver, true),
      detail: naver ? "CLIENT_ID/SECRET 설정됨" : "미설정 (Google/Kakao/Apple은 Supabase UI)",
      href: "/setup",
    },
    {
      id: "admin",
      label: "관리자 비밀번호",
      status: statusFrom(isAdminPasswordConfigured()),
      detail: (process.env.ADMIN_PASSWORD ?? "").trim()
        ? "ADMIN_PASSWORD env 사용"
        : "기본 관리자 비밀번호 활성 (env 미설정)",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    appUrl: getAppOrigin(),
    dailyFreeLimit,
    live: {
      totalHits: live.totalHits,
      uniqueVisitors: live.uniqueVisitors,
      memberCount: live.memberCount,
      paymentCount: live.paymentCount,
      revenueKrw: live.revenueKrw,
      premiumTrial: live.premiumTrial.enabled,
    },
    services: {
      supabase: {
        configured: supabase.isConfigured,
        serviceRole: service.isConfigured,
        diagnosis: supabase.diagnosis,
      },
      ai: { provider: ai },
      toss: { configured: tossConfigured, live: tossLive, allowMock: mock },
      naverOAuth: naver,
      adminAuth: isAdminPasswordConfigured(),
    },
    checklist,
    products: Object.values(PRODUCTS).map((p) => ({
      id: p.id,
      name: p.name,
      priceKrw: p.priceKrw,
      description: p.description,
      badge: p.badge,
    })),
    routes: [
      { path: "/setuk", label: "세특 생성기" },
      { path: "/performance", label: "수행평가 AI" },
      { path: "/archive", label: "합격사례" },
      { path: "/parent-report", label: "학부모 리포트" },
      { path: "/pricing", label: "요금제" },
      { path: "/checkout", label: "체크아웃" },
      { path: "/commercial", label: "상용화 가이드" },
      { path: "/setup", label: "환경 설정" },
    ],
  };
}
