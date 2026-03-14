import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["Manager", "Staff"]);
export const operationTypeEnum = pgEnum("operation_type", [
  "Receipt",
  "Delivery",
  "Internal",
  "Adjustment",
]);
export const operationStatusEnum = pgEnum("operation_status", [
  "Draft",
  "Waiting",
  "Ready",
  "Done",
]);

// ─── 1. Users ────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("Staff").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 2. Warehouses ───────────────────────────────────────
export const warehouses = pgTable("warehouses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  shortCode: varchar("short_code", { length: 20 }).notNull().unique(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 3. Locations ────────────────────────────────────────
export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id, {
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  shortCode: varchar("short_code", { length: 50 }).notNull(),
  isScrap: boolean("is_scrap").default(false).notNull(),
});

// ─── 4. Categories ───────────────────────────────────────
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

// ─── 5. Products ─────────────────────────────────────────
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  skuCode: varchar("sku_code", { length: 100 }).notNull().unique(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  uom: varchar("uom", { length: 50 }).default("Units").notNull(),
  description: text("description"),
  lowStockThreshold: integer("low_stock_threshold").default(10).notNull(),
});

// ─── 6. Stock Levels ─────────────────────────────────────
export const stockLevels = pgTable("stock_levels", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  locationId: uuid("location_id")
    .references(() => locations.id, { onDelete: "cascade" })
    .notNull(),
  qtyOnHand: decimal("qty_on_hand", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  qtyAvailable: decimal("qty_available", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
});

// ─── 7. Operations ───────────────────────────────────────
export const operations = pgTable("operations", {
  id: uuid("id").defaultRandom().primaryKey(),
  refNo: varchar("ref_no", { length: 50 }).notNull().unique(),
  type: operationTypeEnum("type").notNull(),
  srcLocationId: uuid("src_location_id").references(() => locations.id),
  destLocationId: uuid("dest_location_id").references(() => locations.id),
  contact: varchar("contact", { length: 255 }),
  scheduledDate: timestamp("scheduled_date"),
  status: operationStatusEnum("status").default("Draft").notNull(),
  responsibleUserId: uuid("responsible_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── 8. Operation Items ─────────────────────────────────
export const operationItems = pgTable("operation_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  operationId: uuid("operation_id")
    .references(() => operations.id, { onDelete: "cascade" })
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  demandQty: decimal("demand_qty", { precision: 12, scale: 2 }).notNull(),
  doneQty: decimal("done_qty", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
});

// ─── 9. Stock Move History ───────────────────────────────
export const stockMoveHistory = pgTable("stock_move_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  fromLocationId: uuid("from_location_id").references(() => locations.id),
  toLocationId: uuid("to_location_id").references(() => locations.id),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
  operationId: uuid("operation_id").references(() => operations.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
