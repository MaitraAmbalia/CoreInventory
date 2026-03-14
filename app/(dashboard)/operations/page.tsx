"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  ClipboardList,
  Filter,
  ChevronRight,
} from "lucide-react";
import { formatDate, getStatusColor, getTypeColor } from "@/lib/utils";

interface Operation {
  id: string;
  ref_no: string;
  type: string;
  status: string;
  contact: string | null;
  scheduled_date: string | null;
  created_at: string;
  responsible_name: string | null;
  src_location_name: string | null;
  dest_location_name: string | null;
}

export default function OperationsPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "";

  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(typeParam);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOperations = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/operations?${params}`);
    const data = await res.json();
    setOperations(data.operations || []);
    setLoading(false);
  };

  useEffect(() => {
    setTypeFilter(typeParam);
  }, [typeParam]);

  useEffect(() => {
    const timer = setTimeout(fetchOperations, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter, statusFilter]);

  const pageTitle = typeFilter
    ? `${typeFilter}s`
    : "All Operations";

  return (
    <div className="animate-fade-in">
      {}
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
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            {pageTitle}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Manage inventory operations
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {(!typeFilter || typeFilter === "Receipt") && (
            <Link
              href="/operations/receipts/new"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                background: typeFilter ? undefined : "var(--bg-secondary)",
                color: typeFilter ? undefined : "var(--text-primary)",
                border: typeFilter ? undefined : "1px solid var(--border-primary)",
              }}
            >
              <Plus size={16} />
              New Receipt
            </Link>
          )}
          {(!typeFilter || typeFilter === "Delivery") && (
            <Link
              href="/operations/deliveries/new"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                background: typeFilter ? undefined : "var(--bg-secondary)",
                color: typeFilter ? undefined : "var(--text-primary)",
                border: typeFilter ? undefined : "1px solid var(--border-primary)",
              }}
            >
              <Plus size={16} />
              New Delivery
            </Link>
          )}
          {(!typeFilter || typeFilter === "Internal") && (
            <Link
              href="/operations/transfers/new"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                background: typeFilter ? undefined : "var(--bg-secondary)",
                color: typeFilter ? undefined : "var(--text-primary)",
                border: typeFilter ? undefined : "1px solid var(--border-primary)",
              }}
            >
              <Plus size={16} />
              New Transfer
            </Link>
          )}
        </div>
      </div>

      {}
      <div
        className="glass-card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            className="input-field"
            placeholder="Search by reference or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div style={{ minWidth: 150 }}>
          <select
            className="select-field"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Receipt">Receipt</option>
            <option value="Delivery">Delivery</option>
            <option value="Internal">Internal</option>
            <option value="Adjustment">Adjustment</option>
          </select>
        </div>
        <div style={{ minWidth: 150 }}>
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Waiting">Waiting</option>
            <option value="Ready">Ready</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div className="empty-state">
            <p>Loading operations...</p>
          </div>
        ) : operations.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <p style={{ fontSize: 16, fontWeight: 500, marginTop: 8 }}>
              No operations found
            </p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {search || typeFilter || statusFilter
                ? "Try adjusting your filters"
                : "Create your first operation to get started"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>From → To</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr
                    key={op.id}
                    onClick={() =>
                      (window.location.href = `/operations/${op.id}`)
                    }
                  >
                    <td
                      style={{
                        fontWeight: 600,
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                      }}
                    >
                      {op.ref_no}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getTypeColor(op.type)}`}
                      >
                        {op.type}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {op.contact || "—"}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {op.src_location_name || "—"} → {op.dest_location_name || "—"}
                    </td>
                    <td
                      style={{ color: "var(--text-muted)", fontSize: 13 }}
                    >
                      {formatDate(op.scheduled_date)}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusColor(op.status)}`}
                      >
                        {op.status}
                      </span>
                    </td>
                    <td>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
