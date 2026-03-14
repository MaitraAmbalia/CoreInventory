"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Package2, ArrowRight, Loader2, Key, Lock, Mail } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) setEmail(qEmail);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP or request failed.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <>
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
          Reset Password
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Enter the OTP sent to your email and a new password
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
          Password reset successful! Redirecting to login...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
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
                required
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="otp">
              6-Digit OTP
            </label>
            <div style={{ position: "relative" }}>
              <Key
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
                id="otp"
                type="text"
                required
                maxLength={6}
                className="input-field"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ paddingLeft: 40, letterSpacing: "2px", fontWeight: "bold" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="newPassword">
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
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
                id="newPassword"
                type="password"
                required
                className="input-field"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Must be at least 6 characters.
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !email || !otp || !newPassword}
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
                Reset Password <ArrowRight size={18} />
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
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={<div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
