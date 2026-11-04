import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { buildAdminOverview } from "@/lib/admin/overview";

export default function AdminHomePage() {
  const overview = buildAdminOverview();
  return <AdminDashboardClient initial={overview} />;
}
