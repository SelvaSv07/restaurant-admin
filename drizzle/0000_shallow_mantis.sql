CREATE TABLE "cloud_bill_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"device_line_id" integer NOT NULL,
	"device_bill_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"qty" integer NOT NULL,
	"product_name_snapshot" text NOT NULL,
	"unit_price_rupee_snapshot" integer NOT NULL,
	"include_in_kot_snapshot" boolean DEFAULT false NOT NULL,
	"line_total_rupee" integer NOT NULL,
	"qty_kot_sent" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"device_bill_id" integer NOT NULL,
	"bill_number" text NOT NULL,
	"status" text NOT NULL,
	"order_type" text NOT NULL,
	"table_id" integer,
	"payment_method" text,
	"discount_type" text NOT NULL,
	"discount_value" integer DEFAULT 0 NOT NULL,
	"discount_rupee" integer DEFAULT 0 NOT NULL,
	"subtotal_rupee" integer DEFAULT 0 NOT NULL,
	"total_rupee" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud_business_settings" (
	"store_id" uuid PRIMARY KEY NOT NULL,
	"shop_name" text DEFAULT '' NOT NULL,
	"owner_name" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"gst_number" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cloud_inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"device_inventory_id" integer NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"max_stock" integer,
	"category" text DEFAULT 'General' NOT NULL,
	"reorder_qty" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sync_secret_hash" text NOT NULL,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cloud_bill_lines" ADD CONSTRAINT "cloud_bill_lines_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cloud_bills" ADD CONSTRAINT "cloud_bills_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cloud_business_settings" ADD CONSTRAINT "cloud_business_settings_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cloud_inventory_items" ADD CONSTRAINT "cloud_inventory_items_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cloud_bill_lines_store_line_idx" ON "cloud_bill_lines" USING btree ("store_id","device_line_id");--> statement-breakpoint
CREATE INDEX "cloud_bill_lines_store_bill_idx" ON "cloud_bill_lines" USING btree ("store_id","device_bill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cloud_bills_store_device_idx" ON "cloud_bills" USING btree ("store_id","device_bill_id");--> statement-breakpoint
CREATE INDEX "cloud_bills_store_created_idx" ON "cloud_bills" USING btree ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "cloud_bills_store_completed_idx" ON "cloud_bills" USING btree ("store_id","completed_at");--> statement-breakpoint
CREATE INDEX "cloud_business_settings_shop_name_idx" ON "cloud_business_settings" USING btree ("shop_name");--> statement-breakpoint
CREATE UNIQUE INDEX "cloud_inventory_store_device_idx" ON "cloud_inventory_items" USING btree ("store_id","device_inventory_id");--> statement-breakpoint
CREATE INDEX "cloud_inventory_store_name_idx" ON "cloud_inventory_items" USING btree ("store_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "stores_slug_idx" ON "stores" USING btree ("slug");