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
    });

    if (!operation) {
      return NextResponse.json({ error: "Operation not found" }, { status: 404 });
    }

    if (operation.status === "Done") {
      return NextResponse.json({ error: "Cannot cancel a completed operation" }, { status: 400 });
    }

    if (operation.status === "Cancelled") {
      return NextResponse.json({ error: "Operation is already cancelled" }, { status: 400 });
    }

    await prisma.operation.update({
      where: { id },
      data: { status: "Cancelled" },
    });

    return NextResponse.json({ success: true, message: "Operation cancelled successfully" });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel operation" }, { status: 500 });
  }
}
