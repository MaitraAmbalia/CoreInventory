# CoreInvent

**CoreInvent** is a modern, web-based Inventory Management System designed for precision tracking and warehouse efficiency. Built with speed and scalability in mind, it provides a robust toolkit for managing stock, tracking movements, and organizing warehouse logistics across multiple locations.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM**: Prisma ORM
- **Authentication**: JWT & Bcryptjs
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Key Features

- **Multi-Warehouse Management**: Organize stock across different physical warehouses and internal locations.
- **Product Tracking**: Detailed product catalog with SKU codes, categories, and Unit of Measure (UOM) tracking.
- **Dynamic Stock Levels**: Real-time tracking of quantity on hand vs. quantity available.
- **Inventory Operations**: 
  - **Receipts**: Onboard new stock.
  - **Deliveries**: Manage outgoing shipments.
  - **Internal Transfers**: Move stock between locations.
  - **Adjustments**: Correct inventory discrepancies.
- **Role-Based Access Control**: Secure access for Managers and Staff.
- **Stock Move History**: Complete audit trail of every item movement.
- **Low Stock Alerts**: Configurable thresholds to prevent stockouts.

## Getting Started

### Prerequisites

- Node.js 20+ 
- A PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/coreinvent.git
   cd coreinvent
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your database URL:
   ```env
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📂 Project Structure

- `app/`: Next.js application routes and components.
  - `(auth)/`: Authentication pages (Login/Signup).
  - `(dashboard)/`: Core inventory management interface.
  - `api/`: Backend API routes.
- `lib/`: Shared utilities and database configuration.
  - `schema.ts`: Drizzle database schema definitions.
  - `db.ts`: Database client initialization.
- `components/`: Reusable UI components.
