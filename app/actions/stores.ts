"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

import { db } from "@/lib/db";
import { cloudBusinessSettings, stores } from "@/lib/db/schema";

function slugify(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function createStore(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugRaw ? slugify(slugRaw) : slugify(name);

  if (!name || !slug) {
    return { ok: false as const, error: "Name is required." };
  }

  const secret = nanoid(32);
  const syncSecretHash = await bcrypt.hash(secret, 10);

  try {
    const [row] = await db
      .insert(stores)
      .values({
        name,
        slug,
        syncSecretHash,
      })
      .returning({ id: stores.id });

    if (!row) {
      return { ok: false as const, error: "Could not create store." };
    }

    revalidatePath("/settings");
    return {
      ok: true as const,
      storeId: row.id,
      slug,
      secret,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { ok: false as const, error: "That slug is already taken." };
    }
    return { ok: false as const, error: "Could not create store." };
  }
}

const STORE_NAME_MAX = 120;

export async function updateStoreName(storeId: string, name: string) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) {
    return { ok: false as const, error: "Name is required." };
  }
  if (trimmed.length > STORE_NAME_MAX) {
    return { ok: false as const, error: `Name must be at most ${STORE_NAME_MAX} characters.` };
  }

  const [existing] = await db.select({ id: stores.id }).from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!existing) {
    return { ok: false as const, error: "Store not found." };
  }

  const now = new Date();

  try {
    await db
      .update(stores)
      .set({ name: trimmed, updatedAt: now })
      .where(eq(stores.id, storeId));

    await db
      .insert(cloudBusinessSettings)
      .values({
        storeId,
        shopName: trimmed,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: cloudBusinessSettings.storeId,
        set: { shopName: trimmed, updatedAt: now },
      });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/bills");
    revalidatePath("/inventory");

    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not update store name." };
  }
}
