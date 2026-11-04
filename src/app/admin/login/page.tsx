import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { readAdminSession } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  if (await readAdminSession()) {
    redirect("/admin");
  }

  const hint =
    process.env.NODE_ENV !== "production" &&
    !(process.env.ADMIN_PASSWORD ?? "").trim()
      ? "개발 모드: viago-admin 또는 설정된 관리자 비밀번호"
      : null;

  return <AdminLoginForm hint={hint} />;
}
