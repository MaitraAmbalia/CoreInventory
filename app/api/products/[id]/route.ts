import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireManager } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        stockLevels: {
          include: {
            location: {
              include: { warehouse: { select: { name: true, shortCode: true } } },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const stockLevels = product.stockLevels.map((sl) => ({
      id: sl.id,
      location_name: sl.location.name,
      location_code: sl.location.shortCode,
      warehouse_name: sl.location.warehouse?.name ?? null,
      warehouse_code: sl.location.warehouse?.shortCode ?? null,
      qty_on_hand: sl.qtyOnHand.toString(),
      qty_available: sl.qtyAvailable.toString(),
    }));

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        sku_code: product.skuCode,
        category_id: product.categoryId,
        category_name: product.category?.name ?? null,
        uom: product.uom,
        description: product.description,
        low_stock_threshold: product.lowStockThreshold,
      },
      stockLevels,
    });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager();
    const { id } = await params;
    const body = await request.json();
    const { name, skuCode, categoryId, uom, description, lowStockThreshold } = body;

    if (skuCode) {
      const existing = await prisma.product.findFirst({
        where: { skuCode, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A product with this SKU code already exists" },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        skuCode,
        categoryId: categoryId || null,
        uom,
        description: description || null,
        lowStockThreshold,
      },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Product PUT error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireManager();
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
