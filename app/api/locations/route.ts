import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const locations = await sql`
      SELECT l.*, w.name as warehouse_name, w.short_code as warehouse_code
      FROM locations l
      LEFT JOIN warehouses w ON w.id = l.warehouse_id
      ORDER BY w.name, l.name
    `;
    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Locations GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
