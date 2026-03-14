# Smart Inventory Next.js (Hackathon Edition)

A winning-focused smart inventory web app built with Next.js 14 + PostgreSQL + Prisma.

## Features

- Smart Dashboard with KPI cards:
  - Total Stock Value
  - Dead Stock Count (no move in 90 days)
  - Pending P2P Transfers
  - High-Risk Expiries
- Internal Stock Exchange suggestions (P2P surplus detector)
- Path Optimization sorted by removal order/location name
- Location Heatmap (high activity red, low activity blue)
- Ghost Recovery wizard with OCR simulation note
- Staff Leaderboard with delivery completion progress
- Uses provided SVG at `public/CoreInventory-8-hours.svg`

## Tech

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL (Docker compose included)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Start PostgreSQL

```bash
docker compose up -d
```

3. Configure env

```bash
cp .env.example .env
```

4. Migrate and seed

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

5. Run app

```bash
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

- `GET /api/dashboard`
- `GET /api/leaderboard`
- `POST /api/ghost-recovery`
- `POST /api/ocr`

## Notes for Judging Demo

- Start at dashboard for quick impact.
- Open Lost and Found to show instant recovery.
- Open leaderboard to show gamification and team productivity.
