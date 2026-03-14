import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/warehouses - List warehouses and their locations
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const warehouses = await prisma.warehouse.findMany({
      include: {
        locations: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // We also want to compute total stock per warehouse. 
    // This requires aggregating stock levels across all locations in the warehouse.
    const warehousesWithStock = await Promise.all(
      warehouses.map(async (warehouse) => {
        const locationIds = warehouse.locations.map((l) => l.id);
        const stockAggregate = await prisma.stockLevel.aggregate({
          where: { locationId: { in: locationIds } },
          _sum: { qtyOnHand: true },
        });

        return {
          ...warehouse,
          totalStock: stockAggregate._sum.qtyOnHand || 0,
        };
      })
    );

    return NextResponse.json({ warehouses: warehousesWithStock });
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/warehouses - Create a new warehouse
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user || user.role !== "Manager") {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    const { name, shortCode, address } = await request.json();

    if (!name || !shortCode) {
      return NextResponse.json({ error: "Name and Short Code are required" }, { status: 400 });
    }

    // Ensure shortCode is uppercase
    const upperShortCode = shortCode.toUpperCase();

    // Check if short code is unique
    const existing = await prisma.warehouse.findUnique({
      where: { shortCode: upperShortCode },
    });

    if (existing) {
      return NextResponse.json({ error: "Short Code already exists" }, { status: 400 });
    }

    // Create warehouse and default 'Stock' location in a transaction
    const warehouse = await prisma.$transaction(async (tx) => {
      const wh = await tx.warehouse.create({
        data: {
          name,
          shortCode: upperShortCode,
          address,
        },
      });

      await tx.location.create({
        data: {
          warehouseId: wh.id,
          name: "Stock",
          shortCode: `${upperShortCode}/Stock`,
          isScrap: false,
        },
      });

      return wh;
    });

    return NextResponse.json({ warehouse }, { status: 201 });
  } catch (error: any) {
    console.error("Create warehouse error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
