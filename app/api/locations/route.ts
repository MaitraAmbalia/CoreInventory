import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: { warehouse: { select: { name: true, shortCode: true } } },
      orderBy: [{ warehouse: { name: "asc" } }, { name: "asc" }],
    });
    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Locations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
