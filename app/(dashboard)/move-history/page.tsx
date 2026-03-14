"use client";

import { useEffect, useState } from "react";
import { Search, History, ArrowRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface MoveRecord {
  id: string;
  product_name: string;
  sku_code: string;
  from_location_name: string | null;
  from_location_code: string | null;
  to_location_name: string | null;
  to_location_code: string | null;
  quantity: string;
  operation_ref: string | null;
  timestamp: string;
}

export default function MoveHistoryPage() {
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      fetch(`/api/move-history?${params}`)
        .then((r) => r.json())
        .then((d) => setMoves(d.moves || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Determine if it's an incoming or outgoing move based on location type
  const getMoveDirection = (move: MoveRecord) => {
    const fromCode = move.from_location_code || "";
    const toCode = move.to_location_code || "";

    // Incoming: from vendor/input to internal
    if (fromCode.includes("INPUT") || fromCode.includes("VENDOR")) return "in";
    // Outgoing: from internal to customer/output/scrap
    if (
      toCode.includes("OUTPUT") ||
      toCode.includes("CUSTOMER") ||
      toCode.includes("SCRAP")
    )
      return "out";
    // Internal transfers
    return "internal";
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}
        >
          Move History
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Immutable stock movement ledger
        </p>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ position: "relative", maxWidth: 400 }}>
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
            placeholder="Search by product, SKU, or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div className="empty-state">
            <p>Loading move history...</p>
          </div>
        ) : moves.length === 0 ? (
          <div className="empty-state">
            <History size={48} />
            <p style={{ fontSize: 16, fontWeight: 500, marginTop: 8 }}>
              No stock movements yet
            </p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Validate an operation to see stock movements here
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>From</th>
                  <th></th>
                  <th>To</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((move) => {
                  const dir = getMoveDirection(move);
                  const rowColor =
                    dir === "in"
                      ? "rgba(16, 185, 129, 0.04)"
                      : dir === "out"
                        ? "rgba(239, 68, 68, 0.04)"
                        : "transparent";

                  return (
                    <tr
                      key={move.id}
                      style={{ background: rowColor, cursor: "default" }}
                    >
                      <td
                        style={{
                          fontSize: 13,
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDateTime(move.timestamp)}
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 500 }}>
                            {move.product_name}
                          </span>
                          <br />
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              color: "var(--text-muted)",
                            }}
                          >
                            {move.sku_code}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            background:
                              dir === "in"
                                ? "var(--success-bg)"
                                : "rgba(99, 102, 241, 0.1)",
                            padding: "3px 8px",
                            borderRadius: 4,
                            color:
                              dir === "in"
                                ? "var(--success)"
                                : "var(--text-secondary)",
                          }}
                        >
                          {move.from_location_code || "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <ArrowRight
                          size={14}
                          color="var(--text-muted)"
                        />
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            background:
                              dir === "out"
                                ? "var(--danger-bg)"
                                : "rgba(99, 102, 241, 0.1)",
                            padding: "3px 8px",
                            borderRadius: 4,
                            color:
                              dir === "out"
                                ? "var(--danger)"
                                : "var(--text-secondary)",
                          }}
                        >
                          {move.to_location_code || "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color:
                              dir === "in"
                                ? "var(--success)"
                                : dir === "out"
                                  ? "var(--danger)"
                                  : "var(--text-primary)",
                          }}
                        >
                          {dir === "in" ? "+" : dir === "out" ? "−" : ""}
                          {parseFloat(move.quantity).toFixed(0)}
                        </span>
                      </td>
                      <td
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--text-muted)",
                        }}
                      >
                        {move.operation_ref || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
