"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  FolderTree,
  Package,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("Staff");
  const [error, setError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUserRole(d.user.role); })
      .catch(console.error);
    fetchCategories();
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormName("");
    setFormDesc("");
    setError("");
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormDesc(cat.description || "");
    setShowForm(true);
    setError("");
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { setError("Category name is required"); return; }
    setSaving(true);
    setError("");

    try {
      const endpoint = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      resetForm();
      fetchCategories();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setError("");
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete"); return; }
      fetchCategories();
    } catch {
      setError("Failed to delete category");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
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
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Categories
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Manage product categories
          </p>
        </div>
        {userRole === "Manager" && (
          <button
            onClick={startCreate}
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} />
            New Category
          </button>
        )}
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
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {error}
          <button
            onClick={() => setError("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 2 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && userRole === "Manager" && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            {editingId ? "Edit Category" : "New Category"}
          </h3>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="form-label">Name *</label>
                <input
                  className="input-field"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Electronics"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <input
                  className="input-field"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div className="empty-state"><p>Loading categories...</p></div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <FolderTree size={48} />
            <p style={{ fontSize: 16, fontWeight: 500, marginTop: 8 }}>No categories yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Create a category to organize your products</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Products</th>
                {userRole === "Manager" && <th style={{ width: 100, textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ cursor: "default" }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(99, 102, 241, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FolderTree size={16} color="var(--accent-primary)" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    {cat.description || "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Package size={13} color="var(--text-muted)" />
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {cat._count?.products ?? "—"}
                      </span>
                    </div>
                  </td>
                  {userRole === "Manager" && (
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => startEdit(cat)}
                          style={{
                            padding: "6px 8px",
                            background: "none",
                            border: "1px solid var(--border-primary)",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            color: "var(--text-secondary)",
                          }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          style={{
                            padding: "6px 8px",
                            background: "none",
                            border: "1px solid rgba(198, 40, 40, 0.2)",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            color: "var(--danger)",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
