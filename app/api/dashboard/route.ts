import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();

    const [
      totalProducts,
      pendingReceipts,
      pendingDeliveries,
      lateReceipts,
      waitingReceipts,
      lateDeliveries,
      waitingDeliveries,
      recentOperations,
      lowStockLevels,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.operation.count({ where: { type: "Receipt", status: { not: "Done" } } }),
      prisma.operation.count({ where: { type: "Delivery", status: { not: "Done" } } }),
      prisma.operation.count({
        where: { type: "Receipt", status: { not: "Done" }, scheduledDate: { lt: now } },
      }),
      prisma.operation.count({ where: { type: "Receipt", status: "Waiting" } }),
      prisma.operation.count({
        where: { type: "Delivery", status: { not: "Done" }, scheduledDate: { lt: now } },
      }),
      prisma.operation.count({ where: { type: "Delivery", status: "Waiting" } }),
      prisma.operation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { responsibleUser: { select: { name: true } } },
      }),
      prisma.stockLevel.findMany({
        where: { qtyOnHand: { gt: 0 } },
        include: { product: { select: { lowStockThreshold: true } } },
      }),
    ]);

    // Count distinct products that are low on stock
    const seenProductIds = new Set<string>();
    let lowStockItems = 0;
    for (const sl of lowStockLevels) {
      if (Number(sl.qtyOnHand) <= sl.product.lowStockThreshold && !seenProductIds.has(sl.productId)) {
        seenProductIds.add(sl.productId);
        lowStockItems++;
      }
    }

    return NextResponse.json({
      totalProducts,
      lowStockItems,
      pendingReceipts,
      pendingDeliveries,
      lateReceipts,
      waitingReceipts,
      lateDeliveries,
      waitingDeliveries,
      recentOperations: recentOperations.map((op) => ({
        id: op.id,
        ref_no: op.refNo,
        type: op.type,
        status: op.status,
        contact: op.contact,
        scheduled_date: op.scheduledDate,
        created_at: op.createdAt,
        responsible_name: op.responsibleUser?.name ?? null,
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
