"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, SlidersHorizontal, ChevronRight } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";

interface Operation {
  id: string;
  ref_no: string;
  status: string;
  contact: string | null;
  scheduled_date: string | null;
  created_at: string;
  src_location_name: string | null;
}


import { TableSkeleton } from "@/components/skeletons";

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/operations?type=Adjustment")
      .then((r) => r.json())
      .then((d) => setAdjustments(d.operations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TableSkeleton />;

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
            Stock Adjustments
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Override recorded stock with physical counts
          </p>
        </div>
        <Link
          href="/adjustments/new"
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <Plus size={16} />
          New Adjustment
        </Link>
      </div>

      {}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div className="empty-state">
            <p>Loading adjustments...</p>
          </div>
        ) : adjustments.length === 0 ? (
          <div className="empty-state">
            <SlidersHorizontal size={48} />
            <p style={{ fontSize: 16, fontWeight: 500, marginTop: 8 }}>
              No adjustments yet
            </p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Create an adjustment to correct stock discrepancies
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Reason</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adj) => (
                  <tr
                    key={adj.id}
                    onClick={() =>
                      (window.location.href = `/operations/${adj.id}`)
                    }
                  >
                    <td
                      style={{
                        fontWeight: 600,
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                      }}
                    >
                      {adj.ref_no}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {adj.contact || "—"}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      {adj.src_location_name || "—"}
                    </td>
                    <td
                      style={{ color: "var(--text-muted)", fontSize: 13 }}
                    >
                      {formatDate(adj.created_at)}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusColor(adj.status)}`}
                      >
                        {adj.status}
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
