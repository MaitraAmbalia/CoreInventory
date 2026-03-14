"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Package,
  Filter,
  ChevronRight,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku_code: string;
  category_name: string | null;
  uom: string;
  total_stock: string;
  low_stock_threshold: number;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("Staff");

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserRole(d.user.role);
      })
      .catch(console.error);

    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  const isLowStock = (product: Product) =>
    parseFloat(product.total_stock) <= product.low_stock_threshold &&
    parseFloat(product.total_stock) > 0;

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
            Products
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Manage your product catalog
          </p>
        </div>
        {userRole === "Manager" && (
          <Link
            href="/products/new"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <Plus size={16} />
            New Product
          </Link>
        )}
      </div>

      {}
      <div
        className="glass-card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
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
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div style={{ minWidth: 180, position: "relative" }}>
          <Filter
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              zIndex: 1,
            }}
          />
          <select
            className="select-field"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ paddingLeft: 36 }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div className="empty-state">
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p style={{ fontSize: 16, fontWeight: 500, marginTop: 8 }}>
              No products found
            </p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {search || categoryFilter
                ? "Try adjusting your filters"
                : "Create your first product to get started"}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU Code</th>
                  <th>Category</th>
                  <th>UOM</th>
                  <th>Total Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() =>
                      (window.location.href = `/products/${p.id}`)
                    }
                  >
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
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
                          <Package size={16} color="var(--accent-primary)" />
                        </div>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                      </div>
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {p.sku_code}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {p.category_name || "—"}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{p.uom}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: isLowStock(p)
                            ? "var(--warning)"
                            : parseFloat(p.total_stock) === 0
                              ? "var(--text-muted)"
                              : "var(--text-primary)",
                        }}
                      >
                        {parseFloat(p.total_stock).toFixed(0)}
                        {isLowStock(p) && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 11,
                              background: "var(--warning-bg)",
                              color: "var(--warning)",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontWeight: 600,
                            }}
                          >
                            LOW
                          </span>
                        )}
                      </span>
                    </td>
                    <td>
                      <ChevronRight
                        size={16}
                        color="var(--text-muted)"
                      />
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
