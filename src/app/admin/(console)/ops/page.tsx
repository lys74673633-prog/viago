import { AdminOpsClient } from "@/components/admin/AdminOpsClient";
import { getAdminStats } from "@/lib/admin/store";

export default async function AdminOpsPage() {
  const stats = await getAdminStats();
  return <AdminOpsClient initial={stats} />;
}
