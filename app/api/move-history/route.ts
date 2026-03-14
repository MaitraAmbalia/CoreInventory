import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const moves = await prisma.stockMoveHistory.findMany({
      where: search
        ? {
            OR: [
              { product: { name: { contains: search, mode: "insensitive" } } },
              { product: { skuCode: { contains: search, mode: "insensitive" } } },
              { operation: { refNo: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: {
        product: { select: { name: true, skuCode: true } },
        fromLocation: { select: { name: true, shortCode: true } },
        toLocation: { select: { name: true, shortCode: true } },
        operation: { select: { refNo: true } },
      },
      orderBy: { timestamp: "desc" },
      take: 200,
    });

    const result = moves.map((m: typeof moves[number]) => ({
      id: m.id,
      product_name: m.product.name,
      sku_code: m.product.skuCode,
      from_location_name: m.fromLocation?.name ?? null,
      from_location_code: m.fromLocation?.shortCode ?? null,
      to_location_name: m.toLocation?.name ?? null,
      to_location_code: m.toLocation?.shortCode ?? null,
      quantity: m.quantity.toString(),
      operation_ref: m.operation?.refNo ?? null,
      timestamp: m.timestamp,
    }));

    return NextResponse.json({ moves: result });
  } catch (error) {
    console.error("Move history GET error:", error);
    return NextResponse.json({ error: "Failed to fetch move history" }, { status: 500 });
  }
}
