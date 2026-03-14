"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2, MapPin, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

// @ts-ignore
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
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal State
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          shortCode: modalMode === "Create" ? formData.shortCode : undefined, // Can't change shortcode easily
          address: formData.address,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      
      setShowModal(false);
      fetchWarehouses();
    } catch (err: any) {
      alert(err.message);
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
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredWarehouses = warehouses.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-slate-400 font-mono">Loading warehouses...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Building2 className="h-8 w-8 text-indigo-500" />
            Warehouse Management
          </h1>
          <p className="text-slate-400 mt-1">Manage physical storage locations and facilities.</p>
        </div>
        <button
          onClick={() => openModal("Create")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-indigo-600/20"
        >
          <Plus size={18} />
          Add Warehouse
        </button>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">{error}</div>}

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search warehouses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Warehouse Name</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Short Code</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Total Stock</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No warehouses found.
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Building2 size={18} />
                        </div>
                        <span className="font-medium text-white">{wh.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {wh.shortCode}
                      </span>
                    </td>
                    <td className="p-4">
                      {wh.address ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <MapPin size={14} />
                          {wh.address}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-indigo-400">
                        {parseFloat(wh.totalStock.toString()).toFixed(0)} <span className="text-xs font-normal text-slate-500">units</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal("Edit", wh)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-md transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(wh.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800/80">
              <h2 className="text-xl font-bold text-white">{modalMode} Warehouse</h2>
              <p className="text-sm text-slate-400 mt-1">
                {modalMode === "Create" ? "Add a new facility to your network." : "Update facility details."}
              </p>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Warehouse Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Central Distribution Hub"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                  <span>Short Code</span>
                  {modalMode === "Edit" && <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Locked</span>}
                </label>
                <input
                  type="text"
                  required
                  disabled={modalMode === "Edit"}
                  value={formData.shortCode}
                  onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. WH1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase"
                />
                {modalMode === "Create" && (
                  <p className="text-xs text-slate-500 mt-1">A unique 3-5 letter identifier. Cannot be changed later.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Address (Optional)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, Country"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800/80 mt-6 -mx-6 px-6 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-indigo-600/20"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
