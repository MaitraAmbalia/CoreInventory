import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/products - List all products with stock info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    let query = `
      SELECT p.*, c.name as category_name,
        COALESCE(SUM(sl.qty_on_hand), 0)::decimal as total_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN stock_levels sl ON sl.product_id = p.id
    `;

    const conditions: string[] = [];
    const params: string[] = [];

    if (search) {
      conditions.push(
        `(LOWER(p.name) LIKE LOWER($${params.length + 1}) OR LOWER(p.sku_code) LIKE LOWER($${params.length + 1}))`
      );
      params.push(`%${search}%`);
    }

    if (category) {
      conditions.push(`p.category_id = $${params.length + 1}`);
      params.push(category);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY p.id, c.name ORDER BY p.name ASC";

    const products = await sql(query, params);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, skuCode, categoryId, uom, description, lowStockThreshold } =
      body;

    if (!name || !skuCode) {
      return NextResponse.json(
        { error: "Name and SKU code are required" },
        { status: 400 }
      );
    }

    // Check SKU uniqueness
    const existing = await sql`SELECT id FROM products WHERE sku_code = ${skuCode}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A product with this SKU code already exists" },
        { status: 409 }
      );
    }

    const [product] = await sql`
      INSERT INTO products (name, sku_code, category_id, uom, description, low_stock_threshold)
      VALUES (
        ${name},
        ${skuCode},
        ${categoryId || null},
        ${uom || "Units"},
        ${description || null},
        ${lowStockThreshold || 10}
      )
      RETURNING *
    `;

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
