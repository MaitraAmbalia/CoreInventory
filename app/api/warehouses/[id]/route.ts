import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user || user.role !== "Manager") {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    const { id } = await params;
    const { name, address } = await request.json();

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { name, address },
    });

    return NextResponse.json({ warehouse });
  } catch (error: any) {
    if (error.code === 'P2025') {
       return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }
    console.error("Update warehouse error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user || user.role !== "Manager") {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    const { id } = await params;


    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: { locations: true }
    });

    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    const locationIds = warehouse.locations.map(l => l.id);
    const stockAggregate = await prisma.stockLevel.aggregate({
      where: { locationId: { in: locationIds }, qtyOnHand: { gt: 0 } },
      _count: true
    });

    if (stockAggregate._count > 0) {
      return NextResponse.json({ error: "Cannot delete a warehouse that currently holds stock." }, { status: 400 });
    }

    await prisma.warehouse.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete warehouse error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
