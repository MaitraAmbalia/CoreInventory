"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, ArrowLeft, Edit2, Key, Loader2, Check } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);


  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);


  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  const fetchProfile = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setEditName(d.user?.name || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaveLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setPwdLoading(true);
    setPwdError("");
    try {
      const res = await fetch("/api/profile/change-password-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setPwdError(data.error || "Failed to send OTP.");
      } else {
        setOtpSent(true);
      }
    } catch {
      setPwdError("Unexpected error.");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdError("");
    try {
      if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");

      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password.");
      }

      setPwdSuccess("Password changed successfully! Next time you log in, use the new password.");
      setOtp("");
      setNewPassword("");
      setTimeout(() => {
        setIsChangingPassword(false);
        setOtpSent(false);
        setPwdSuccess("");
      }, 4000);
    } catch (err: any) {
      setPwdError(err.message || "Error changing password");
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--text-muted)", display: "flex", gap: 8, alignItems: "center" }}>
        <Loader2 size={16} className="animate-spin" /> Loading profile...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 500 }}>
      {}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/"
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
          Back to Dashboard
        </Link>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          My Profile
        </h1>
      </div>

      <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
        {}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--accent-gradient)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 700,
            color: "white",
            marginBottom: 20,
            boxShadow: "var(--accent-glow)",
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>

        {isEditing ? (
          <div style={{ marginBottom: 24, display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
            <input
              className="input-field"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              style={{ width: 200, textAlign: "center" }}
            />
            <button className="btn-primary" onClick={handleSaveProfile} disabled={saveLoading} style={{ padding: "8px 12px" }}>
              {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: "8px 12px" }}>
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              {user.name}
              <button
                onClick={() => setIsEditing(true)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
              >
                <Edit2 size={14} />
              </button>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
              {user.email}
            </p>
          </>
        )}

        {}
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 0",
              borderTop: "1px solid var(--border-primary)",
            }}
          >
            <User size={16} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Full Name
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {user.name}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 0",
              borderTop: "1px solid var(--border-primary)",
            }}
          >
            <Mail size={16} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Email
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {user.email}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 0",
              borderTop: "1px solid var(--border-primary)",
            }}
          >
            <Shield size={16} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Role
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                <span
                  style={{
                    background:
                      user.role === "Manager"
                        ? "rgba(99, 102, 241, 0.15)"
                        : "rgba(16, 185, 129, 0.15)",
                    color:
                      user.role === "Manager" ? "#818cf8" : "#10b981",
                    padding: "3px 10px",
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "column",
              gap: 12,
              padding: "14px 0",
              borderTop: "1px solid var(--border-primary)",
            }}
          >
            {!isChangingPassword ? (
              <button
                className="btn-secondary"
                onClick={() => setIsChangingPassword(true)}
                style={{ width: "100%", display: "flex", justifyContent: "center", gap: 8 }}
              >
                <Key size={16} /> Change Password...
              </button>
            ) : (
              <div style={{ width: "100%", background: "var(--bg-card)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--border-primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h4 style={{ margin: 0, fontSize: 15 }}>Change Password</h4>
                  <button onClick={() => { setIsChangingPassword(false); setOtpSent(false); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                </div>

                {pwdSuccess && <div style={{ color: "var(--success)", background: "var(--success-bg)", padding: 8, borderRadius: 4, fontSize: 13, marginBottom: 12 }}>{pwdSuccess}</div>}
                {pwdError && <div style={{ color: "var(--danger)", background: "var(--danger-bg)", padding: 8, borderRadius: 4, fontSize: 13, marginBottom: 12 }}>{pwdError}</div>}

                {!otpSent ? (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>We'll send a secure One-Time Password to <strong>{user.email}</strong> to verify your identity.</p>
                    <button className="btn-primary" onClick={handleRequestOtp} disabled={pwdLoading} style={{ width: "100%", justifyContent: "center" }}>
                      {pwdLoading ? <Loader2 size={16} className="animate-spin" /> : "Send OTP"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword}>
                     <div style={{ marginBottom: 12 }}>
                        <label className="form-label">Enter 6-digit OTP</label>
                        <input className="input-field" type="text" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" style={{ letterSpacing: 2, fontWeight: "bold" }} />
                     </div>
                     <div style={{ marginBottom: 16 }}>
                        <label className="form-label">New Password</label>
                        <input className="input-field" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
                     </div>
                     <button type="submit" className="btn-primary" disabled={pwdLoading || !otp || !newPassword} style={{ width: "100%", justifyContent: "center" }}>
                      {pwdLoading ? <Loader2 size={16} className="animate-spin" /> : "Confirm Password Change"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
