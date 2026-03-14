"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, X, ArrowRight } from "lucide-react";

interface SearchResult {
  id: string;
  name: string;
  sku_code: string;
  category_name: string | null;
  total_stock: string;
  low_stock_threshold: number;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults((data.products || []).slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (id: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/products/${id}`);
  };

  const isLow = (r: SearchResult) =>
    parseFloat(r.total_stock) <= r.low_stock_threshold && parseFloat(r.total_stock) > 0;

  const isOut = (r: SearchResult) => parseFloat(r.total_stock) === 0;

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-primary)",
          background: "var(--bg-card)",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: 13,
          transition: "all 0.2s ease",
          minWidth: 220,
        }}
      >
        <Search size={15} />
        <span style={{ flex: 1, textAlign: "left" }}>Search products...</span>
        <kbd
          style={{
            fontSize: 11,
            padding: "2px 6px",
            borderRadius: 4,
            border: "1px solid var(--border-primary)",
            background: "var(--bg-secondary)",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Ctrl+K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 120,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            ref={containerRef}
            className="animate-fade-in"
            style={{
              width: "100%",
              maxWidth: 560,
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-primary)",
              }}
            >
              <Search size={18} color="var(--accent-primary)" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products by name or SKU..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  setResults([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {loading && (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  Searching...
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                  <Package size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p style={{ fontSize: 14 }}>No products found for "{query}"</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div style={{ padding: 8 }}>
                  {results.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        border: "none",
                        background: "transparent",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "var(--text-primary)",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
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
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                          {r.name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {r.sku_code}
                          {r.category_name && (
                            <span style={{ fontFamily: "inherit", marginLeft: 8, color: "var(--text-secondary)" }}>
                              • {r.category_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: isOut(r) ? "var(--danger)" : isLow(r) ? "var(--warning)" : "var(--text-primary)",
                          }}
                        >
                          {parseFloat(r.total_stock).toFixed(0)}
                        </div>
                        {isLow(r) && (
                          <span style={{ fontSize: 10, color: "var(--warning)", fontWeight: 600 }}>LOW</span>
                        )}
                        {isOut(r) && (
                          <span style={{ fontSize: 10, color: "var(--danger)", fontWeight: 600 }}>OUT</span>
                        )}
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </button>
                  ))}
                </div>
              )}

              {!query && (
                <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                  <p style={{ fontSize: 13 }}>Type to search products by name or SKU code</p>
                  <p style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
                    Press <kbd style={{ padding: "1px 4px", borderRadius: 3, border: "1px solid var(--border-primary)", fontFamily: "var(--font-mono)", fontSize: 10 }}>ESC</kbd> to close
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
