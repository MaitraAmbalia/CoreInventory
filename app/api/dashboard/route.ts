import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("type") || "";
    const filterStatus = searchParams.get("status") || "";
    const filterWarehouse = searchParams.get("warehouse") || "";
    const filterCategory = searchParams.get("category") || "";

    const now = new Date();

    // Build operation filter conditions
    const opWhere: Record<string, unknown> = {};
    if (filterType) opWhere.type = filterType;
    if (filterStatus) opWhere.status = filterStatus;
    if (filterWarehouse) {
      opWhere.OR = [
        { srcLocation: { warehouseId: filterWarehouse } },
        { destLocation: { warehouseId: filterWarehouse } },
      ];
    }

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
      warehouses,
      categories,
      lowStockProducts,
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
        take: 10,
        orderBy: { createdAt: "desc" },
        where: Object.keys(opWhere).length > 0 ? opWhere : undefined,
        include: {
          responsibleUser: { select: { name: true } },
          srcLocation: { select: { name: true, warehouse: { select: { name: true } } } },
          destLocation: { select: { name: true, warehouse: { select: { name: true } } } },
        },
      }),
      prisma.stockLevel.findMany({
        where: { qtyOnHand: { gt: 0 } },
        include: { product: { select: { lowStockThreshold: true } } },
      }),
      prisma.warehouse.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, shortCode: true } }),
      prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
      // Get products that are low stock for alerts
      prisma.product.findMany({
        include: {
          stockLevels: { select: { qtyOnHand: true, location: { select: { name: true, warehouse: { select: { name: true } } } } } },
          category: { select: { name: true } },
        },
      }),
    ]);

    const seenProductIds = new Set<string>();
    let lowStockItems = 0;
    for (const sl of lowStockLevels) {
      if (Number(sl.qtyOnHand) <= sl.product.lowStockThreshold && !seenProductIds.has(sl.productId)) {
        seenProductIds.add(sl.productId);
        lowStockItems++;
      }
    }

    // Build low stock alerts list
    const lowStockAlerts = lowStockProducts
      .map((p) => {
        const totalStock = p.stockLevels.reduce((sum, sl) => sum + Number(sl.qtyOnHand), 0);
        if (totalStock <= p.lowStockThreshold && totalStock >= 0) {
          return {
            id: p.id,
            name: p.name,
            skuCode: p.skuCode,
            category: p.category?.name ?? null,
            currentStock: totalStock,
            threshold: p.lowStockThreshold,
            deficit: p.lowStockThreshold - totalStock,
            severity: totalStock === 0 ? "critical" : totalStock <= p.lowStockThreshold * 0.5 ? "warning" : "low",
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (a!.severity === "critical" ? -1 : 1) - (b!.severity === "critical" ? -1 : 1));

    return NextResponse.json({
      totalProducts,
      lowStockItems,
      pendingReceipts,
      pendingDeliveries,
      lateReceipts,
      waitingReceipts,
      lateDeliveries,
      waitingDeliveries,
      warehouses,
      categories,
      lowStockAlerts,
      recentOperations: recentOperations.map((op) => ({
        id: op.id,
        ref_no: op.refNo,
        type: op.type,
        status: op.status,
        contact: op.contact,
        scheduled_date: op.scheduledDate,
        created_at: op.createdAt,
        responsible_name: op.responsibleUser?.name ?? null,
        src_location: op.srcLocation?.name ?? null,
        dest_location: op.destLocation?.name ?? null,
        src_warehouse: op.srcLocation?.warehouse?.name ?? null,
        dest_warehouse: op.destLocation?.warehouse?.name ?? null,
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
