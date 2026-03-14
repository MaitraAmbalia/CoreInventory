import { Leaderboard } from "@/components/leaderboard";
import { getLeaderboardData } from "@/lib/smart-metrics";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboardData();
  return <Leaderboard data={leaderboard} />;
}
