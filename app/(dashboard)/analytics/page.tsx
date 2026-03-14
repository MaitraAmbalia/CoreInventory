"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Warehouse,
  MapPin,
  Users,
  Tags,
  AlertTriangle,
  TrendingUp,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  Loader2,
  BarChart3,
  ShieldAlert,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalProducts: number;
    totalCategories: number;
    totalWarehouses: number;
    totalLocations: number;
    totalUsers: number;
    totalStockQty: number;
    lowStockCount: number;
  };
  operationsByType: Record<string, number>;
  operationsByStatus: Record<string, number>;
  lowStockProducts: { name: string; sku: string; qty: number; threshold: number; location: string }[];
  topMovedProducts: { name: string; sku: string; totalQtyMoved: number; moveCount: number }[];
  trendData: { date: string; receipts: number; deliveries: number; internal: number; adjustments: number }[];
  recentMoves: { id: string; product: string; sku: string; from: string; to: string; qty: number; timestamp: string }[];
}

const typeIcons: Record<string, typeof Package> = {
  Receipt: ArrowDownToLine,
  Delivery: Truck,
  Internal: ArrowLeftRight,
  Adjustment: SlidersHorizontal,
};

const typeColors: Record<string, string> = {
  Receipt: "#10b981",
  Delivery: "#8b5cf6",
  Internal: "#06b6d4",
  Adjustment: "#f59e0b",
};

const statusColors: Record<string, string> = {
  Draft: "#64748b",
  Waiting: "#f59e0b",
  Ready: "#3b82f6",
  Done: "#10b981",
};

import { DashboardSkeleton } from "@/components/skeletons";

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => {
        if (r.status === 403) {
          router.push("/dashboard");
          return null;
        }
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d && !d.error) setData(d);
        else if (d?.error) setError(d.error);
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: "var(--danger)" }}>
        <ShieldAlert size={24} style={{ marginRight: 12 }} />
        {error || "Access denied"}
      </div>
    );
  }

  const { overview, operationsByType, operationsByStatus, lowStockProducts, topMovedProducts, trendData, recentMoves } = data;

  const totalOps = Object.values(operationsByType).reduce((s, v) => s + v, 0);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <BarChart3 size={28} color="var(--accent-primary)" />
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>Analytics</h1>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Inventory performance overview — Manager only</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Products", value: overview.totalProducts, icon: Package, color: "#6366f1" },
          { label: "Categories", value: overview.totalCategories, icon: Tags, color: "#8b5cf6" },
          { label: "Warehouses", value: overview.totalWarehouses, icon: Warehouse, color: "#06b6d4" },
          { label: "Locations", value: overview.totalLocations, icon: MapPin, color: "#10b981" },
          { label: "Users", value: overview.totalUsers, icon: Users, color: "#f59e0b" },
          { label: "Total Stock", value: overview.totalStockQty.toLocaleString(), icon: TrendingUp, color: "#3b82f6" },
          { label: "Low Stock", value: overview.lowStockCount, icon: AlertTriangle, color: "#ef4444" },
        ].map((card) => (
          <div key={card.label} className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${card.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <card.icon size={16} color={card.color} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{card.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Operations by Type</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              {(() => {
                const types = ["Receipt", "Delivery", "Internal", "Adjustment"] as const;
                let cumulative = 0;
                const radius = 52;
                const cx = 70, cy = 70;
                const circumference = 2 * Math.PI * radius;
                if (totalOps === 0) {
                  return <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--border-primary)" strokeWidth="20" />;
                }
                return types.map((type) => {
                  const count = operationsByType[type] || 0;
                  const pct = count / totalOps;
                  const dashArray = `${pct * circumference} ${circumference}`;
                  const rotation = cumulative * 360 - 90;
                  cumulative += pct;
                  return (
                    <circle key={type} cx={cx} cy={cy} r={radius} fill="none" stroke={typeColors[type]} strokeWidth="20"
                      strokeDasharray={dashArray} transform={`rotate(${rotation} ${cx} ${cy})`}
                      style={{ transition: "stroke-dasharray 0.6s ease" }} />
                  );
                });
              })()}
              <text x="70" y="66" textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="700">{totalOps}</text>
              <text x="70" y="82" textAnchor="middle" fill="var(--text-muted)" fontSize="10">total</text>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["Receipt", "Delivery", "Internal", "Adjustment"] as const).map((type) => {
                const count = operationsByType[type] || 0;
                const Icon = typeIcons[type];
                return (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: typeColors[type], flexShrink: 0 }} />
                    <Icon size={13} color={typeColors[type]} />
                    <span style={{ fontSize: 13, flex: 1 }}>{type}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Operations by Status</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              {(() => {
                const statuses = ["Draft", "Waiting", "Ready", "Done"] as const;
                const totalStatusOps = Object.values(operationsByStatus).reduce((s, v) => s + v, 0);
                let cumulative = 0;
                const radius = 52;
                const cx = 70, cy = 70;
                const circumference = 2 * Math.PI * radius;
                if (totalStatusOps === 0) {
                  return <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--border-primary)" strokeWidth="20" />;
                }
                return statuses.map((status) => {
                  const count = operationsByStatus[status] || 0;
                  const pct = count / totalStatusOps;
                  const dashArray = `${pct * circumference} ${circumference}`;
                  const rotation = cumulative * 360 - 90;
                  cumulative += pct;
                  return (
                    <circle key={status} cx={cx} cy={cy} r={radius} fill="none" stroke={statusColors[status]} strokeWidth="20"
                      strokeDasharray={dashArray} transform={`rotate(${rotation} ${cx} ${cy})`}
                      style={{ transition: "stroke-dasharray 0.6s ease" }} />
                  );
                });
              })()}
              <text x="70" y="66" textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="700">
                {Object.values(operationsByStatus).reduce((s, v) => s + v, 0)}
              </text>
              <text x="70" y="82" textAnchor="middle" fill="var(--text-muted)" fontSize="10">total</text>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["Draft", "Waiting", "Ready", "Done"] as const).map((status) => {
                const count = operationsByStatus[status] || 0;
                return (
                  <div key={status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColors[status], flexShrink: 0 }} />
                    {status === "Done" ? <CheckCircle size={13} color={statusColors[status]} /> : <Clock size={13} color={statusColors[status]} />}
                    <span style={{ fontSize: 13, flex: 1 }}>{status}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-primary)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Top Moved Products</h3>
          </div>
          {topMovedProducts.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No data yet</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Moves</th>
                  <th>Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {topMovedProducts.map((p, i) => (
                  <tr key={i} style={{ cursor: "default" }}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.sku}</div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{p.moveCount}</td>
                    <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{p.totalQtyMoved.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Low Stock Alerts</h3>
          </div>
          {lowStockProducts.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "var(--success)", fontSize: 13 }}>
              <CheckCircle size={20} style={{ margin: "0 auto 8px", display: "block" }} />
              All stock levels healthy
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p, i) => (
                  <tr key={i} style={{ cursor: "default" }}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.sku}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--danger)", fontFamily: "var(--font-mono)" }}>{p.qty}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>{p.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-primary)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Recent Stock Movements (7 days)</h3>
        </div>
        {recentMoves.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No recent movements</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>From</th>
                <th>To</th>
                <th>Qty</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentMoves.map((m) => (
                <tr key={m.id} style={{ cursor: "default" }}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{m.product}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{m.sku}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{m.from}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{m.to}</td>
                  <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{m.qty}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {new Date(m.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
