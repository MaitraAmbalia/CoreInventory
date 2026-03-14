

<h1 align="center">
  🌿 CoreInventory
</h1>

<p align="center">
  <strong>A centralized, rule-based inventory lifecycle management system</strong><br/>
  <em>Built with the premium Verdant Glass design language</em>
</p>

---

## 🌟 Overview

**CoreInvent** is a professional-grade inventory and warehouse management system designed for modern logistics. It provides real-time visibility into stock levels, automated operation workflows, and detailed move history tracking across multiple warehouses.

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

## 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o{ Operation : "manages"
    Warehouse ||--o{ Location : "contains"
    Location ||--o{ StockLevel : "holds"
    Location ||--o{ Operation : "src/dest"
    Location ||--o{ StockMoveHistory : "from/to"
    Category ||--o{ Product : "categorizes"
    Product ||--o{ StockLevel : "tracked_at"
    Product ||--o{ OperationItem : "included_in"
    Product ||--o{ StockMoveHistory : "logged_in"
    Operation ||--o{ OperationItem : "contains"
    Operation ||--o{ StockMoveHistory : "generates"

    User {
        string id PK
        string name
        string email
        UserRole role
    }
    Warehouse {
        string id PK
        string name
        string shortCode
    }
    Location {
        string id PK
        string name
        string shortCode
        boolean isScrap
    }
    Product {
        string id PK
        string name
        string skuCode
        string uom
    }
    StockLevel {
        string id PK
        decimal qtyOnHand
        decimal qtyAvailable
    }
    Operation {
        string id PK
        string refNo
        OperationType type
        OperationStatus status
    }
    OperationItem {
        string id PK
        decimal demandQty
        decimal doneQty
    }
    StockMoveHistory {
        string id PK
        decimal quantity
        datetime timestamp
    }
```

---

>>>>>>> 5ff058189f73365d0cc25ebcc2a3b9085ea9ad20
## 🔐 Role-Based Access Control

CoreInvent implements strict permissions for multi-user environments:

| Feature | Manager | Staff |
|---|:---:|:---:|
| **Dashboard** | ✅ Full | 📖 View |
| **Product Management** | ✅ CRUD | 📖 Read Only |
| **Inventory Operations** | ✅ Full | ✅ Create/Validate |
| **Stock Adjustments** | ✅ Full | ❌ Restricted |
| **User Management** | ✅ Full | ❌ Restricted |
| **Audit Logs** | ✅ Full | 📖 View |

---

## 🔄 Inventory Lifecycle & Business Rules

```mermaid
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

**Automated side-effects:**
- **Receipt**: Increases `qty_on_hand` at Destination Location.
- **Delivery**: Decreases `qty_available` (Reservation) then `qty_on_hand` upon validation.
- **Internal Move**: Atomically transfers stock between locations.
- **Audit Logging**: Every validated operation generates an immutable `StockMoveHistory` entry.

---

## 🚀 Quick Start

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
| `GET` | `/api/products` | Paginated product listing with filters |
| `POST` | `/api/operations` | Create Receipts/Deliveries |
| `PATCH` | `/api/operations/:id` | Validate & process stock movement |
| `GET` | `/api/stock-levels` | Real-time availability by location |

---

## 🛠️ Tech Stack

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
