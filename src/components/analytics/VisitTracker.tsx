"use client";

import { useEffect } from "react";

/** 페이지 로드 시 관리자용 접속 카운트 1회 기록 */
export function VisitTracker() {
  useEffect(() => {
    const key = "viago:visit-ping:v1";
    const last = sessionStorage.getItem(key);
    const now = Date.now();
    // 같은 탭 세션에서 30초 내 중복 핑 방지
    if (last && now - Number(last) < 30_000) return;
    sessionStorage.setItem(key, String(now));
    void fetch("/api/registry/visit", { method: "POST", keepalive: true }).catch(
      () => undefined,
    );
  }, []);

  return null;
}
