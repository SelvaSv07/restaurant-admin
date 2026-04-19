import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  cloudBillLines,
  cloudBills,
  cloudBusinessSettings,
  cloudInventoryItems,
  stores,
} from "@/lib/db/schema";
import { ingestBodySchema, ingestBodyToRows } from "@/lib/ingest/schema";

export async function applyIngestJson(raw: unknown) {
  const parsed = ingestBodySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, status: 400, error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  const body = parsed.data;
  const storeRow = await db.select().from(stores).where(eq(stores.id, body.storeId)).limit(1);
  const store = storeRow[0];
  if (!store) {
    return { ok: false as const, status: 401, error: "Unknown store" };
  }

  const validSecret = await bcrypt.compare(body.secret, store.syncSecretHash);
  if (!validSecret) {
    return { ok: false as const, status: 401, error: "Invalid credentials" };
  }

  const { bills, billLines, inventoryItems } = ingestBodyToRows(body);

  const now = new Date();
  let billCount = 0;
  let lineCount = 0;
  let invCount = 0;

  await db.transaction(async (tx) => {
    for (const b of bills) {
      await tx
        .insert(cloudBills)
        .values({
          storeId: body.storeId,
          deviceBillId: b.deviceBillId,
          billNumber: b.billNumber,
          status: b.status,
          orderType: b.orderType,
          tableId: b.tableId,
          paymentMethod: b.paymentMethod,
          discountType: b.discountType,
          discountValue: b.discountValue,
          discountRupee: b.discountRupee,
          subtotalRupee: b.subtotalRupee,
          totalRupee: b.totalRupee,
          createdAt: b.createdAt,
          completedAt: b.completedAt,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [cloudBills.storeId, cloudBills.deviceBillId],
          set: {
            billNumber: b.billNumber,
            status: b.status,
            orderType: b.orderType,
            tableId: b.tableId,
            paymentMethod: b.paymentMethod,
            discountType: b.discountType,
            discountValue: b.discountValue,
            discountRupee: b.discountRupee,
            subtotalRupee: b.subtotalRupee,
            totalRupee: b.totalRupee,
            createdAt: b.createdAt,
            completedAt: b.completedAt,
            updatedAt: now,
          },
        });
      billCount += 1;
    }

    for (const l of billLines) {
      await tx
        .insert(cloudBillLines)
        .values({
          storeId: body.storeId,
          deviceLineId: l.deviceLineId,
          deviceBillId: l.deviceBillId,
          productId: l.productId,
          qty: l.qty,
          productNameSnapshot: l.productNameSnapshot,
          unitPriceRupeeSnapshot: l.unitPriceRupeeSnapshot,
          includeInKotSnapshot: l.includeInKotSnapshot,
          lineTotalRupee: l.lineTotalRupee,
          qtyKotSent: l.qtyKotSent,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [cloudBillLines.storeId, cloudBillLines.deviceLineId],
          set: {
            deviceBillId: l.deviceBillId,
            productId: l.productId,
            qty: l.qty,
            productNameSnapshot: l.productNameSnapshot,
            unitPriceRupeeSnapshot: l.unitPriceRupeeSnapshot,
            includeInKotSnapshot: l.includeInKotSnapshot,
            lineTotalRupee: l.lineTotalRupee,
            qtyKotSent: l.qtyKotSent,
            updatedAt: now,
          },
        });
      lineCount += 1;
    }

    for (const i of inventoryItems) {
      await tx
        .insert(cloudInventoryItems)
        .values({
          storeId: body.storeId,
          deviceInventoryId: i.deviceInventoryId,
          name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          maxStock: i.maxStock,
          category: i.category,
          reorderQty: i.reorderQty,
          createdAt: i.createdAt,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [cloudInventoryItems.storeId, cloudInventoryItems.deviceInventoryId],
          set: {
            name: i.name,
            unit: i.unit,
            quantity: i.quantity,
            maxStock: i.maxStock,
            category: i.category,
            reorderQty: i.reorderQty,
            createdAt: i.createdAt,
            updatedAt: now,
          },
        });
      invCount += 1;
    }

    if (body.business) {
      await tx
        .insert(cloudBusinessSettings)
        .values({
          storeId: body.storeId,
          shopName: body.business.shopName,
          ownerName: body.business.ownerName,
          phone: body.business.phone,
          address: body.business.address,
          gstNumber: body.business.gstNumber,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: cloudBusinessSettings.storeId,
          set: {
            shopName: body.business.shopName,
            ownerName: body.business.ownerName,
            phone: body.business.phone,
            address: body.business.address,
            gstNumber: body.business.gstNumber,
            updatedAt: now,
          },
        });
    }

    await tx
      .update(stores)
      .set({ lastSyncAt: now, updatedAt: now })
      .where(eq(stores.id, body.storeId));
  });

  return {
    ok: true as const,
    applied: { bills: billCount, lines: lineCount, inventory: invCount },
  };
}
