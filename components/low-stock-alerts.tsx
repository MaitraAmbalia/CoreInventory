"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, X, ChevronRight, ShieldAlert, AlertCircle } from "lucide-react";

interface LowStockAlert {
  id: string;
  name: string;
  skuCode: string;
  category: string | null;
  currentStock: number;
  threshold: number;
  deficit: number;
  severity: "critical" | "warning" | "low";
}

interface LowStockAlertsProps {
  alerts: LowStockAlert[];
}

export default function LowStockAlerts({ alerts }: LowStockAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  if (!alerts || alerts.length === 0) return null;

  const visible = alerts.filter((a) => !dismissed.has(a.id));
  const criticalCount = visible.filter((a) => a.severity === "critical").length;
  const warningCount = visible.filter((a) => a.severity === "warning" || a.severity === "low").length;

  if (visible.length === 0) return null;

  const dismissOne = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  return (
    <div
      style={{
        background: criticalCount > 0
          ? "linear-gradient(135deg, rgba(198, 40, 40, 0.06) 0%, rgba(239, 83, 80, 0.03) 100%)"
          : "linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(255, 167, 38, 0.03) 100%)",
        border: `1px solid ${criticalCount > 0 ? "rgba(198, 40, 40, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
        borderRadius: "var(--radius-lg)",
        padding: 20,
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              background: criticalCount > 0 ? "var(--danger-bg)" : "var(--warning-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={16} color={criticalCount > 0 ? "var(--danger)" : "var(--warning)"} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 1 }}>
              Low Stock Alerts
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {criticalCount > 0 && <span style={{ color: "var(--danger)", fontWeight: 600 }}>{criticalCount} out of stock</span>}
              {criticalCount > 0 && warningCount > 0 && " · "}
              {warningCount > 0 && <span style={{ color: "var(--warning)", fontWeight: 600 }}>{warningCount} running low</span>}
            </p>
          </div>
        </div>
        <Link
          href="/products"
          style={{
            fontSize: 12,
            color: "var(--accent-primary)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontWeight: 500,
          }}
        >
          View all
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Alert items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {alert.severity === "critical" ? (
                <ShieldAlert size={16} color="var(--danger)" />
              ) : (
                <AlertCircle size={16} color="var(--warning)" />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link
                href={`/products/${alert.id}`}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                }}
              >
                {alert.name}
              </Link>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {alert.skuCode}
                {alert.category && <span style={{ fontFamily: "inherit" }}> · {alert.category}</span>}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: alert.severity === "critical" ? "var(--danger)" : "var(--warning)",
                }}
              >
                {alert.currentStock}
                <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>
                  /{alert.threshold}
                </span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: alert.severity === "critical" ? "var(--danger)" : "var(--warning)",
                  textTransform: "uppercase",
                }}
              >
                {alert.severity === "critical" ? "OUT OF STOCK" : "REORDER"}
              </div>
            </div>
            <button
              onClick={() => dismissOne(alert.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: 2,
                flexShrink: 0,
              }}
              title="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {visible.length > 5 && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
            +{visible.length - 5} more items below threshold
          </p>
        )}
      </div>
    </div>
  );
}
