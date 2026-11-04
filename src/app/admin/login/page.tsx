import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminPasswordConfigured, readAdminSession } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  if (await readAdminSession()) {
    redirect("/admin");
  }

  const configured = isAdminPasswordConfigured();
  const hasEnvPassword = Boolean((process.env.ADMIN_PASSWORD ?? "").trim());
  const hint = !configured
    ? "프로덕션에서는 ADMIN_PASSWORD 환경변수가 필요합니다."
    : !hasEnvPassword && process.env.NODE_ENV !== "production"
      ? "개발 모드 기본 비밀번호: viago-admin"
      : null;

  return <AdminLoginForm hint={hint} />;
}
