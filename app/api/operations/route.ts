import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/operations - List operations with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    let query = `
      SELECT o.*, u.name as responsible_name,
             sl.name as src_location_name, dl.name as dest_location_name
      FROM operations o
      LEFT JOIN users u ON u.id = o.responsible_user_id
      LEFT JOIN locations sl ON sl.id = o.src_location_id
      LEFT JOIN locations dl ON dl.id = o.dest_location_id
    `;

    const conditions: string[] = [];
    const params: string[] = [];

    if (type) {
      conditions.push(`o.type = $${params.length + 1}`);
      params.push(type);
    }
    if (status) {
      conditions.push(`o.status = $${params.length + 1}`);
      params.push(status);
    }
    if (search) {
      conditions.push(
        `(LOWER(o.ref_no) LIKE LOWER($${params.length + 1}) OR LOWER(o.contact) LIKE LOWER($${params.length + 1}))`
      );
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY o.created_at DESC";

    const operations = await sql(query, params);
    return NextResponse.json({ operations });
  } catch (error) {
    console.error("Operations GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch operations" },
      { status: 500 }
    );
  }
}

// POST /api/operations - Create a new operation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      srcLocationId,
      destLocationId,
      contact,
      scheduledDate,
      responsibleUserId,
      items,
    } = body;

    if (!type || !srcLocationId || !destLocationId) {
      return NextResponse.json(
        { error: "Type, source location, and destination location are required" },
        { status: 400 }
      );
    }

    // Generate reference number
    const typeCodeMap: Record<string, string> = {
      Receipt: "IN",
      Delivery: "OUT",
      Internal: "INT",
      Adjustment: "ADJ",
    };
    const typeCode = typeCodeMap[type] || "OP";

    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM operations WHERE type = ${type}
    `;
    const seq = (countResult[0]?.count || 0) + 1;
    const refNo = `WH/${typeCode}/${String(seq).padStart(5, "0")}`;

    // Create operation
    const [operation] = await sql`
      INSERT INTO operations (ref_no, type, src_location_id, dest_location_id, contact, scheduled_date, status, responsible_user_id)
      VALUES (${refNo}, ${type}, ${srcLocationId}, ${destLocationId}, ${contact || null}, ${scheduledDate || null}, 'Draft', ${responsibleUserId || null})
      RETURNING *
    `;

    // Create line items
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.productId && item.demandQty > 0) {
          await sql`
            INSERT INTO operation_items (operation_id, product_id, demand_qty, done_qty)
            VALUES (${operation.id}, ${item.productId}, ${item.demandQty}, 0)
          `;
        }
      }
    }

    return NextResponse.json({ operation }, { status: 201 });
  } catch (error) {
    console.error("Operations POST error:", error);
    return NextResponse.json(
      { error: "Failed to create operation" },
      { status: 500 }
    );
  }
}
