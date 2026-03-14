import { NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/smart-metrics";

export async function GET() {
  const payload = await getLeaderboardData();
  return NextResponse.json(payload);
}
