import { Dashboard } from "@/components/dashboard";
import {
  getDashboardMetrics,
  getLocationHeatmap,
  getOptimizedPickPath,
  getP2PSuggestions
} from "@/lib/smart-metrics";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [metrics, p2pSuggestions, heatmap, optimizedPath] = await Promise.all([
    getDashboardMetrics(),
    getP2PSuggestions(),
    getLocationHeatmap(),
    getOptimizedPickPath()
  ]);

  return <Dashboard data={{ metrics, p2pSuggestions, heatmap, optimizedPath }} />;
}
