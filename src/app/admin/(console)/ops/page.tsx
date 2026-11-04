import { AdminOpsClient } from "@/components/admin/AdminOpsClient";
import { getAdminStats } from "@/lib/admin/store";

export default function AdminOpsPage() {
  const stats = getAdminStats();
  return <AdminOpsClient initial={stats} />;
}
