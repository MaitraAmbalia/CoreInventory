import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST() {
  try {
    // Seed default category
    await prisma.category.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "General",
        description: "Default category for uncategorized items",
      },
    });

    // Seed default warehouse
    const warehouse = await prisma.warehouse.upsert({
      where: { shortCode: "WH" },
      update: {},
      create: {
        name: "Main Warehouse",
        shortCode: "WH",
        address: "Default warehouse address",
      },
    });

    // Seed default locations
    const locationDefs = [
      { name: "Stock", shortCode: "WH/STOCK", isScrap: false },
      { name: "Input (Vendors)", shortCode: "WH/INPUT", isScrap: false },
      { name: "Output (Customers)", shortCode: "WH/OUTPUT", isScrap: false },
      { name: "Scrap", shortCode: "WH/SCRAP", isScrap: true },
    ];

    for (const loc of locationDefs) {
      const existing = await prisma.location.findFirst({
        where: { shortCode: loc.shortCode },
      });
      if (!existing) {
        await prisma.location.create({
          data: {
            name: loc.name,
            shortCode: loc.shortCode,
            isScrap: loc.isScrap,
            warehouseId: warehouse.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
