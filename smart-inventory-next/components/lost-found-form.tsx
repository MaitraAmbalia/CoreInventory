"use client";

import { useState } from "react";

type Option = {
  id: number;
  name: string;
};

type Props = {
  products: Option[];
  locations: Option[];
};

export function LostFoundForm({ products, locations }: Props) {
  const [productId, setProductId] = useState<number>(products[0]?.id ?? 0);
  const [locationId, setLocationId] = useState<number>(locations[0]?.id ?? 0);
  const [quantity, setQuantity] = useState<number>(1);
  const [scannedImage, setScannedImage] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [mode, setMode] = useState<"ok" | "info">("ok");

  async function processScan() {
    const response = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scannedImage })
    });
    const payload = await response.json();
    setMode("info");
    setMessage(payload.message);
  }

  async function submitRecovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/ghost-recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        foundLocationId: locationId,
        quantity,
        scannedImage
      })
    });
    const payload = await response.json();
    setMode("ok");
    setMessage(payload.message || "Recovery submitted");
  }

  return (
    <form onSubmit={submitRecovery} className="form-shell">
      <h1>Ghost Recovery Wizard</h1>
      <p className="hint">Instant quant adjustment for misplaced inventory. Mobile-friendly and hackathon demo ready.</p>
      <div className="form-grid">
        <div className="field">
          <label>Product</label>
          <select value={productId} onChange={(e) => setProductId(Number(e.target.value))}>
            {products.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Found Location</label>
          <select value={locationId} onChange={(e) => setLocationId(Number(e.target.value))}>
            {locations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Quantity</label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label>Scanned Image (base64 placeholder)</label>
          <input value={scannedImage} onChange={(e) => setScannedImage(e.target.value)} placeholder="data:image/png;base64,..." />
        </div>
      </div>

      <div className="actions" style={{ marginTop: 12 }}>
        <button type="button" className="btn btn-secondary" onClick={processScan}>
          Process Scan
        </button>
        <button type="submit" className="btn btn-primary">
          Confirm Recovery
        </button>
      </div>

      {message ? <div className={`toast ${mode}`}>{message}</div> : null}
    </form>
  );
}
