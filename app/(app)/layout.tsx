import { AdminAppShell } from "@/components/app/admin-app-shell";

import { listStores } from "@/lib/queries/stores";
import { getStoreScopeFromCookie } from "@/lib/store-cookie";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const stores = await listStores();
  const selectedScope = await getStoreScopeFromCookie();

  return (
    <AdminAppShell stores={stores} selectedScope={selectedScope}>
      {children}
    </AdminAppShell>
  );
}
