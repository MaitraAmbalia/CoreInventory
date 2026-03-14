import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireManager } from "@/lib/auth";

export async function GET() {
  try {
    await requireManager();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      totalCategories,
      totalWarehouses,
      totalLocations,
      totalUsers,
      allStockLevels,
      operationsByType,
      operationsByStatus,
      recentMoves,
      topMovedProducts,
      last30DaysOps,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.warehouse.count(),
      prisma.location.count(),
      prisma.user.count(),

      prisma.stockLevel.findMany({
        include: {
          product: { select: { name: true, skuCode: true, lowStockThreshold: true, uom: true } },
          location: { select: { name: true, shortCode: true } },
        },
      }),

      prisma.operation.groupBy({
        by: ["type"],
        _count: { id: true },
      }),

      prisma.operation.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      prisma.stockMoveHistory.findMany({
        where: { timestamp: { gte: sevenDaysAgo } },
        include: {
          product: { select: { name: true, skuCode: true } },
          fromLocation: { select: { shortCode: true } },
          toLocation: { select: { shortCode: true } },
        },
        orderBy: { timestamp: "desc" },
        take: 10,
      }),

      prisma.stockMoveHistory.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      prisma.operation.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { type: true, status: true, createdAt: true },
      }),
    ]);

    let totalStockQty = 0;
    let lowStockProducts: { name: string; sku: string; qty: number; threshold: number; location: string }[] = [];
    const seenLow = new Set<string>();

    for (const sl of allStockLevels) {
      const qty = Number(sl.qtyOnHand);
      totalStockQty += qty;
      if (qty <= sl.product.lowStockThreshold && qty > 0 && !seenLow.has(sl.productId)) {
        seenLow.add(sl.productId);
        lowStockProducts.push({
          name: sl.product.name,
          sku: sl.product.skuCode,
          qty,
          threshold: sl.product.lowStockThreshold,
          location: sl.location.shortCode,
        });
      }
    }

    lowStockProducts.sort((a, b) => a.qty - b.qty);
    lowStockProducts = lowStockProducts.slice(0, 10);

    const topProducts = await Promise.all(
      topMovedProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { name: true, skuCode: true },
        });
        return {
          name: product?.name || "Unknown",
          sku: product?.skuCode || "",
          totalQtyMoved: Number(tp._sum.quantity || 0),
          moveCount: tp._count.id,
        };
      })
    );

    const typeCounts: Record<string, number> = {};
    for (const t of operationsByType) {
      typeCounts[t.type] = t._count.id;
    }

    const statusCounts: Record<string, number> = {};
    for (const s of operationsByStatus) {
      statusCounts[s.status] = s._count.id;
    }

    const dailyOps: Record<string, { receipts: number; deliveries: number; internal: number; adjustments: number }> = {};
    for (const op of last30DaysOps) {
      const day = op.createdAt.toISOString().split("T")[0];
      if (!dailyOps[day]) dailyOps[day] = { receipts: 0, deliveries: 0, internal: 0, adjustments: 0 };
      if (op.type === "Receipt") dailyOps[day].receipts++;
      else if (op.type === "Delivery") dailyOps[day].deliveries++;
      else if (op.type === "Internal") dailyOps[day].internal++;
      else if (op.type === "Adjustment") dailyOps[day].adjustments++;
    }

    const trendData = Object.entries(dailyOps)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    return NextResponse.json({
      overview: {
        totalProducts,
        totalCategories,
        totalWarehouses,
        totalLocations,
        totalUsers,
        totalStockQty: Math.round(totalStockQty),
        lowStockCount: seenLow.size,
      },
      operationsByType: typeCounts,
      operationsByStatus: statusCounts,
      lowStockProducts,
      topMovedProducts: topProducts,
      trendData,
      recentMoves: recentMoves.map((m) => ({
        id: m.id,
        product: m.product.name,
        sku: m.product.skuCode,
        from: m.fromLocation?.shortCode || "—",
        to: m.toLocation?.shortCode || "—",
        qty: Number(m.quantity),
        timestamp: m.timestamp,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
