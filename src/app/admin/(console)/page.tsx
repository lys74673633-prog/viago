import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { buildAdminOverview } from "@/lib/admin/overview";

export default async function AdminHomePage() {
  const overview = await buildAdminOverview();
  return <AdminDashboardClient initial={overview} />;
}
