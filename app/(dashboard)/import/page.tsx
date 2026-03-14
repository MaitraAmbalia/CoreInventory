"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Download,
  X,
} from "lucide-react";

interface ImportResult {
  message: string;
  created: number;
  skipped: number;
  totalRows: number;
  errors: string[];
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const validateAndSetFile = (f: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(f.type) && !["xlsx", "xls", "csv"].includes(ext || "")) {
      setError("Please upload an Excel (.xlsx, .xls) or CSV (.csv) file");
      return;
    }
    setFile(f);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }
      setResult(data);
      setFile(null);
    } catch {
      setError("Something went wrong during upload");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "Name,SKU Code,Category,UOM,Description,Low Stock Threshold\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
              Import Products
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Upload an Excel or CSV file to bulk-add products
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Download size={14} />
            Template
          </button>
        </div>
      </div>

      {/* Column format info */}
      <div
        className="glass-card"
        style={{ padding: 20, marginBottom: 20 }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
          Expected Columns
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { name: "Name", required: true },
            { name: "SKU Code", required: true },
            { name: "Category", required: false },
            { name: "UOM", required: false },
            { name: "Description", required: false },
            { name: "Low Stock Threshold", required: false },
          ].map((col) => (
            <span
              key={col.name}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "var(--font-mono)",
                background: col.required ? "rgba(99, 102, 241, 0.1)" : "var(--bg-secondary)",
                color: col.required ? "var(--accent-primary)" : "var(--text-secondary)",
                border: `1px solid ${col.required ? "rgba(99, 102, 241, 0.2)" : "var(--border-subtle)"}`,
              }}
            >
              {col.name}{col.required ? " *" : ""}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
          Column names are flexible — spaces, underscores, and case are ignored. New categories are auto-created.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="glass-card"
        style={{
          padding: 40,
          marginBottom: 20,
          textAlign: "center",
          border: dragActive ? "2px dashed var(--accent-primary)" : "2px dashed var(--border-primary)",
          background: dragActive ? "rgba(99, 102, 241, 0.05)" : "transparent",
          borderRadius: "var(--radius-lg)",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) validateAndSetFile(f);
          }}
        />
        {file ? (
          <div>
            <FileSpreadsheet
              size={48}
              color="var(--accent-primary)"
              style={{ marginBottom: 12 }}
            />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              {file.name}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setResult(null);
              }}
              style={{
                marginTop: 10,
                background: "none",
                border: "none",
                color: "var(--danger)",
                cursor: "pointer",
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <X size={14} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <Upload
              size={48}
              color="var(--text-muted)"
              style={{ marginBottom: 12, opacity: 0.5 }}
            />
            <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
              Drop your file here or click to browse
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Supports .xlsx, .xls, and .csv files
            </p>
          </div>
        )}
      </div>

      {/* Upload button */}
      {file && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={handleUpload}
            className="btn-primary"
            disabled={uploading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 20px",
              fontSize: 15,
            }}
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload & Import
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            background: "var(--danger-bg)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            fontSize: 14,
            color: "var(--danger)",
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {result.created > 0 ? (
              <CheckCircle size={24} color="var(--success)" />
            ) : (
              <AlertCircle size={24} color="var(--warning)" />
            )}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Import Results</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{result.message}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "rgba(16, 185, 129, 0.08)", textAlign: "center", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>{result.created}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Created</p>
            </div>
            <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "rgba(245, 158, 11, 0.08)", textAlign: "center", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--warning)" }}>{result.skipped}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Skipped</p>
            </div>
            <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "rgba(99, 102, 241, 0.08)", textAlign: "center", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-primary)" }}>{result.totalRows}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Rows</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>
                Issues ({result.errors.length})
              </h4>
              <div
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  padding: 12,
                }}
              >
                {result.errors.map((err, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                      padding: "4px 0",
                      borderBottom: i < result.errors.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    }}
                  >
                    {err}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <Link href="/products" className="btn-primary" style={{ textDecoration: "none" }}>
              View Products
            </Link>
            <button
              onClick={() => { setResult(null); setFile(null); }}
              className="btn-secondary"
            >
              Import More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
