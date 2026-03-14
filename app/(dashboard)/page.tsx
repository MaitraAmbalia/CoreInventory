"use client";

import { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  Truck,
  Clock,
  Timer,
  Activity,
  TrendingUp,
} from "lucide-react";
import { formatDateTime, getStatusColor, getTypeColor } from "@/lib/utils";

interface DashboardData {
  totalProducts: number;
  lowStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  lateReceipts: number;
  waitingReceipts: number;
  lateDeliveries: number;
  waitingDeliveries: number;
  recentOperations: Array<{
    id: string;
    ref_no: string;
    type: string;
    status: string;
    contact: string | null;
    scheduled_date: string | null;
    created_at: string;
    responsible_name: string | null;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "var(--text-muted)",
          }}
        >
          <div className="animate-spin">
            <Activity size={20} />
          </div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Products",
      value: data?.totalProducts || 0,
      icon: Package,
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.12)",
    },
    {
      label: "Low Stock Items",
      value: data?.lowStockItems || 0,
      icon: AlertTriangle,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.12)",
    },
    {
      label: "Pending Receipts",
      value: data?.pendingReceipts || 0,
      icon: ArrowDownToLine,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.12)",
    },
    {
      label: "Pending Deliveries",
      value: data?.pendingDeliveries || 0,
      icon: Truck,
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.12)",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Overview of your inventory operations
        </p>
      </div>

      {/* KPI Cards */}
      <div
        className="stagger-children"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {kpiCards.map((card) => (
          <div key={card.label} className="kpi-card">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  {card.label}
                </p>
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {card.value}
                </p>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-md)",
                  background: card.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <card.icon size={22} color={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Operation Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Receipts Overview */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "rgba(16, 185, 129, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowDownToLine size={18} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Receipts</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Incoming stock overview
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                flex: 1,
                background: "rgba(239, 68, 68, 0.08)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                textAlign: "center",
                border: "1px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 8,
                  color: "var(--danger)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Timer size={14} />
                LATE
              </div>
              <p style={{ fontSize: 28, fontWeight: 700 }}>
                {data?.lateReceipts || 0}
              </p>
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(245, 158, 11, 0.08)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                textAlign: "center",
                border: "1px solid rgba(245, 158, 11, 0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 8,
                  color: "var(--warning)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Clock size={14} />
                WAITING
              </div>
              <p style={{ fontSize: 28, fontWeight: 700 }}>
                {data?.waitingReceipts || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Deliveries Overview */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "rgba(139, 92, 246, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Truck size={18} color="#8b5cf6" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Deliveries</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Outgoing stock overview
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                flex: 1,
                background: "rgba(239, 68, 68, 0.08)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                textAlign: "center",
                border: "1px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 8,
                  color: "var(--danger)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Timer size={14} />
                LATE
              </div>
              <p style={{ fontSize: 28, fontWeight: 700 }}>
                {data?.lateDeliveries || 0}
              </p>
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(245, 158, 11, 0.08)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                textAlign: "center",
                border: "1px solid rgba(245, 158, 11, 0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 8,
                  color: "var(--warning)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Clock size={14} />
                WAITING
              </div>
              <p style={{ fontSize: 28, fontWeight: 700 }}>
                {data?.waitingDeliveries || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Operations */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <TrendingUp size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Operations</h3>
        </div>
        {data?.recentOperations && data.recentOperations.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOperations.map((op) => (
                  <tr key={op.id}>
                    <td style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {op.ref_no}
                    </td>
                    <td>
                      <span className={`status-badge ${getTypeColor(op.type)}`}>
                        {op.type}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {op.contact || "—"}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(op.status)}`}>
                        {op.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {formatDateTime(op.scheduled_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Activity size={40} />
            <p>No recent operations</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Create a receipt or delivery to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
