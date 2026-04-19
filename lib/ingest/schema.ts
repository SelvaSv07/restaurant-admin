import { z } from "zod";

const billSchema = z.object({
  deviceBillId: z.number().int().positive(),
  billNumber: z.string().min(1),
  status: z.enum(["draft", "completed", "voided"]),
  orderType: z.enum(["dine_in", "takeaway"]),
  tableId: z.number().int().nullable(),
  paymentMethod: z.enum(["cash", "card", "upi", "other"]).nullable(),
  discountType: z.enum(["none", "fixed", "percent"]),
  discountValue: z.number().int(),
  discountRupee: z.number().int(),
  subtotalRupee: z.number().int(),
  totalRupee: z.number().int(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
});

const billLineSchema = z.object({
  deviceLineId: z.number().int().positive(),
  deviceBillId: z.number().int().positive(),
  productId: z.number().int(),
  qty: z.number().int(),
  productNameSnapshot: z.string(),
  unitPriceRupeeSnapshot: z.number().int(),
  includeInKotSnapshot: z.boolean(),
  lineTotalRupee: z.number().int(),
  qtyKotSent: z.number().int(),
});

const inventorySchema = z.object({
  deviceInventoryId: z.number().int().positive(),
  name: z.string(),
  unit: z.string(),
  quantity: z.number().int(),
  maxStock: z.number().int().nullable(),
  category: z.string(),
  reorderQty: z.number().int(),
  createdAt: z.string(),
});

const businessSchema = z.object({
  shopName: z.string(),
  ownerName: z.string(),
  phone: z.string(),
  address: z.string(),
  gstNumber: z.string(),
});

export const ingestBodySchema = z.object({
  version: z.literal(1),
  syncedAt: z.string(),
  storeId: z.string().uuid(),
  secret: z.string().min(8),
  bills: z.array(billSchema),
  billLines: z.array(billLineSchema),
  inventoryItems: z.array(inventorySchema),
  business: businessSchema.nullable().optional(),
});

export type IngestBody = z.infer<typeof ingestBodySchema>;

function parseIso(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${s}`);
  return d;
}

export function ingestBodyToRows(body: IngestBody) {
  const bills = body.bills.map((b) => ({
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
    createdAt: parseIso(b.createdAt),
    completedAt: b.completedAt ? parseIso(b.completedAt) : null,
  }));

  const billLines = body.billLines.map((l) => ({
    deviceLineId: l.deviceLineId,
    deviceBillId: l.deviceBillId,
    productId: l.productId,
    qty: l.qty,
    productNameSnapshot: l.productNameSnapshot,
    unitPriceRupeeSnapshot: l.unitPriceRupeeSnapshot,
    includeInKotSnapshot: l.includeInKotSnapshot,
    lineTotalRupee: l.lineTotalRupee,
    qtyKotSent: l.qtyKotSent,
  }));

  const inventoryItems = body.inventoryItems.map((i) => ({
    deviceInventoryId: i.deviceInventoryId,
    name: i.name,
    unit: i.unit,
    quantity: i.quantity,
    maxStock: i.maxStock,
    category: i.category || "General",
    reorderQty: i.reorderQty,
    createdAt: parseIso(i.createdAt),
  }));

  return { bills, billLines, inventoryItems };
}
