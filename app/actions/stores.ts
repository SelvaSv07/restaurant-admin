"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";

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
