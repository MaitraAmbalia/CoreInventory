"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    skuCode: "",
    categoryId: "",
    uom: "Units",
    description: "",
    lowStockThreshold: 10,
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create product");
        return;
      }

      router.push("/products");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640 }}>
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
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          New Product
        </h1>
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Product Name *</label>
              <input
                className="input-field"
                placeholder="e.g., Office Chair Ergonomic"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="form-label">SKU Code *</label>
              <input
                className="input-field"
                placeholder="e.g., FURN-CHR-001"
                value={form.skuCode}
                onChange={(e) =>
                  setForm({ ...form, skuCode: e.target.value.toUpperCase() })
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
                onChange={(e) => setForm({ ...form, uom: e.target.value })}
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
                placeholder="Optional product description..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            justifyContent: "flex-end",
          }}
        >
          <Link href="/products" className="btn-secondary" style={{ textDecoration: "none" }}>
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
