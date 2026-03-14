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

export default function NewOperationPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState("Receipt");
  const [srcLocationId, setSrcLocationId] = useState("");
  const [destLocationId, setDestLocationId] = useState("");
  const [contact, setContact] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { productId: "", demandQty: 1 },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([locData, prodData]) => {
      setLocations(locData.locations || []);
      setProducts(
        (prodData.products || []).map((p: { id: string; name: string; sku_code: string }) => ({
          id: p.id,
          name: p.name,
          sku_code: p.sku_code,
        }))
      );

      // Auto-set locations based on type
      const locs = locData.locations || [];
      const inputLoc = locs.find((l: Location) => l.short_code === "WH/INPUT");
      const outputLoc = locs.find((l: Location) => l.short_code === "WH/OUTPUT");
      const stockLoc = locs.find((l: Location) => l.short_code === "WH/STOCK");

      if (inputLoc && stockLoc) {
        setSrcLocationId(inputLoc.id);
        setDestLocationId(stockLoc.id);
      }
    });
  }, []);

  // Auto-set locations when type changes
  useEffect(() => {
    const inputLoc = locations.find((l) => l.short_code === "WH/INPUT");
    const outputLoc = locations.find((l) => l.short_code === "WH/OUTPUT");
    const stockLoc = locations.find((l) => l.short_code === "WH/STOCK");
    const scrapLoc = locations.find((l) => l.short_code === "WH/SCRAP");

    switch (type) {
      case "Receipt":
        if (inputLoc) setSrcLocationId(inputLoc.id);
        if (stockLoc) setDestLocationId(stockLoc.id);
        break;
      case "Delivery":
        if (stockLoc) setSrcLocationId(stockLoc.id);
        if (outputLoc) setDestLocationId(outputLoc.id);
        break;
      case "Adjustment":
        if (stockLoc) setSrcLocationId(stockLoc.id);
        if (scrapLoc) setDestLocationId(scrapLoc.id);
        break;
      default:
        break;
    }
  }, [type, locations]);

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
          type,
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

      router.push("/operations");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720 }}>
      {/* Header */}
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
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          New Operation
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
        {/* Operation Info */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--text-secondary)",
            }}
          >
            Operation Details
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <label className="form-label">Operation Type *</label>
              <select
                className="select-field"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Receipt">Receipt (Incoming)</option>
                <option value="Delivery">Delivery (Outgoing)</option>
                <option value="Internal">Internal Transfer</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="form-label">
                {type === "Receipt"
                  ? "Vendor"
                  : type === "Delivery"
                    ? "Customer"
                    : "Contact"}
              </label>
              <input
                className="input-field"
                placeholder={
                  type === "Receipt"
                    ? "Vendor name"
                    : type === "Delivery"
                      ? "Customer name"
                      : "Contact name"
                }
                value={contact}
                onChange={(e) => setContact(e.target.value)}
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
            <div>
              <label className="form-label">Scheduled Date</label>
              <input
                className="input-field"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
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

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
          }}
        >
          <Link
            href="/operations"
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
            {loading ? "Creating..." : "Create Operation"}
          </button>
        </div>
      </form>
    </div>
  );
}
