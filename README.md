<p align="center">
  <img src="https://img.shields.io/badge/CoreInvent-Liquid_Glass-A855F7?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMSA2LjVsLTMtMS43NS0xMCAxMEwzIDguNWwtMyAxLjc1TDggMjBsMTMtMTMuNXoiLz48L3N2Zz4=" alt="CoreInvent" />
</p>

<h1 align="center">
  📦 CoreInvent
</h1>

<p align="center">
  <strong>The Ultimate Modern Inventory & Warehouse Management System</strong><br/>
  <em>Engineered for speed, precision, and visual excellence</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Prisma-7.5.0-2D3748?style=flat-square&logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
</p>

---

## 🌟 Overview

**CoreInvent** is a professional-grade Inventory Management System (IMS) designed to streamline warehouse operations, from stock receipts and internal moves to complex delivery workflows. Built with a focus on real-time accuracy and a premium user experience, it empowers organizations to maintain perfect visibility over their assets across multiple locations.

The interface adheres to the **Liquid Glass** design language: high-saturation purple accents, deep navy environments, and sophisticated frosted glass layers that create a sense of depth and modern elegance.

---



## 🏗️ Architecture

```
coreinventry/
├── app/                        # Next.js App Router (16.1.6)
│   ├── (auth)/                 # Authentication flows (Login, Signup)
│   ├── (dashboard)/            # Main application shell
│   │   ├── products/           # Product & Category management
│   │   ├── operations/         # Stock moves: Receipts, Deliveries, Internal
│   │   ├── adjustments/        # Inventory count & correction workflows
│   │   ├── move-history/       # Full audit trail of all stock movements
│   │   ├── users/              # RBAC User management
│   │   └── page.tsx            # Analytics Dashboard with real-time KPIs
│   ├── api/                    # Serverless API routes
│   ├── globals.css             # Liquid Glass design tokens & Utility classes
│   └── layout.tsx              # Root configuration & Font loading
├── components/                 # Reusable UI components (Modals, Tables, Pills)
├── lib/                        # Core logic, Prisma client, and JWT utils
├── prisma/                     # Database Schema & Migrations (Prisma 7)
│   └── schema.prisma           # Comprehensive PostgreSQL data model
├── public/                     # Static assets & brand identity
├── proxy.ts                    # Edge-compatible routing & auth middleware
└── package.json                # Project dependencies & scripts
```

---

## 🔐 Role-Based Access Control

CoreInvent ensures data integrity through two distinct user roles:

| Role | Dashboard | Products | Operations | Adjustments | User Mgmt |
|---|:---:|:---:|:---:|:---:|:---:|
| **Manager** | ✅ Full Access | ✅ CRUD | ✅ Full Control | ✅ Full Control | ✅ Manage |
| **Staff** | ✅ View | 📖 Read | ✅ Process | ✅ Create | ❌ |

---

## 🔄 Inventory Lifecycle

```mermaid
graph LR
    A[Receipt] -- In --> B[Warehouse/Location]
    B -- Internal Move --> B
    B -- Out --> C[Delivery]
    B -- Correction --> D[Adjustment]
    style B fill:#060F18,stroke:#A855F7,stroke-width:2px,color:#fff
```

**Automated Stock Logic:**
- **Double-Entry Bookkeeping**: Every move creates balanced `StockMoveHistory` records.
- **Location Virtualization**: Supports Scrap locations and Vendor locations for full traceability.
- **Smart Statuses**: Operations flow from `Draft` → `Waiting` → `Ready` → `Done`.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **Postgres** (Neon recommended)
- **npm** or **yarn**

### 1. Clone & Install

```bash
git clone https://github.com/tirth-bhimani/coreinventry.git
cd coreinventry
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root:

```bash
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secure-secret"
RESEND_API_KEY="your-email-service-key"
```

### 3. Database Initialization

```bash
npx prisma generate
npx prisma db push
```

### 4. Running the Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** to access the dashboard.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 | App Router, Server Components |
| **Language** | TypeScript | Strong typing across stack |
| **Database** | Prisma 7 | PostgreSQL with Neon Adapter |
| **Styling** | Tailwind CSS 4 | Modern utility-first CSS |
| **Auth** | JWT / Cookies | Secure session management |
| **Icons** | Lucide React | Clean, scalable vector icons |

---

## 📄 Project Context

This project was developed for professional inventory control, emphasizing high performance and state-of-the-art UI/UX patterns.

---
