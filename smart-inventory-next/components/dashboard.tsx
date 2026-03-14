"use client";

import Link from "next/link";
import Image from "next/image";
import type { DashboardPayload } from "@/components/types";

type Props = {
  data: DashboardPayload;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export function Dashboard({ data }: Props) {
  return (
    <div className="page-shell">
      <section className="hero">
        <div>
          <h1>Smart Inventory Command Center</h1>
          <p>
            Build-to-win demo: dead stock intelligence, peer-to-peer stock exchange, path optimization, heatmapped
            locations, and instant Ghost Recovery from one dashboard.
          </p>
          <div className="actions">
            <Link href="/lost-found" className="btn btn-primary">
              Lost and Found
            </Link>
            <Link href="/leaderboard" className="btn btn-secondary">
              Staff Leaderboard
            </Link>
          </div>
        </div>
        <div className="feature-svg-wrap">
          <Image
            src="/CoreInventory-8-hours.svg"
            alt="Smart inventory features and architecture"
            width={640}
            height={360}
            className="feature-svg"
            priority
          />
        </div>
      </section>

      <section className="kpi-grid">
        <article className="kpi-card">
          <p>Total Stock Value</p>
          <h2>{currency.format(data.metrics.totalStockValue)}</h2>
        </article>
        <article className="kpi-card">
          <p>Dead Stock Count</p>
          <h2>{data.metrics.deadStockCount}</h2>
        </article>
        <article className="kpi-card">
          <p>Pending P2P Transfers</p>
          <h2>{data.metrics.pendingP2PTransfers}</h2>
        </article>
        <article className="kpi-card">
          <p>High-Risk Expiries</p>
          <h2>{data.metrics.highRiskExpiries}</h2>
        </article>
      </section>

      <section className="sections">
        <article className="panel">
          <h3>Path Optimization</h3>
          <p className="hint">Sorted by removal order then location name for a logical walking sequence.</p>
          <ul className="pick-list">
            {data.optimizedPath.map((step) => (
              <li key={step.id} className="pick-item">
                #{step.sourceOrder} | {step.product} x {step.qty} | {step.from} to {step.to}
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h3>Internal Stock Exchange Suggestions</h3>
          <p className="hint">Instead of new receipts, redirect from warehouses that exceed max reorder qty.</p>
          <ul className="suggestion-list">
            {data.p2pSuggestions.length === 0 ? (
              <li className="suggestion-item">No surplus detected right now.</li>
            ) : (
              data.p2pSuggestions.map((item) => (
                <li key={`${item.product}-${item.warehouse}`} className="suggestion-item">
                  {item.product} at {item.warehouse}: {item.available.toFixed(1)} available, max {item.maxQty.toFixed(1)}
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <h3>Location Heatmap</h3>
        <p className="hint">Red zones = highest activity. Blue zones = low activity.</p>
        <div className="heatmap-grid">
          {data.heatmap.map((cell) => (
            <div key={cell.id} className={`heat-cell ${cell.level.toLowerCase()}`}>
              <strong>{cell.name}</strong>
              <p>{cell.warehouse}</p>
              <span className="badge">Activity {cell.activityIndex}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
