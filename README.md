<h1 align="center">
  🌿 CoreInventory
</h1>

<p align="center">
  <strong>The Ultimate Modern Inventory & Warehouse Management System</strong><br/>
  <em>Engineered for speed, precision, and visual excellence</em>
</p>


---

## 🌟 Overview

**CoreInvent** is a professional-grade Inventory Management System (IMS) designed to streamline warehouse operations, from stock receipts and internal moves to complex delivery workflows. Built with a focus on real-time accuracy and a premium user experience, it empowers organizations to maintain perfect visibility over their assets across multiple locations.
**CoreInvent** is a professional-grade inventory and warehouse management system designed for modern logistics. It provides real-time visibility into stock levels, automated operation workflows, and detailed move history tracking across multiple warehouses.

The interface adheres to the **Liquid Glass** design language: high-saturation purple accents, deep navy environments, and sophisticated frosted glass layers that create a sense of depth and modern elegance.
The application features the **Verdant Glass** design system: high-contrast cream backgrounds with deep forest green accents, frosted glass panels, and smooth micro-interactions that make warehouse management feel effortless and premium.

---

## 🎨 Design Language — Verdant Glass

| Token | Value | Usage |
|---|---|---|
| `--accent-primary` | `#4a8c3f` | Primary UI accents, buttons, active states |
| `--bg-primary` | `#fdfcf7` | Main environment background |
| `--bg-card` | `#ffffff` | Floating glass panel backgrounds |
| `--accent-gradient` | `linear-gradient(...)` | Progress bars, highlights, active nav indicators |
| `--shadow-lg` | `0 12px 40px ...` | Depth for glass components |

**Key effects:**
- 🪟 **Glass Card UI** — `border: 1px solid var(--border-primary)` with soft elevation.
- 🌿 **Organic Palette** — Focus on clarity and readability using nature-inspired greens.
- ✨ **Glow Interaction** — Focused elements emit a soft `box-shadow` verdant glow.
- 🎯 **Staggered Animations** — Components fade in sequentially for a polished entrance.
- 📊 **Dynamic Status** — Semantic color-coded badges for all inventory states.

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
coreinvent/
├── app/                        # Next.js 16 App Router
│   ├── (auth)/                 # Authentication Flow (Login, OTP, Reset)
│   ├── (dashboard)/            # Main Application Interface
│   │   ├── products/           # Product Catalog & SKU Management
│   │   ├── categories/         # Hierarchical Product Classification
│   │   ├── operations/         # Core Logistics (Receipts, Deliveries)
│   │   ├── adjustments/        # Stock Reconciliation & Scrap Handling
│   │   ├── analytics/          # KPI Tracking & Inventory Insights
│   │   ├── move-history/       # Immutable Stock Ledger (Audit Trail)
│   │   └── users/              # Multi-user & RBAC Management
│   ├── api/                    # Serverless API Routes
│   ├── globals.css             # 🎨 Verdant Glass Design System
│   └── layout.tsx              # Root Layout with Theme & Context Providers
│
├── components/                 # Reusable UI Components (Sidebar, Cards, Table)
├── prisma/                     # Database Schema & Migrations (PostgreSQL)
│   └── schema.prisma           # 10+ Relational Models for Enterprise Logic
├── lib/                        # Shared Utilities & API Clients
├── public/                     # Static Assets
├── next.config.ts              # Framework Configuration
└── tsconfig.json               # TypeScript Configuration
```

---

## 🔐 Role-Based Access Control

CoreInvent ensures data integrity through two distinct user roles:
CoreInvent implements strict permissions for multi-user environments:

| Role | Dashboard | Products | Operations | Adjustments | User Mgmt |
|---|:---:|:---:|:---:|:---:|:---:|
| **Manager** | ✅ Full Access | ✅ CRUD | ✅ Full Control | ✅ Full Control | ✅ Manage |
| **Staff** | ✅ View | 📖 Read | ✅ Process | ✅ Create | ❌ |
| Feature | Manager | Staff |
|---|:---:|:---:|
| **Dashboard** | ✅ Full | 📖 View |
| **Product Management** | ✅ CRUD | 📖 Read Only |
| **Inventory Operations** | ✅ Full | ✅ Create/Validate |
| **Stock Adjustments** | ✅ Full | ❌ Restricted |
| **User Management** | ✅ Full | ❌ Restricted |
| **Audit Logs** | ✅ Full | 📖 View |

---

## 🔄 Inventory Lifecycle
## 🔄 Inventory Lifecycle & Business Rules

```mermaid
graph LR
    A[Receipt] -- In --> B[Warehouse/Location]
    B -- Internal Move --> B
    B -- Out --> C[Delivery]
    B -- Correction --> D[Adjustment]
    style B fill:#060F18,stroke:#A855F7,stroke-width:2px,color:#fff
stateDiagram-v2
    [*] --> Draft: Create Operation
    Draft --> Waiting: Confirm Availability
    Waiting --> Ready: Items Staged
    Ready --> Done: Validate & Move
    Draft --> Cancelled: Cancel
    Waiting --> Cancelled: Cancel
    Done --> [*]
    Cancelled --> [*]
```

**Automated Stock Logic:**
- **Double-Entry Bookkeeping**: Every move creates balanced `StockMoveHistory` records.
- **Location Virtualization**: Supports Scrap locations and Vendor locations for full traceability.
- **Smart Statuses**: Operations flow from `Draft` → `Waiting` → `Ready` → `Done`.
**Automated side-effects:**
- **Receipt**: Increases `qty_on_hand` at Destination Location.
- **Delivery**: Decreases `qty_available` (Reservation) then `qty_on_hand` upon validation.
- **Internal Move**: Atomically transfers stock between locations.
- **Audit Logging**: Every validated operation generates an immutable `StockMoveHistory` entry.

---

## 🚀 Quick Start

## 🛠️ Tech Stack
### Prerequisites

- **Node.js** ≥ 18
- **Postgres Database** (Neon.tech recommended)
- **npm** or **pnpm**

### 1. Clone & Install

```bash
git clone https://github.com/[username]/coreinventry.git
cd coreinventry
npm install
```

### 2. Environment Setup

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://user:pass@ep-hostname.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-hostname.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your_secret_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

| Layer | Technology | Details |
### 3. Database Initialization

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** to see the app.

---

## 📡 Key API Routes

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Secure JWT-based authentication |
| `POST` | `/api/auth/register` | User onboarding (Manager only) |

### Inventory Operations
| Method | Endpoint | Description |
|---|---|---|
| **Framework** | Next.js 16 | App Router, Server Components |
| **Language** | TypeScript | Strong typing across stack |
| **Database** | Prisma 7 | PostgreSQL with Neon Adapter |
| **Styling** | Tailwind CSS 4 | Modern utility-first CSS |
| **Auth** | JWT / Cookies | Secure session management |
| **Icons** | Lucide React | Clean, scalable vector icons |
| `GET` | `/api/products` | Paginated product listing with filters |
| `POST` | `/api/operations` | Create Receipts/Deliveries |
| `PATCH` | `/api/operations/:id` | Validate & process stock movement |
| `GET` | `/api/stock-levels` | Real-time availability by location |

---

## 📄 Project Context
## 🛠️ Tech Stack

This project was developed for professional inventory control, emphasizing high performance and state-of-the-art UI/UX patterns.
| Layer | Technology |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Database** | [Neon (Serverless Postgres)](https://neon.tech/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Auth** | [JSON Web Tokens](https://jwt.io/) |
| **Exports** | [SheetJS (XLSX)](https://sheetjs.com/) & [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/index.html) |

---

<p align="center">
  <strong>Built with ⚡ for Enterprise Logistics</strong><br/>
  <sub>Powered by the Verdant Glass Design System</sub>
</p>
