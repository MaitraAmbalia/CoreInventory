"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, LogIn, Loader2, Package } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "var(--radius-lg)",
              background: "var(--accent-gradient)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: "var(--accent-glow)",
            }}
          >
            <Package size={28} color="white" />
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 6,
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Sign in to <span className="text-gradient" style={{ fontWeight: 600 }}>CoreInvent</span>
          </p>
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
          <div style={{ marginBottom: 18 }}>
            <label className="form-label">Email</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="login-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
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
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 14,
            color: "var(--text-muted)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "var(--accent-primary)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
