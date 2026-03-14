import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "Receipt" | "Delivery" | "Internal" | "Adjustment" | null;
    const status = searchParams.get("status") as "Draft" | "Waiting" | "Ready" | "Done" | null;
    const search = searchParams.get("search") || "";

    const operations = await prisma.operation.findMany({
      where: {
        AND: [
          type ? { type } : {},
          status ? { status } : {},
          search
            ? {
                OR: [
                  { refNo: { contains: search, mode: "insensitive" } },
                  { contact: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
        ],
      },
      include: {
        responsibleUser: { select: { name: true } },
        srcLocation: { select: { name: true, shortCode: true } },
        destLocation: { select: { name: true, shortCode: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = operations.map((op) => ({
      id: op.id,
      ref_no: op.refNo,
      type: op.type,
      status: op.status,
      contact: op.contact,
      scheduled_date: op.scheduledDate,
      created_at: op.createdAt,
      responsible_name: op.responsibleUser?.name ?? null,
      src_location_name: op.srcLocation?.name ?? null,
      dest_location_name: op.destLocation?.name ?? null,
    }));

    return NextResponse.json({ operations: result });
  } catch (error) {
    console.error("Operations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch operations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, srcLocationId, destLocationId, contact, scheduledDate, responsibleUserId, items } = body;

    if (!type || !srcLocationId || !destLocationId) {
      return NextResponse.json(
        { error: "Type, source location, and destination location are required" },
        { status: 400 }
      );
    }

    const typeCodeMap: Record<string, string> = {
      Receipt: "IN", Delivery: "OUT", Internal: "INT", Adjustment: "ADJ",
    };
    const typeCode = typeCodeMap[type] || "OP";
    const count = await prisma.operation.count({ where: { type } });
    const refNo = `WH/${typeCode}/${String(count + 1).padStart(5, "0")}`;

    const operation = await prisma.operation.create({
      data: {
        refNo,
        type,
        srcLocationId,
        destLocationId,
        contact: contact || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        status: "Draft",
        responsibleUserId: responsibleUserId || null,
        items: items?.length
          ? {
              create: items
                .filter((i: { productId: string; demandQty: number }) => i.productId && i.demandQty > 0)
                .map((i: { productId: string; demandQty: number }) => ({
                  productId: i.productId,
                  demandQty: i.demandQty,
                  doneQty: 0,
                })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ operation }, { status: 201 });
  } catch (error) {
    console.error("Operations POST error:", error);
    return NextResponse.json({ error: "Failed to create operation" }, { status: 500 });
  }
}
