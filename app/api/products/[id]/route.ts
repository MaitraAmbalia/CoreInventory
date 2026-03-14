import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/products/[id] - Get single product with stock per location
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [product] = await sql`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ${id}
    `;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Stock per location
    const stockLevels = await sql`
      SELECT sl.*, l.name as location_name, l.short_code as location_code,
             w.name as warehouse_name, w.short_code as warehouse_code
      FROM stock_levels sl
      JOIN locations l ON l.id = sl.location_id
      LEFT JOIN warehouses w ON w.id = l.warehouse_id
      WHERE sl.product_id = ${id}
      ORDER BY w.name, l.name
    `;

    return NextResponse.json({ product, stockLevels });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, skuCode, categoryId, uom, description, lowStockThreshold } =
      body;

    // Check SKU uniqueness (exclude current product)
    if (skuCode) {
      const existing = await sql`SELECT id FROM products WHERE sku_code = ${skuCode} AND id != ${id}`;
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "A product with this SKU code already exists" },
          { status: 409 }
        );
      }
    }

    const [product] = await sql`
      UPDATE products SET
        name = COALESCE(${name}, name),
        sku_code = COALESCE(${skuCode}, sku_code),
        category_id = ${categoryId || null},
        uom = COALESCE(${uom}, uom),
        description = ${description || null},
        low_stock_threshold = COALESCE(${lowStockThreshold || null}, low_stock_threshold)
      WHERE id = ${id}
      RETURNING *
    `;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`;

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
