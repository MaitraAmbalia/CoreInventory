import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/operations/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [operation] = await sql`
      SELECT o.*, u.name as responsible_name,
             sl.name as src_location_name, sl.short_code as src_location_code,
             dl.name as dest_location_name, dl.short_code as dest_location_code
      FROM operations o
      LEFT JOIN users u ON u.id = o.responsible_user_id
      LEFT JOIN locations sl ON sl.id = o.src_location_id
      LEFT JOIN locations dl ON dl.id = o.dest_location_id
      WHERE o.id = ${id}
    `;

    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      );
    }

    // Get line items
    const items = await sql`
      SELECT oi.*, p.name as product_name, p.sku_code
      FROM operation_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.operation_id = ${id}
      ORDER BY p.name
    `;

    return NextResponse.json({ operation, items });
  } catch (error) {
    console.error("Operation GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch operation" },
      { status: 500 }
    );
  }
}

// PUT /api/operations/[id] - Update status or fields
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, items } = body;

    if (status) {
      await sql`UPDATE operations SET status = ${status} WHERE id = ${id}`;
    }

    // Update done_qty for items
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.id && item.doneQty !== undefined) {
          await sql`
            UPDATE operation_items SET done_qty = ${item.doneQty} WHERE id = ${item.id}
          `;
        }
      }
    }

    const [operation] = await sql`SELECT * FROM operations WHERE id = ${id}`;
    return NextResponse.json({ operation });
  } catch (error) {
    console.error("Operation PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update operation" },
      { status: 500 }
    );
  }
}
