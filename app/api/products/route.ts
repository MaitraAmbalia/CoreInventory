import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireManager } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category") || "";

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { skuCode: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          categoryId ? { categoryId } : {},
        ],
      },
      include: {
        category: { select: { name: true } },
        stockLevels: { select: { qtyOnHand: true } },
      },
      orderBy: { name: "asc" },
    });

    const result = products.map((p: typeof products[number]) => ({
      id: p.id,
      name: p.name,
      sku_code: p.skuCode,
      category_name: p.category?.name ?? null,
      uom: p.uom,
      low_stock_threshold: p.lowStockThreshold,
      total_stock: p.stockLevels
        .reduce((sum: number, sl: { qtyOnHand: unknown }) => sum + Number(sl.qtyOnHand), 0)
        .toString(),
    }));

    return NextResponse.json({ products: result });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireManager();
    const body = await request.json();
    const { name, skuCode, categoryId, uom, description, lowStockThreshold } = body;

    if (!name || !skuCode) {
      return NextResponse.json(
        { error: "Name and SKU code are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { skuCode } });
    if (existing) {
      return NextResponse.json(
        { error: "A product with this SKU code already exists" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        skuCode,
        categoryId: categoryId || null,
        uom: uom || "Units",
        description: description || null,
        lowStockThreshold: lowStockThreshold || 10,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
