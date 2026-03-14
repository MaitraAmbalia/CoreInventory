"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2, MapPin, Loader2, Search } from "lucide-react";

type Location = {
  id: string;
  name: string;
  shortCode: string;
};

type Warehouse = {
  id: string;
  name: string;
  shortCode: string;
  address: string | null;
  totalStock: number | string;
  locations: Location[];
};

export default function WarehouseSettingsPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [userRole, setUserRole] = useState<string>("Staff");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"Create" | "Edit">("Create");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", shortCode: "", address: "" });

  const fetchWarehouses = async () => {
    try {
      const res = await fetch("/api/warehouses");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWarehouses(data.warehouses || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserRole(d.user.role);
      })
      .catch(console.error);
    fetchWarehouses();
  }, []);

  const openModal = (mode: "Create" | "Edit", warehouse?: Warehouse) => {
    setModalMode(mode);
    if (warehouse) {
      setFormData({
        id: warehouse.id,
        name: warehouse.name,
        shortCode: warehouse.shortCode,
        address: warehouse.address || "",
      });
    } else {
      setFormData({ id: "", name: "", shortCode: "", address: "" });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = modalMode === "Create" ? "/api/warehouses" : `/api/warehouses/${formData.id}`;
      const method = modalMode === "Create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          shortCode: modalMode === "Create" ? formData.shortCode : undefined,
          address: formData.address,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setShowModal(false);
      fetchWarehouses();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/warehouses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchWarehouses();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    }
  };

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: "var(--text-muted)" }}>
        <Loader2 size={20} className="animate-spin" style={{ marginRight: 10 }} />
        Loading warehouses...
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Building2 size={28} color="var(--accent-primary)" />
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>Warehouse Management</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Manage physical storage locations and facilities</p>
        </div>
        {userRole === "Manager" && (
          <button onClick={() => openModal("Create")} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Plus size={16} />
            Add Warehouse
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: "var(--danger-bg)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ position: "relative", maxWidth: 400 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="input-field"
            placeholder="Search warehouses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      <div className="glass-card" style={{ overflow: "hidden" }}>
        {filteredWarehouses.length === 0 ? (
          <div className="empty-state">
            <Building2 size={48} />
            <p style={{ fontSize: 16, fontWeight: 500, marginTop: 8 }}>No warehouses found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {search ? "Try adjusting your search" : "Create your first warehouse to get started"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th>Short Code</th>
                  <th>Address</th>
                  <th>Total Stock</th>
                  {userRole === "Manager" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredWarehouses.map((wh) => (
                  <tr key={wh.id} style={{ cursor: "default" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Building2 size={16} color="var(--accent-primary)" />
                        </div>
                        <span style={{ fontWeight: 500 }}>{wh.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, padding: "3px 8px", background: "var(--bg-elevated)", borderRadius: 4, border: "1px solid var(--border-primary)" }}>
                        {wh.shortCode}
                      </span>
                    </td>
                    <td>
                      {wh.address ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13 }}>
                          <MapPin size={13} />
                          {wh.address}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                        {parseFloat(wh.totalStock.toString()).toFixed(0)}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>units</span>
                    </td>
                    {userRole === "Manager" && (
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button
                            onClick={() => openModal("Edit", wh)}
                            style={{ padding: 6, background: "none", border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-primary)"; e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(wh.id)}
                            style={{ padding: 6, background: "none", border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: 16 }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-card animate-fade-in"
            style={{ width: "100%", maxWidth: 480, padding: 0, overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-primary)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{modalMode} Warehouse</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                {modalMode === "Create" ? "Add a new facility to your network." : "Update facility details."}
              </p>
            </div>

            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Warehouse Name *</label>
                  <input
                    className="input-field"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Central Distribution Hub"
                  />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Short Code *</label>
                    {modalMode === "Edit" && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 4 }}>Locked</span>
                    )}
                  </div>
                  <input
                    className="input-field"
                    type="text"
                    required
                    disabled={modalMode === "Edit"}
                    value={formData.shortCode}
                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. WH1"
                    style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase", opacity: modalMode === "Edit" ? 0.5 : 1 }}
                  />
                  {modalMode === "Create" && (
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>A unique 3-5 letter identifier. Cannot be changed later.</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Full Address (Optional)</label>
                  <input
                    className="input-field"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, Country"
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-primary)" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {submitting ? "Saving..." : "Save Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
