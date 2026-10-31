"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyProducts, naira, removeProduct, setStatus, type Product } from "@/lib/api";

export default function SellerDashboard() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  const load = () => getMyProducts().then(setItems).catch((e: Error) => setError(e.message));
  useEffect(() => { load(); }, []);

  async function act(fn: () => Promise<unknown>) {
    setError("");
    try { await fn(); await load(); } catch (e) { setError((e as Error).message); }
  }

  const mine = (items ?? []).filter((p) => p.status !== "removed");

  return (
    <div className="w" style={{ padding: "32px 20px" }}>
      <div className="row" style={{ marginBottom: 20 }}>
        <h1 className="hl" style={{ fontSize: 40 }}>Seller dashboard</h1>
        <Link href="/seller/new" className="btn cta">Add a product</Link>
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="pnl">
        <h2 className="hl" style={{ fontSize: 24, marginBottom: 12 }}>Your products ({mine.length})</h2>
        {!items && !error && <p className="mut">Loading…</p>}
        {items && !mine.length && <p>No products yet. Add your first one.</p>}
        {!!mine.length && (
          <div className="tw">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th><span style={{ position: "absolute", left: -9999 }}>Actions</span></th></tr></thead>
              <tbody>
                {mine.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.category}</td>
                    <td>{naira(p.priceKobo)}</td>
                    <td><span className="ok">{p.status === "live" ? "Live" : "Draft"}</span></td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button className="btn sm" aria-label={`${p.status === "live" ? "Unpublish" : "Publish"} ${p.title}`} onClick={() => act(() => setStatus(p.id, p.status === "live" ? "draft" : "live"))}>
                        {p.status === "live" ? "Unpublish" : "Publish"}
                      </button>{" "}
                      <button className="btn sm" aria-label={`Remove ${p.title}`} onClick={() => confirm("Remove this product? Past buyers keep their downloads.") && act(() => removeProduct(p.id))}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mut">You only see and edit your own products here.</p>
      </div>
    </div>
  );
}
