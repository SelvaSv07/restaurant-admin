import { cookies } from "next/headers";

export const ADMIN_SELECTED_STORE_COOKIE = "admin_selected_store";

export type StoreScope = "all" | string;

export async function getStoreScopeFromCookie(): Promise<StoreScope> {
  const jar = await cookies();
  const v = jar.get(ADMIN_SELECTED_STORE_COOKIE)?.value ?? "all";
  if (v === "all") return "all";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) {
    return v;
  }
  return "all";
}
