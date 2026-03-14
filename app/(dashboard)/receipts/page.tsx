"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, List, KanbanSquare } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";

interface Operation {
  id: string;
  ref_no: string;
  type: string;
  status: string;
  contact: string | null;
  scheduled_date: string | null;
  created_at: string;
  src_location_name: string | null;
  dest_location_name: string | null;
}

export default function ReceiptsPage() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [loading, setLoading] = useState(true);

  const fetchReceipts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("type", "Receipt");
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/operations?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOperations(data.operations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchReceipts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="animate-fade-in">
      {/* Header & Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/operations/new?type=Receipt"
            className="btn-primary"
            style={{ textDecoration: "none", padding: "8px 16px" }}
          >
            NEW
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Receipts</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Search */}
          <div
            className="search-input-wrapper"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "4px 12px",
            }}
          >
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ marginRight: 8 }}
            />
            <input
              type="text"
              placeholder="Search reference or contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 14,
                width: 200,
              }}
            />
          </div>

          {/* View Toggles */}
          <div
            style={{
              display: "flex",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "6px 10px",
                background:
                  viewMode === "list" ? "var(--border)" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              style={{
                padding: "6px 10px",
                background:
                  viewMode === "kanban" ? "var(--border)" : "transparent",
                border: "none",
                cursor: "pointer",
                borderLeft: "1px solid var(--border)",
              }}
              title="Kanban View"
            >
              <KanbanSquare size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: 40,
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          Loading receipts...
        </div>
      ) : operations.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            border: "1px dashed var(--border)",
            borderRadius: 8,
          }}
        >
          <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>
            No receipts found.
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* List View */
        <div
          className="table-container"
          style={{
            background: "transparent",
            borderRadius: 8,
            border: "1px solid var(--border)",
            overflowX: "auto",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  textAlign: "left",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <th style={{ padding: "12px 16px", fontWeight: 500 }}>
                  Reference
                </th>
                <th style={{ padding: "12px 16px", fontWeight: 500 }}>From</th>
                <th style={{ padding: "12px 16px", fontWeight: 500 }}>To</th>
                <th style={{ padding: "12px 16px", fontWeight: 500 }}>
                  Contact
                </th>
                <th style={{ padding: "12px 16px", fontWeight: 500 }}>
                  Schedule date
                </th>
                <th style={{ padding: "12px 16px", fontWeight: 500 }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr
                  key={op.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                    <Link
                      href={`/operations/${op.id}`}
                      style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                      }}
                    >
                      {op.ref_no}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {op.src_location_name || "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {op.dest_location_name || "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{op.contact || "-"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {formatDate(op.scheduled_date)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        color:
                          typeof getStatusColor(op.status) === "string"
                            ? "var(--text)"
                            : (getStatusColor(op.status) as any).color,
                        background:
                          typeof getStatusColor(op.status) === "string"
                            ? "var(--border)"
                            : (getStatusColor(op.status) as any).bg,
                      }}
                    >
                      {op.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban View placeholder */
        <div
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            paddingBottom: 16,
          }}
        >
          {["Draft", "Waiting", "Ready", "Done"].map((status) => {
            const cols = operations.filter((o) => o.status === status);
            return (
              <div
                key={status}
                style={{
                  minWidth: 280,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 8,
                  padding: 12,
                  border: "1px solid var(--border)",
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {status} ({cols.length})
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {cols.map((op) => (
                    <Link
                      href={`/operations/${op.id}`}
                      key={op.id}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={{
                          background: "transparent",
                          padding: 12,
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {op.ref_no}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            marginBottom: 8,
                          }}
                        >
                          {op.contact || "-"}
                        </div>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 500,
                            background:
                              typeof getStatusColor(op.status) === "string"
                                ? "var(--border)"
                                : (getStatusColor(op.status) as any).bg,
                            color:
                              typeof getStatusColor(op.status) === "string"
                                ? "var(--text)"
                                : (getStatusColor(op.status) as any).color,
                          }}
                        >
                          {op.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
