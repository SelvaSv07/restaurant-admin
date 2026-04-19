import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const stores = pgTable(
  "stores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    syncSecretHash: text("sync_secret_hash").notNull(),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("stores_slug_idx").on(t.slug)],
);

export const cloudBusinessSettings = pgTable(
  "cloud_business_settings",
  {
    storeId: uuid("store_id")
      .primaryKey()
      .references(() => stores.id, { onDelete: "cascade" }),
    shopName: text("shop_name").notNull().default(""),
    ownerName: text("owner_name").notNull().default(""),
    phone: text("phone").notNull().default(""),
    address: text("address").notNull().default(""),
    gstNumber: text("gst_number").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("cloud_business_settings_shop_name_idx").on(t.shopName)],
);

export const cloudBills = pgTable(
  "cloud_bills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    deviceBillId: integer("device_bill_id").notNull(),
    billNumber: text("bill_number").notNull(),
    status: text("status", { enum: ["draft", "completed", "voided"] }).notNull(),
    orderType: text("order_type", { enum: ["dine_in", "takeaway"] }).notNull(),
    tableId: integer("table_id"),
    paymentMethod: text("payment_method", {
      enum: ["cash", "card", "upi", "other"],
    }),
    discountType: text("discount_type", { enum: ["none", "fixed", "percent"] }).notNull(),
    discountValue: integer("discount_value").notNull().default(0),
    discountRupee: integer("discount_rupee").notNull().default(0),
    subtotalRupee: integer("subtotal_rupee").notNull().default(0),
    totalRupee: integer("total_rupee").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("cloud_bills_store_device_idx").on(t.storeId, t.deviceBillId),
    index("cloud_bills_store_created_idx").on(t.storeId, t.createdAt),
    index("cloud_bills_store_completed_idx").on(t.storeId, t.completedAt),
  ],
);

export const cloudBillLines = pgTable(
  "cloud_bill_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    deviceLineId: integer("device_line_id").notNull(),
    deviceBillId: integer("device_bill_id").notNull(),
    productId: integer("product_id").notNull(),
    qty: integer("qty").notNull(),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    unitPriceRupeeSnapshot: integer("unit_price_rupee_snapshot").notNull(),
    includeInKotSnapshot: boolean("include_in_kot_snapshot").notNull().default(false),
    lineTotalRupee: integer("line_total_rupee").notNull(),
    qtyKotSent: integer("qty_kot_sent").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("cloud_bill_lines_store_line_idx").on(t.storeId, t.deviceLineId),
    index("cloud_bill_lines_store_bill_idx").on(t.storeId, t.deviceBillId),
  ],
);

export const cloudInventoryItems = pgTable(
  "cloud_inventory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    deviceInventoryId: integer("device_inventory_id").notNull(),
    name: text("name").notNull(),
    unit: text("unit").notNull(),
    quantity: integer("quantity").notNull().default(0),
    maxStock: integer("max_stock"),
    category: text("category").notNull().default("General"),
    reorderQty: integer("reorder_qty").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("cloud_inventory_store_device_idx").on(t.storeId, t.deviceInventoryId),
    index("cloud_inventory_store_name_idx").on(t.storeId, t.name),
  ],
);
