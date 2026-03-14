import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const operation = await prisma.operation.findUnique({
      where: { id },
    });

    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 },
      );
    }

    if (operation.status !== "Draft") {
      return NextResponse.json(
        { error: "Only Draft operations can be marked as To Do" },
        { status: 400 },
      );
    }

    // Move to Ready status
    const updated = await prisma.operation.update({
      where: { id },
      data: { status: "Ready" },
    });

    return NextResponse.json({ success: true, operation: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
