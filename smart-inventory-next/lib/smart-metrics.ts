import { prisma } from "@/lib/prisma";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export async function getDashboardMetrics() {
  const products = await prisma.product.findMany({
    include: {
      quants: true
    }
  });

  const now = Date.now();
  let deadStockCount = 0;
  let totalStockValue = 0;

  for (const product of products) {
    const isDeadStock = !product.lastMoveAt || now - product.lastMoveAt.getTime() > NINETY_DAYS_MS;
    if (isDeadStock && product.qtyAvailable > 0) {
      deadStockCount += 1;
    }

    const syntheticUnitCost = Math.max(8, product.reorderingMaxQty * 0.15);
    totalStockValue += product.qtyAvailable * syntheticUnitCost;
  }

  const pendingP2PTransfers = await prisma.stockMove.count({
    where: {
      status: "READY"
    }
  });

  const highRiskExpiries = await prisma.product.count({
    where: {
      sustainabilityRisk: "HIGH"
    }
  });

  return {
    totalStockValue: Number(totalStockValue.toFixed(2)),
    deadStockCount,
    pendingP2PTransfers,
    highRiskExpiries
  };
}

export async function getP2PSuggestions() {
  const products = await prisma.product.findMany({ include: { quants: { include: { warehouse: true } } } });
  const suggestions: Array<{
    product: string;
    warehouse: string;
    available: number;
    maxQty: number;
  }> = [];

  for (const product of products) {
    for (const quant of product.quants) {
      const available = quant.quantity - quant.reserved;
      if (available > product.reorderingMaxQty && product.reorderingMaxQty > 0) {
        suggestions.push({
          product: product.name,
          warehouse: quant.warehouse.name,
          available,
          maxQty: product.reorderingMaxQty
        });
      }
    }
  }

  return suggestions.slice(0, 6);
}

export async function getLocationHeatmap() {
  const locations = await prisma.location.findMany({
    include: {
      warehouse: true
    },
    orderBy: [{ activityIndex: "desc" }, { name: "asc" }]
  });

  return locations.map((location) => {
    let level: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (location.activityIndex >= 100) {
      level = "HIGH";
    } else if (location.activityIndex >= 35) {
      level = "MEDIUM";
    }

    return {
      id: location.id,
      name: location.name,
      warehouse: location.warehouse.name,
      activityIndex: location.activityIndex,
      level
    };
  });
}

export async function getOptimizedPickPath() {
  const moves = await prisma.stockMove.findMany({
    where: {
      status: "READY"
    },
    include: {
      product: true,
      sourceLocation: true,
      destLocation: true
    },
    orderBy: [{ sourceLocation: { removalOrder: "asc" } }, { sourceLocation: { name: "asc" } }]
  });

  return moves.map((move) => ({
    id: move.id,
    product: move.product.name,
    qty: move.quantity,
    from: move.sourceLocation.name,
    to: move.destLocation.name,
    sourceOrder: move.sourceLocation.removalOrder
  }));
}

export async function getLeaderboardData() {
  const users = await prisma.userScore.findMany({
    orderBy: {
      points: "desc"
    },
    take: 5
  });

  const progress = await prisma.deliveryProgress.findFirst({
    orderBy: {
      capturedAt: "desc"
    }
  });

  const ready = progress?.readyCount ?? 0;
  const done = progress?.doneTodayCount ?? 0;
  const total = ready + done;
  const percent = total > 0 ? Number(((done / total) * 100).toFixed(1)) : 0;

  return {
    users,
    progress: {
      ready,
      done,
      percent
    }
  };
}

export async function createGhostRecovery(input: {
  productId: number;
  foundLocationId: number;
  quantity: number;
  scannedImage?: string;
}) {
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product) {
    throw new Error("Product not found");
  }

  const location = await prisma.location.findUnique({ where: { id: input.foundLocationId } });
  if (!location) {
    throw new Error("Location not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.stockQuant.upsert({
      where: {
        productId_warehouseId_locationId: {
          productId: input.productId,
          warehouseId: location.warehouseId,
          locationId: input.foundLocationId
        }
      },
      update: {
        quantity: {
          increment: input.quantity
        }
      },
      create: {
        productId: input.productId,
        warehouseId: location.warehouseId,
        locationId: input.foundLocationId,
        quantity: input.quantity,
        reserved: 0
      }
    });

    await tx.product.update({
      where: { id: input.productId },
      data: {
        qtyAvailable: {
          increment: input.quantity
        },
        lastMoveAt: new Date()
      }
    });

    await tx.ghostRecovery.create({
      data: {
        productId: input.productId,
        locationId: input.foundLocationId,
        quantity: input.quantity,
        scannedImage: input.scannedImage,
        note: "OCR Processing Simulated - Data Extracted"
      }
    });
  });

  return {
    ok: true,
    message: "Inventory updated through instant quant adjustment"
  };
}
