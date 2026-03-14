import { NextResponse } from "next/server";
import { z } from "zod";
import { createGhostRecovery } from "@/lib/smart-metrics";

const GhostRecoverySchema = z.object({
  productId: z.number().int().positive(),
  foundLocationId: z.number().int().positive(),
  quantity: z.number().positive(),
  scannedImage: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = GhostRecoverySchema.parse(json);
    const result = await createGhostRecovery(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unexpected error"
      },
      { status: 400 }
    );
  }
}
