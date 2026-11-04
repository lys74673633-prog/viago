import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright/로컬 에이전트가 127.0.0.1 로 접근할 때 HMR·클라이언트 하이드레이션 허용
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
