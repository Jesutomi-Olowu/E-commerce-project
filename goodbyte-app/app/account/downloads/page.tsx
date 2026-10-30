"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDownload, getOrders, naira, type Order } from "@/lib/api";
import { Download } from "@/components/Icons";

export default function Downloads() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrders().then(setOrders).catch((e: Error) => setError(e.message));
  }, []);

  async function download(orderId: string) {
    setError("");
    try {
      const { url } = await getDownload(orderId); // 5-minute signed link
      window.location.href = url;
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const paid = (orders ?? []).filter((o) => o.status === "paid");
  const pending = (orders ?? []).filter((o) => o.status === "pending");

  return (
    <div className="w" style={{ padding: "32px 20px" }}>
      <h1 className="hl" style={{ fontSize: 40, marginBottom: 16 }}>My downloads</h1>
      {error && <p className="err" role="alert">{error}</p>}
      {!orders && !error && <p className="mut">Loading…</p>}
      {orders && !paid.length && <div className="pnl">Nothing here yet. <Link href="/">Explore the library</Link></div>}
      <div className="stack">
        {paid.map((o) => (
          <div key={o.id} className="pnl row">
            <span><b>{o.productTitle}</b><br /><span className="mut">{naira(o.amountKobo)} · <span className="ok">Paid</span></span></span>
            <button className="btn cta" onClick={() => download(o.id)}>Download <Download /></button>
          </div>
        ))}
      </div>
      {!!pending.length && <p className="mut" style={{ marginTop: 20 }}>{pending.length} payment{pending.length > 1 ? "s" : ""} not completed. Those items appear here once paid.</p>}
      <p className="mut">Download links are created on request and expire after 5 minutes.</p>
    </div>
  );
}
