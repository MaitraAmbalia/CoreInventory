"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { User, Mail, Shield, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--text-muted)" }}>
        Loading profile...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 500 }}>
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
        {/* Avatar */}
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

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {user.name}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
          {user.email}
        </p>

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
        </div>
      </div>
    </div>
  );
}
