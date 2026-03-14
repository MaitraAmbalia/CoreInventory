"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  MapPin,
  Package,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface StockLevel {
  id: string;
  location_name: string;
  location_code: string;
  warehouse_name: string;
  warehouse_code: string;
  qty_on_hand: string;
  qty_available: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string>("Staff");
  const [activeTab, setActiveTab] = useState<"details" | "stock">("details");
  const [form, setForm] = useState({
    name: "",
    skuCode: "",
    categoryId: "",
    uom: "Units",
    description: "",
    lowStockThreshold: 10,
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserRole(d.user.role);
      })
      .catch(console.error);

    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([productData, catData]) => {
      if (productData.product) {
        const p = productData.product;
        setForm({
          name: p.name,
          skuCode: p.sku_code,
          categoryId: p.category_id || "",
          uom: p.uom,
          description: p.description || "",
          lowStockThreshold: p.low_stock_threshold,
        });
        setStockLevels(productData.stockLevels || []);
      }
      setCategories(catData.categories || []);
      setLoading(false);
    });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update product");
        return;
      }
      router.push("/products");
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      router.push("/products");
    } catch {
      setError("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--text-muted)" }}>
        Loading product...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/products"
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
          Back to Products
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {form.name || "Product Detail"}
          </h1>
          {userRole === "Manager" && (
            <button
              onClick={handleDelete}
              className="btn-danger"
              disabled={deleting}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Trash2 size={14} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 20,
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        {[
          { key: "details" as const, label: "Details", icon: Package },
          { key: "stock" as const, label: "Stock per Location", icon: MapPin },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              color:
                activeTab === tab.key
                  ? "var(--accent-primary)"
                  : "var(--text-muted)",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--accent-primary)"
                  : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "-1px",
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
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

      {/* Details Tab */}
      {activeTab === "details" && (
        <form onSubmit={handleSave}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Product Name</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="form-label">SKU Code</label>
                <input
                  className="input-field"
                  value={form.skuCode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      skuCode: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select
                  className="select-field"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Unit of Measure</label>
                <select
                  className="select-field"
                  value={form.uom}
                  onChange={(e) =>
                    setForm({ ...form, uom: e.target.value })
                  }
                >
                  <option value="Units">Units</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="liters">Liters</option>
                  <option value="meters">Meters</option>
                  <option value="pcs">Pieces</option>
                </select>
              </div>
              <div>
                <label className="form-label">Low Stock Threshold</label>
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lowStockThreshold: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Description</label>
                <textarea
                  className="input-field"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  style={{ resize: "vertical" }}
                  disabled={userRole !== "Manager"}
                />
              </div>
            </div>
          </div>
          {userRole === "Manager" && (
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
              <Link
                href="/products"
                className="btn-secondary"
                style={{ textDecoration: "none" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      )}

      {/* Stock per Location Tab */}
      {activeTab === "stock" && (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          {stockLevels.length === 0 ? (
            <div className="empty-state">
              <MapPin size={40} />
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
                No stock records
              </p>
              <p style={{ fontSize: 13 }}>
                This product has no stock in any location yet
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th>Location</th>
                  <th>On Hand</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {stockLevels.map((sl) => (
                  <tr key={sl.id} style={{ cursor: "default" }}>
                    <td style={{ fontWeight: 500 }}>
                      {sl.warehouse_name || "—"}
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          background: "rgba(99, 102, 241, 0.1)",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {sl.location_code}
                      </span>{" "}
                      <span style={{ color: "var(--text-secondary)" }}>
                        {sl.location_name}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {parseFloat(sl.qty_on_hand).toFixed(0)}
                    </td>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--success)",
                      }}
                    >
                      {parseFloat(sl.qty_available).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
