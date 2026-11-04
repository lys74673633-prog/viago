import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { readAdminSession } from "@/lib/admin/session";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await readAdminSession())) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
