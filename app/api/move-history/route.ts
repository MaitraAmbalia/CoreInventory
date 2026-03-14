import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let query = `
      SELECT smh.*, p.name as product_name, p.sku_code,
             fl.name as from_location_name, fl.short_code as from_location_code,
             tl.name as to_location_name, tl.short_code as to_location_code,
             o.ref_no as operation_ref
      FROM stock_move_history smh
      JOIN products p ON p.id = smh.product_id
      LEFT JOIN locations fl ON fl.id = smh.from_location_id
      LEFT JOIN locations tl ON tl.id = smh.to_location_id
      LEFT JOIN operations o ON o.id = smh.operation_id
    `;

    const params: string[] = [];

    if (search) {
      query += ` WHERE LOWER(p.name) LIKE LOWER($1) OR LOWER(p.sku_code) LIKE LOWER($1) OR LOWER(o.ref_no) LIKE LOWER($1)`;
      params.push(`%${search}%`);
    }

    query += " ORDER BY smh.timestamp DESC LIMIT 200";

    const moves = await sql(query, params);
    return NextResponse.json({ moves });
  } catch (error) {
    console.error("Move history GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch move history" },
      { status: 500 }
    );
  }
}
