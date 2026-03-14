import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const operation = await prisma.operation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!operation) {
      return NextResponse.json({ error: "Operation not found" }, { status: 404 });
    }

    if (operation.status === "Done") {
      return NextResponse.json({ error: "Operation is already validated" }, { status: 400 });
    }

    if (operation.items.length === 0) {
      return NextResponse.json({ error: "Cannot validate an operation with no items" }, { status: 400 });
    }


    type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
    await prisma.$transaction(async (tx: TxClient) => {
      for (const item of operation.items) {
        const qty = Number(item.doneQty) > 0 ? Number(item.doneQty) : Number(item.demandQty);
        if (qty <= 0) continue;


        if (operation.srcLocationId) {
          const existingSrc = await tx.stockLevel.findFirst({
            where: { productId: item.productId, locationId: operation.srcLocationId },
          });
          if (existingSrc) {
            await tx.stockLevel.update({
              where: { id: existingSrc.id },
              data: {
                qtyOnHand: { decrement: qty },
                qtyAvailable: { decrement: qty },
              },
            });
          }
        }


        if (operation.destLocationId) {
          const existingDest = await tx.stockLevel.findFirst({
            where: { productId: item.productId, locationId: operation.destLocationId },
          });
          if (existingDest) {
            await tx.stockLevel.update({
              where: { id: existingDest.id },
              data: {
                qtyOnHand: { increment: qty },
                qtyAvailable: { increment: qty },
              },
            });
          } else {
            await tx.stockLevel.create({
              data: {
                productId: item.productId,
                locationId: operation.destLocationId,
                qtyOnHand: qty,
                qtyAvailable: qty,
              },
            });
          }
        }


        await tx.stockMoveHistory.create({
          data: {
            productId: item.productId,
            fromLocationId: operation.srcLocationId,
            toLocationId: operation.destLocationId,
            quantity: qty,
            operationId: id,
          },
        });


        if (Number(item.doneQty) === 0) {
          await tx.operationItem.update({
            where: { id: item.id },
            data: { doneQty: qty },
          });
        }
      }


      await tx.operation.update({
        where: { id },
        data: { status: "Done" },
      });
    });

    return NextResponse.json({ success: true, message: "Operation validated successfully" });
  } catch (error) {
    console.error("Validate error:", error);
    return NextResponse.json({ error: "Failed to validate operation" }, { status: 500 });
  }
}
