import { AdminSidebar } from "@/components/app/admin-sidebar";

import { listStores } from "@/lib/queries/stores";
import { getStoreScopeFromCookie } from "@/lib/store-cookie";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const stores = await listStores();
  const selectedScope = await getStoreScopeFromCookie();

  return (
    <div className="flex min-h-dvh bg-[#fdfdfd]">
      <AdminSidebar stores={stores} selectedScope={selectedScope} />
      <main className="min-h-0 min-w-0 flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
