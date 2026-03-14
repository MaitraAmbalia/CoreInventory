import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Total products
    const totalProductsResult = await sql`SELECT COUNT(*)::int as count FROM products`;
    const totalProducts = totalProductsResult[0]?.count || 0;

    // Low stock items
    const lowStockResult = await sql`
      SELECT COUNT(DISTINCT sl.product_id)::int as count
      FROM stock_levels sl
      JOIN products p ON p.id = sl.product_id
      WHERE sl.qty_on_hand <= p.low_stock_threshold AND sl.qty_on_hand > 0
    `;
    const lowStockItems = lowStockResult[0]?.count || 0;

    // Pending Receipts (Draft + Waiting + Ready)
    const pendingReceiptsResult = await sql`
      SELECT COUNT(*)::int as count FROM operations
      WHERE type = 'Receipt' AND status != 'Done'
    `;
    const pendingReceipts = pendingReceiptsResult[0]?.count || 0;

    // Pending Deliveries
    const pendingDeliveriesResult = await sql`
      SELECT COUNT(*)::int as count FROM operations
      WHERE type = 'Delivery' AND status != 'Done'
    `;
    const pendingDeliveries = pendingDeliveriesResult[0]?.count || 0;

    // Late Receipts (scheduled_date < now and not Done)
    const lateReceiptsResult = await sql`
      SELECT COUNT(*)::int as count FROM operations
      WHERE type = 'Receipt' AND status != 'Done' AND scheduled_date < NOW()
    `;
    const lateReceipts = lateReceiptsResult[0]?.count || 0;

    // Waiting Receipts
    const waitingReceiptsResult = await sql`
      SELECT COUNT(*)::int as count FROM operations
      WHERE type = 'Receipt' AND status = 'Waiting'
    `;
    const waitingReceipts = waitingReceiptsResult[0]?.count || 0;

    // Late Deliveries
    const lateDeliveriesResult = await sql`
      SELECT COUNT(*)::int as count FROM operations
      WHERE type = 'Delivery' AND status != 'Done' AND scheduled_date < NOW()
    `;
    const lateDeliveries = lateDeliveriesResult[0]?.count || 0;

    // Waiting Deliveries
    const waitingDeliveriesResult = await sql`
      SELECT COUNT(*)::int as count FROM operations
      WHERE type = 'Delivery' AND status = 'Waiting'
    `;
    const waitingDeliveries = waitingDeliveriesResult[0]?.count || 0;

    // Recent operations
    const recentOps = await sql`
      SELECT o.id, o.ref_no, o.type, o.status, o.contact, o.scheduled_date, o.created_at,
             u.name as responsible_name
      FROM operations o
      LEFT JOIN users u ON u.id = o.responsible_user_id
      ORDER BY o.created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      totalProducts,
      lowStockItems,
      pendingReceipts,
      pendingDeliveries,
      lateReceipts,
      waitingReceipts,
      lateDeliveries,
      waitingDeliveries,
      recentOperations: recentOps,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
