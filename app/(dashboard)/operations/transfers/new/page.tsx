"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";

interface Location {
  id: string;
  name: string;
  short_code: string;
  warehouse_name: string | null;
  is_scrap: boolean;
}

interface Product {
  id: string;
  name: string;
  sku_code: string;
}

interface LineItem {
  productId: string;
  demandQty: number;
}

export default function NewTransferPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [srcLocationId, setSrcLocationId] = useState("");
  const [destLocationId, setDestLocationId] = useState("");
  const [contact, setContact] = useState(""); // Reference
  const [scheduledDate, setScheduledDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { productId: "", demandQty: 1 },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([locData, prodData]) => {
      const locs = locData.locations || [];
      setLocations(locs);
      setProducts(
        (prodData.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          sku_code: p.sku_code,
        }))
      );

      const stockLoc = locs.find((l: Location) => l.short_code === "WH/STOCK");

      if (stockLoc) {
        setSrcLocationId(stockLoc.id);
        // Don't auto-set both to the same location
      }
    });
  }, []);

  const addItem = () => {
    setItems([...items, { productId: "", demandQty: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (srcLocationId === destLocationId) {
       setError("Source and destination locations cannot be the same");
       setLoading(false);
       return;
    }

    const validItems = items.filter((i) => i.productId && i.demandQty > 0);
    if (validItems.length === 0) {
      setError("At least one valid line item is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "Internal",
          srcLocationId,
          destLocationId,
          contact: contact || null,
          scheduledDate: scheduledDate || null,
          items: validItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create operation");
        return;
      }

      router.push("/operations?type=Internal");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/operations?type=Internal"
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
          Back to Transfers
        </Link>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          New Internal Transfer
        </h1>
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
        <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--text-secondary)",
            }}
          >
            Transfer Details
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <label className="form-label">Reference</label>
              <input
                className="input-field"
                placeholder="Reference info (optional)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Scheduled Date</label>
              <input
                className="input-field"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Source Location *</label>
              <select
                className="select-field"
                value={srcLocationId}
                onChange={(e) => setSrcLocationId(e.target.value)}
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
              <label className="form-label">Destination Location *</label>
              <select
                className="select-field"
                value={destLocationId}
                onChange={(e) => setDestLocationId(e.target.value)}
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
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              Line Items
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 13,
              }}
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 12,
                alignItems: "flex-end",
              }}
            >
              <div style={{ flex: 2 }}>
                {index === 0 && (
                  <label className="form-label">Product</label>
                )}
                <select
                  className="select-field"
                  value={item.productId}
                  onChange={(e) =>
                    updateItem(index, "productId", e.target.value)
                  }
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
              <div style={{ flex: 1 }}>
                {index === 0 && (
                  <label className="form-label">Demand Qty</label>
                )}
                <input
                  className="input-field"
                  type="number"
                  min="1"
                  value={item.demandQty}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "demandQty",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  required
                />
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  style={{
                    padding: 10,
                    background: "var(--danger-bg)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    color: "var(--danger)",
                    marginBottom: index === 0 ? 0 : 0,
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
          }}
        >
          <Link
            href="/operations?type=Internal"
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
            {loading ? "Creating..." : "Create Transfer"}
          </button>
        </div>
      </form>
    </div>
  );
}
