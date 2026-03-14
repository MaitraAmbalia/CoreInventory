"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package2, ArrowRight, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "var(--bg-default)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="bg-glow" style={{ top: "-10%", right: "-5%" }} />
      <div className="bg-glow" style={{ bottom: "-10%", left: "-5%" }} />

      <div
        className="glass-card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "40px 32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "var(--accent-glow)",
            }}
          >
            <Package2 size={24} color="white" />
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Forgot Password
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Enter your email to receive an OTP code
          </p>
        </div>

        {error && (
          <div
            className="animate-fade-in"
            style={{
              background: "var(--danger-bg)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              fontSize: 13,
              color: "var(--danger)",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {success ? (
          <div
            className="animate-fade-in"
            style={{
              background: "var(--success-bg)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              fontSize: 13,
              color: "var(--success)",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            OTP has been sent to your email. Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !email}
              style={{
                width: "100%",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Send OTP <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "var(--text-muted)",
          }}
        >
          Remember your password?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--accent-primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
