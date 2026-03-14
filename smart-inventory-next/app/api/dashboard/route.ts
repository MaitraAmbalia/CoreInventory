import { NextResponse } from "next/server";
import {
  getDashboardMetrics,
  getLocationHeatmap,
  getOptimizedPickPath,
  getP2PSuggestions
} from "@/lib/smart-metrics";

export async function GET() {
  const [metrics, p2pSuggestions, heatmap, optimizedPath] = await Promise.all([
    getDashboardMetrics(),
    getP2PSuggestions(),
    getLocationHeatmap(),
    getOptimizedPickPath()
  ]);

  return NextResponse.json({
    metrics,
    p2pSuggestions,
    heatmap,
    optimizedPath
  });
}
