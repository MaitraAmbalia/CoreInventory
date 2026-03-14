"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Printer,
  Loader2,
  Package,
  MapPin,
  User,
  Calendar,
  Hash,
  XCircle,
} from "lucide-react";
import { formatDateTime, getStatusColor, getTypeColor } from "@/lib/utils";

interface OperationDetail {
  id: string;
  ref_no: string;
  type: string;
  status: string;
  contact: string | null;
  scheduled_date: string | null;
  created_at: string;
  responsible_name: string | null;
  src_location_name: string | null;
  src_location_code: string | null;
  dest_location_name: string | null;
  dest_location_code: string | null;
}

interface OperationItem {
  id: string;
  product_name: string;
  sku_code: string;
  demand_qty: string;
  done_qty: string;
}

import { FormSkeleton } from "@/components/skeletons";

export default function OperationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [operation, setOperation] = useState<OperationDetail | null>(null);
  const [items, setItems] = useState<OperationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const res = await fetch(`/api/operations/${id}`);
    const data = await res.json();
    setOperation(data.operation);
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleValidate = async () => {
    if (
      !confirm(
        "Validate this operation? Stock will be updated and this cannot be undone.",
      )
    )
      return;

    setValidating(true);
    setError("");

    try {
      const res = await fetch(`/api/operations/${id}/validate`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to validate");
        return;
      }

      fetchData();
    } catch {
      setError("Something went wrong");
    } finally {
      setValidating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this operation?")) return;

    setCanceling(true);
    setError("");

    try {
      const res = await fetch(`/api/operations/${id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to cancel");
        return;
      }

      fetchData();
    } catch {
      setError("Something went wrong");
    } finally {
      setCanceling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <FormSkeleton />;
  }

  if (!operation) {
    return (
      <div style={{ padding: 40, color: "var(--text-muted)" }}>
        Operation not found
      </div>
    );
  }

  return (
    <div ref={printRef} className="animate-fade-in" style={{ maxWidth: 800 }}>
      {}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/operations"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            fontSize: 13,
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={14} />
          Back to Operations
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {operation.ref_no}
              </h1>
              <span className={`status-badge ${getTypeColor(operation.type)}`}>
                {operation.type}
              </span>
              <span
                className={`status-badge ${getStatusColor(operation.status)}`}
              >
                {operation.status}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handlePrint}
              className="btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Printer size={14} />
              Print
            </button>
            {operation.status !== "Done" && operation.status !== "Cancelled" && (
              <button
                onClick={handleCancel}
                className="btn-secondary"
                disabled={canceling || validating}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--danger)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                }}
              >
                {canceling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                {canceling ? "Canceling..." : "Cancel"}
              </button>
            )}
            {operation.status !== "Done" && operation.status !== "Cancelled" && (
              <button
                onClick={handleValidate}
                className="btn-primary"
                disabled={validating || canceling}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {validating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}
                {validating ? "Validating..." : "Validate"}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "var(--danger-bg)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--danger)",
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            icon: User,
            label: "Contact",
            value: operation.contact || "—",
            color: "#6366f1",
          },
          {
            icon: MapPin,
            label: "From → To",
            value: `${operation.src_location_name || "—"} → ${operation.dest_location_name || "—"}`,
            color: "#10b981",
          },
          {
            icon: Calendar,
            label: "Scheduled",
            value: formatDateTime(operation.scheduled_date),
            color: "#f59e0b",
          },
          {
            icon: Hash,
            label: "Created",
            value: formatDateTime(operation.created_at),
            color: "#8b5cf6",
          },
        ].map((card) => (
          <div key={card.label} className="glass-card" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <card.icon size={14} color={card.color} />
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {card.label}
              </span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Line Items</h3>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <Package size={36} />
            <p>No items in this operation</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Demand Qty</th>
                <th>Done Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ cursor: "default" }}>
                  <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                  <td
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.sku_code}
                  </td>
                  <td>{parseFloat(item.demand_qty).toFixed(0)}</td>
                  <td
                    style={{
                      fontWeight: 600,
                      color:
                        parseFloat(item.done_qty) >= parseFloat(item.demand_qty)
                          ? "var(--success)"
                          : "var(--text-primary)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{parseFloat(item.done_qty).toFixed(0)}</span>
                      {parseFloat(item.done_qty) >=
                        parseFloat(item.demand_qty) && (
                        <CheckCircle
                          size={14}
                          color="var(--success)"
                        />
                      )}
                    </div>
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
