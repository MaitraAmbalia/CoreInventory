import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const operation = await prisma.operation.findUnique({
      where: { id },
      include: {
        responsibleUser: { select: { name: true } },
        srcLocation: { select: { name: true, shortCode: true } },
        destLocation: { select: { name: true, shortCode: true } },
        items: {
          include: { product: { select: { name: true, skuCode: true } } },
          orderBy: { product: { name: "asc" } },
        },
      },
    });

    if (!operation) {
      return NextResponse.json({ error: "Operation not found" }, { status: 404 });
    }

    const result = {
      id: operation.id,
      ref_no: operation.refNo,
      type: operation.type,
      status: operation.status,
      contact: operation.contact,
      scheduled_date: operation.scheduledDate,
      created_at: operation.createdAt,
      responsible_name: operation.responsibleUser?.name ?? null,
      src_location_name: operation.srcLocation?.name ?? null,
      src_location_code: operation.srcLocation?.shortCode ?? null,
      dest_location_name: operation.destLocation?.name ?? null,
      dest_location_code: operation.destLocation?.shortCode ?? null,
    };

    const items = operation.items.map((item) => ({
      id: item.id,
      product_name: item.product.name,
      sku_code: item.product.skuCode,
      demand_qty: item.demandQty.toString(),
      done_qty: item.doneQty.toString(),
    }));

    return NextResponse.json({ operation: result, items });
  } catch (error) {
    console.error("Operation GET error:", error);
    return NextResponse.json({ error: "Failed to fetch operation" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const operation = await prisma.operation.update({
      where: { id },
      data: { ...(status ? { status } : {}) },
    });

    return NextResponse.json({ operation });
  } catch (error) {
    console.error("Operation PUT error:", error);
    return NextResponse.json({ error: "Failed to update operation" }, { status: 500 });
  }
}
