import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const [category] = await sql`
      INSERT INTO categories (name, description) VALUES (${name}, ${description || null})
      RETURNING *
    `;
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
