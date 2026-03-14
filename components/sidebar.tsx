"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  History,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  User,
  Package2,
  Menu,
  X,
  Users,
  Settings,
  Building2,
  BarChart3,
} from "lucide-react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

const baseNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
  },
  {
    label: "Operations",
    icon: ClipboardList,
    children: [
      { label: "Receipts", href: "/operations?type=Receipt", icon: ArrowDownToLine },
      { label: "Deliveries", href: "/operations?type=Delivery", icon: Truck },
      { label: "Internal Transfers", href: "/operations?type=Internal", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Inventory Adjustment",
    href: "/adjustments",
    icon: SlidersHorizontal,
  },
  {
    label: "Move History",
    href: "/move-history",
    icon: History,
  },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [operationsOpen, setOperationsOpen] = useState(
    pathname.startsWith("/operations")
  );
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.includes("/settings") || pathname === "/users"
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);


  const navItems = [...baseNavItems];
  if (user) {
    if (user.role === "Manager") {
      navItems.push({
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      });
    }
    const settingsChildren = [
      { label: "Warehouse", href: "/settings/warehouses", icon: Building2 },
    ];
    if (user.role === "Manager") {
      settingsChildren.push({ label: "Users", href: "/users", icon: Users });
    }
    navItems.push({
      label: "Settings",
      icon: Settings,
      children: settingsChildren,
    });
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <>
      {}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden"
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 60,
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-md)",
          padding: 8,
          color: "var(--text-primary)",
          cursor: "pointer",
        }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
        />
      )}

      {}
      <aside
        className={`sidebar ${mobileOpen ? "open" : ""}`}
        style={mobileOpen ? { transform: "translateX(0)" } : undefined}
      >
        {}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Package2 size={20} color="white" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  CoreInvent
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Inventory System
                </div>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          <div
            style={{
              padding: "0 20px",
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Menu
          </div>
          {navItems.map((item) => {
            if (item.children) {
              const isOpen = item.label === "Operations" ? operationsOpen : settingsOpen;
              const setOpen = item.label === "Operations" ? setOperationsOpen : setSettingsOpen;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpen(!isOpen)}
                    className="sidebar-link"
                    style={{
                      width: "calc(100% - 24px)",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </span>
                    <ChevronDown
                      size={14}
                      style={{
                        transition: "transform 0.2s ease",
                        transform: isOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <div
                    style={{
                      maxHeight: isOpen ? 200 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.3s ease",
                    }}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`sidebar-link ${
                          isActive(child.href) ? "active" : ""
                        }`}
                        style={{ paddingLeft: 48 }}
                        onClick={() => setMobileOpen(false)}
                      >
                        <child.icon size={16} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`sidebar-link ${
                  isActive(item.href!) ? "active" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {}
        {user && (
          <div
            style={{
              padding: "12px",
              borderTop: "1px solid var(--border-primary)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: profileOpen
                  ? "rgba(99, 102, 241, 0.08)"
                  : "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-primary)",
                transition: "background 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--accent-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  {user.role}
                </div>
              </div>
              <ChevronDown
                size={14}
                style={{
                  color: "var(--text-muted)",
                  transition: "transform 0.2s ease",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {}
            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: 12,
                  right: 12,
                  marginBottom: 4,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  boxShadow: "0 -8px 24px rgba(0,0,0,0.3)",
                }}
              >
                <Link
                  href="/profile"
                  className="sidebar-link"
                  style={{ margin: 4 }}
                  onClick={() => {
                    setProfileOpen(false);
                    setMobileOpen(false);
                  }}
                >
                  <User size={16} />
                  My Profile
                </Link>
                <div style={{ height: 1, background: "var(--border-primary)" }} />
                <button
                  onClick={handleLogout}
                  className="sidebar-link"
                  style={{
                    margin: 4,
                    width: "calc(100% - 8px)",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "var(--danger)",
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
