"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku_code: string;
}

interface Location {
  id: string;
  name: string;
  short_code: string;
  warehouse_name: string | null;
  is_scrap: boolean;
}

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [physicalCount, setPhysicalCount] = useState(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/locations").then((r) => r.json()),
    ]).then(([prodData, locData]) => {
      setProducts(
        (prodData.products || []).map((p: { id: string; name: string; sku_code: string }) => ({
          id: p.id,
          name: p.name,
          sku_code: p.sku_code,
        }))
      );
      setLocations(
        (locData.locations || []).filter((l: Location) => !l.is_scrap)
      );
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!productId || !locationId) {
      setError("Product and location are required");
      setLoading(false);
      return;
    }

    try {

      const locRes = await fetch("/api/locations");
      const locData = await locRes.json();
      const scrapLoc = (locData.locations || []).find(
        (l: Location) => l.is_scrap
      );

      if (!scrapLoc) {
        setError("No scrap location found. Please seed the database first.");
        setLoading(false);
        return;
      }


      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "Adjustment",
          srcLocationId: locationId,
          destLocationId: scrapLoc.id,
          contact: reason || "Stock Adjustment",
          items: [
            {
              productId,
              demandQty: physicalCount,
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create adjustment");
        return;
      }

      router.push(`/operations/${data.operation.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 560 }}>
      {}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/adjustments"
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
          Back to Adjustments
        </Link>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          New Stock Adjustment
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 14,
            marginTop: 4,
          }}
        >
          Override recorded stock with a physical count
        </p>
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

      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="form-label">Product *</label>
              <select
                className="select-field"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Location *</label>
              <select
                className="select-field"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                required
              >
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.warehouse_name ? `${l.warehouse_name} / ` : ""}
                    {l.name} ({l.short_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Physical Count (Qty) *</label>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                value={physicalCount}
                onChange={(e) =>
                  setPhysicalCount(parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>

            <div>
              <label className="form-label">Reason / Notes</label>
              <textarea
                className="input-field"
                placeholder="Reason for adjustment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            justifyContent: "flex-end",
          }}
        >
          <Link
            href="/adjustments"
            className="btn-secondary"
            style={{ textDecoration: "none" }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {loading ? "Creating..." : "Create Adjustment"}
          </button>
        </div>
      </form>
    </div>
  );
}
