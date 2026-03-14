export type DashboardPayload = {
  metrics: {
    totalStockValue: number;
    deadStockCount: number;
    pendingP2PTransfers: number;
    highRiskExpiries: number;
  };
  p2pSuggestions: Array<{
    product: string;
    warehouse: string;
    available: number;
    maxQty: number;
  }>;
  heatmap: Array<{
    id: number;
    name: string;
    warehouse: string;
    activityIndex: number;
    level: "HIGH" | "MEDIUM" | "LOW";
  }>;
  optimizedPath: Array<{
    id: number;
    product: string;
    qty: number;
    from: string;
    to: string;
    sourceOrder: number;
  }>;
};

export type LeaderboardPayload = {
  users: Array<{
    id: number;
    name: string;
    avatarUrl: string;
    points: number;
  }>;
  progress: {
    ready: number;
    done: number;
    percent: number;
  };
};
