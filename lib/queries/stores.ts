import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { cloudBusinessSettings, stores } from "@/lib/db/schema";

export type StoreListRow = {
  id: string;
  name: string;
  slug: string;
  shopName: string;
  displayName: string;
  lastSyncAt: Date | null;
};

export async function listStores(): Promise<StoreListRow[]> {
  const rows = await db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      shopName: cloudBusinessSettings.shopName,
      lastSyncAt: stores.lastSyncAt,
    })
    .from(stores)
    .leftJoin(cloudBusinessSettings, eq(cloudBusinessSettings.storeId, stores.id))
    .orderBy(stores.name);

  return rows.map((r) => {
    const shopName = r.shopName ?? "";
    const displayName = shopName.trim() ? shopName : r.name;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      shopName,
      displayName,
      lastSyncAt: r.lastSyncAt ?? null,
    };
  });
}
