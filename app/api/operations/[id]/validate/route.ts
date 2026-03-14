import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// POST /api/operations/[id]/validate - Validate (finalize) an operation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get operation
    const [operation] = await sql`SELECT * FROM operations WHERE id = ${id}`;
    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      );
    }

    if (operation.status === "Done") {
      return NextResponse.json(
        { error: "Operation is already validated" },
        { status: 400 }
      );
    }

    // Get items
    const items = await sql`
      SELECT * FROM operation_items WHERE operation_id = ${id}
    `;

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Cannot validate an operation with no items" },
        { status: 400 }
      );
    }

    // Process each item with double-entry logic
    for (const item of items) {
      const qty = parseFloat(item.done_qty) || parseFloat(item.demand_qty);

      if (qty <= 0) continue;

      // ─── Decrease stock at source location ───
      if (operation.src_location_id) {
        const existingSrc = await sql`
          SELECT id, qty_on_hand, qty_available FROM stock_levels
          WHERE product_id = ${item.product_id} AND location_id = ${operation.src_location_id}
        `;

        if (existingSrc.length > 0) {
          await sql`
            UPDATE stock_levels SET
              qty_on_hand = GREATEST(qty_on_hand - ${qty}, 0),
              qty_available = GREATEST(qty_available - ${qty}, 0)
            WHERE id = ${existingSrc[0].id}
          `;
        }
      }

      // ─── Increase stock at destination location ───
      if (operation.dest_location_id) {
        const existingDest = await sql`
          SELECT id FROM stock_levels
          WHERE product_id = ${item.product_id} AND location_id = ${operation.dest_location_id}
        `;

        if (existingDest.length > 0) {
          await sql`
            UPDATE stock_levels SET
              qty_on_hand = qty_on_hand + ${qty},
              qty_available = qty_available + ${qty}
            WHERE id = ${existingDest[0].id}
          `;
        } else {
          await sql`
            INSERT INTO stock_levels (product_id, location_id, qty_on_hand, qty_available)
            VALUES (${item.product_id}, ${operation.dest_location_id}, ${qty}, ${qty})
          `;
        }
      }

      // ─── Create immutable move history record ───
      await sql`
        INSERT INTO stock_move_history (product_id, from_location_id, to_location_id, quantity, operation_id)
        VALUES (${item.product_id}, ${operation.src_location_id}, ${operation.dest_location_id}, ${qty}, ${id})
      `;
    }

    // Mark operation as Done
    await sql`UPDATE operations SET status = 'Done' WHERE id = ${id}`;

    // Also mark items done
    await sql`UPDATE operation_items SET done_qty = demand_qty WHERE operation_id = ${id} AND done_qty = 0`;

    return NextResponse.json({
      success: true,
      message: "Operation validated successfully",
    });
  } catch (error) {
    console.error("Validate error:", error);
    return NextResponse.json(
      { error: "Failed to validate operation" },
      { status: 500 }
    );
  }
}
