import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST() {
  try {
    // Create enums
    await sql`DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('Manager', 'Staff');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$`;

    await sql`DO $$ BEGIN
      CREATE TYPE operation_type AS ENUM ('Receipt', 'Delivery', 'Internal', 'Adjustment');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$`;

    await sql`DO $$ BEGIN
      CREATE TYPE operation_status AS ENUM ('Draft', 'Waiting', 'Ready', 'Done');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$`;

    // Create tables
    await sql`CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role user_role NOT NULL DEFAULT 'Staff',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS warehouses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      short_code VARCHAR(20) NOT NULL UNIQUE,
      address TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS locations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      short_code VARCHAR(50) NOT NULL,
      is_scrap BOOLEAN NOT NULL DEFAULT false
    )`;

    await sql`CREATE TABLE IF NOT EXISTS categories (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT
    )`;

    await sql`CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sku_code VARCHAR(100) NOT NULL UNIQUE,
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      uom VARCHAR(50) NOT NULL DEFAULT 'Units',
      description TEXT,
      low_stock_threshold INTEGER NOT NULL DEFAULT 10
    )`;

    await sql`CREATE TABLE IF NOT EXISTS stock_levels (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      qty_on_hand DECIMAL(12,2) NOT NULL DEFAULT 0,
      qty_available DECIMAL(12,2) NOT NULL DEFAULT 0
    )`;

    await sql`CREATE TABLE IF NOT EXISTS operations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      ref_no VARCHAR(50) NOT NULL UNIQUE,
      type operation_type NOT NULL,
      src_location_id UUID REFERENCES locations(id),
      dest_location_id UUID REFERENCES locations(id),
      contact VARCHAR(255),
      scheduled_date TIMESTAMP,
      status operation_status NOT NULL DEFAULT 'Draft',
      responsible_user_id UUID REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS operation_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      demand_qty DECIMAL(12,2) NOT NULL,
      done_qty DECIMAL(12,2) NOT NULL DEFAULT 0
    )`;

    await sql`CREATE TABLE IF NOT EXISTS stock_move_history (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      from_location_id UUID REFERENCES locations(id),
      to_location_id UUID REFERENCES locations(id),
      quantity DECIMAL(12,2) NOT NULL,
      operation_id UUID REFERENCES operations(id),
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

    // Seed default category
    await sql`INSERT INTO categories (name, description)
      SELECT 'General', 'Default category for uncategorized items'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'General')`;

    // Seed default warehouse
    await sql`INSERT INTO warehouses (name, short_code, address)
      SELECT 'Main Warehouse', 'WH', 'Default warehouse address'
      WHERE NOT EXISTS (SELECT 1 FROM warehouses WHERE short_code = 'WH')`;

    // Seed default locations for the main warehouse
    const warehouseRows = await sql`SELECT id FROM warehouses WHERE short_code = 'WH' LIMIT 1`;
    if (warehouseRows.length > 0) {
      const whId = warehouseRows[0].id;

      await sql`INSERT INTO locations (warehouse_id, name, short_code, is_scrap)
        SELECT ${whId}, 'Stock', 'WH/STOCK', false
        WHERE NOT EXISTS (SELECT 1 FROM locations WHERE short_code = 'WH/STOCK')`;

      await sql`INSERT INTO locations (warehouse_id, name, short_code, is_scrap)
        SELECT ${whId}, 'Input (Vendors)', 'WH/INPUT', false
        WHERE NOT EXISTS (SELECT 1 FROM locations WHERE short_code = 'WH/INPUT')`;

      await sql`INSERT INTO locations (warehouse_id, name, short_code, is_scrap)
        SELECT ${whId}, 'Output (Customers)', 'WH/OUTPUT', false
        WHERE NOT EXISTS (SELECT 1 FROM locations WHERE short_code = 'WH/OUTPUT')`;

      await sql`INSERT INTO locations (warehouse_id, name, short_code, is_scrap)
        SELECT ${whId}, 'Scrap', 'WH/SCRAP', true
        WHERE NOT EXISTS (SELECT 1 FROM locations WHERE short_code = 'WH/SCRAP')`;
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
