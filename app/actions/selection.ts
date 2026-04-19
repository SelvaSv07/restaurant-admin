"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { ADMIN_SELECTED_STORE_COOKIE } from "@/lib/store-cookie";

export async function setSelectedStore(storeId: "all" | string) {
  if (storeId !== "all") {
    const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storeId);
    if (!ok) return { ok: false as const, error: "Invalid store id" };
  }

  const jar = await cookies();
  jar.set(ADMIN_SELECTED_STORE_COOKIE, storeId, {
    path: "/",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/dashboard");
  revalidatePath("/bills");
  revalidatePath("/inventory");
  return { ok: true as const };
}
