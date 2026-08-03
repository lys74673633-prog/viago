import type { Metadata } from "next";
import { Noto_Sans_KR, Syne } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const noto = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Viago — 고등학생 세특·수행평가 코파일럿",
  description:
    "키워드만 넣으면 학업·진로·공동체 역량 세특 문장을 한 번에 생성하는 AI 웹서비스",
  icons: {
    // app/icon.svg (심볼 전용)가 기본 파비콘으로 쓰입니다.
    // 정적 파일만 쓸 경우: icon: "/viago-mark.svg"
    icon: [{ url: "/viago-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/viago-mark.svg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${noto.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
