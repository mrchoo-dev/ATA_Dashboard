import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getDashboardData();
  return <Dashboard initialData={data} />;
}
