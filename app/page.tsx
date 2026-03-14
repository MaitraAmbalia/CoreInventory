"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import {
  Package2,
  ArrowRight,
  BarChart3,
  Layers,
  RefreshCcw,
  Shield,
  Warehouse,
  Zap,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* ── Navigation ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--border-primary)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package2 size={20} color="white" />
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              CoreInvent
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ThemeToggle />
            <Link
              href="/login"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                transition: "color 0.2s ease",
              }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
                fontSize: 14,
                padding: "8px 18px",
              }}
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        style={{
          paddingTop: 140,
          paddingBottom: 80,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(199, 234, 187, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 200,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(74, 140, 63, 0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="animate-fade-in"
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--accent-primary)",
              marginBottom: 28,
            }}
          >
            <Zap size={14} />
            Production-Ready Inventory Management
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              color: "var(--text-primary)",
              marginBottom: 20,
            }}
          >
            Track Every Unit.
            <br />
            <span className="text-gradient">Control Every Move.</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              color: "var(--text-secondary)",
              maxWidth: 560,
              margin: "0 auto 36px",
              lineHeight: 1.65,
            }}
          >
            CoreInvent is a double-entry inventory system that gives you
            real-time visibility into stock levels, warehouse operations, and
            supply chain workflows — all in one place.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/dashboard"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                fontSize: 16,
                padding: "14px 28px",
                fontWeight: 600,
              }}
            >
              Go to Dashboard
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/signup"
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                fontSize: 16,
                padding: "14px 28px",
              }}
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trusted By / Stats Bar ── */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto 80px",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 1,
            background: "var(--border-primary)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--border-primary)",
          }}
        >
          {[
            { value: "99.9%", label: "Uptime" },
            { value: "2x", label: "Faster Operations" },
            { value: "Real-time", label: "Stock Updates" },
            { value: "RBAC", label: "Access Control" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-card)",
                padding: "28px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--accent-primary)",
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px 100px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              marginBottom: 12,
            }}
          >
            Everything you need to{" "}
            <span className="text-gradient">manage inventory</span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              maxWidth: 540,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Built for warehouse managers who need precision, speed, and
            accountability in every stock movement.
          </p>
        </div>

        <div
          className="stagger-children"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {[
            {
              icon: Layers,
              title: "Double-Entry Stock Tracking",
              desc: "Every move is a debit and a credit. No stock appears from nowhere, no unit vanishes without a trace.",
              color: "#4a8c3f",
              bg: "rgba(74, 140, 63, 0.08)",
            },
            {
              icon: RefreshCcw,
              title: "Real-Time Adjustments",
              desc: "Instant inventory corrections with a complete audit trail — cycle counts, shrinkage, and damage logged automatically.",
              color: "#1565c0",
              bg: "rgba(21, 101, 192, 0.08)",
            },
            {
              icon: Warehouse,
              title: "Multi-Warehouse Support",
              desc: "Manage multiple warehouses with internal transfers. Track stock across locations with full move history.",
              color: "#7b1fa2",
              bg: "rgba(123, 31, 162, 0.08)",
            },
            {
              icon: BarChart3,
              title: "Operations Dashboard",
              desc: "At-a-glance KPIs for pending receipts, late deliveries, and low-stock alerts with visual indicators.",
              color: "#e65100",
              bg: "rgba(230, 81, 0, 0.08)",
            },
            {
              icon: Shield,
              title: "Role-Based Access Control",
              desc: "Managers, workers, and viewers — each with precisely scoped permissions. Secure by design.",
              color: "#c62828",
              bg: "rgba(198, 40, 40, 0.08)",
            },
            {
              icon: Zap,
              title: "Blazing Fast & Lightweight",
              desc: "Built on Next.js and Prisma with edge-ready performance. No bloat, no heavy dependencies.",
              color: "#f9a825",
              bg: "rgba(249, 168, 37, 0.08)",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: 28,
                cursor: "default",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: feature.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <feature.icon size={24} color={feature.color} />
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 650,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-primary)",
          borderBottom: "1px solid var(--border-primary)",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                marginBottom: 12,
              }}
            >
              Simple, powerful workflow
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--text-secondary)",
                maxWidth: 480,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Get up and running in minutes, not days.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 32,
            }}
          >
            {[
              {
                step: "01",
                title: "Add Products",
                desc: "Define your catalog with SKUs, categories, and minimum stock levels.",
              },
              {
                step: "02",
                title: "Create Operations",
                desc: "Log receipts, deliveries, and internal transfers with full traceability.",
              },
              {
                step: "03",
                title: "Monitor & Adjust",
                desc: "Dashboard alerts flag discrepancies. Adjust with a full audit trail.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 800,
                    color: "var(--accent-primary)",
                    opacity: 0.25,
                    marginBottom: 12,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 650,
                    color: "var(--text-primary)",
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section
        style={{
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 40px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            Ready to take control?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Join teams that trust CoreInvent for accurate, real-time inventory
            management with zero data loss.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Link
              href="/signup"
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                fontSize: 16,
                padding: "14px 32px",
                fontWeight: 600,
              }}
            >
              Start Managing Inventory
              <ArrowRight size={18} />
            </Link>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle2 size={14} color="var(--accent-primary)" />
                Free to use
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle2 size={14} color="var(--accent-primary)" />
                No credit card required
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle2 size={14} color="var(--accent-primary)" />
                Open source
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-primary)",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Package2 size={18} color="var(--accent-primary)" />
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              CoreInvent
            </span>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            © {new Date().getFullYear()} CoreInvent. Built with Next.js &
            Prisma.
          </p>
        </div>
      </footer>
    </div>
  );
}
