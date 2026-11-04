import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viago Admin",
  description: "Viago 운영 관리자 콘솔",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
