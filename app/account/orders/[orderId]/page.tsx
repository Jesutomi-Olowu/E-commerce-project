"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDownload, getOrders, type Order } from "@/lib/api";
import { Download } from "@/components/Icons";

// Paystack sends the buyer back here. The webhook may take a few seconds,
// so we check the order every 2 seconds (up to 10 times) until it shows as paid.
export default function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let tries = 0;
    let stop = false;
    async function check() {
      const found = (await getOrders().catch(() => [])).find((o) => o.id === orderId) ?? null;
      if (stop) return;
      setOrder(found);
      if (found?.status === "paid") return;
      if (++tries >= 10) return setGaveUp(true);
      setTimeout(check, 2000);
    }
    check();
    return () => { stop = true; };
  }, [orderId]);

  async function download() {
    const { url } = await getDownload(orderId);
    window.location.href = url;
  }

  return (
    <div className="narrow">
      {order?.status === "paid" ? (
        <>
          <h1 className="hl" style={{ fontSize: 40, marginBottom: 12 }}>Payment confirmed</h1>
          <p>“{order.productTitle}” is ready.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn cta" onClick={download}>Download <Download /></button>
            <Link href="/account/downloads" className="btn">My downloads</Link>
          </div>
        </>
      ) : gaveUp ? (
        <>
          <h1 className="hl" style={{ fontSize: 40, marginBottom: 12 }}>Still confirming</h1>
          <p>We haven’t received confirmation yet. If you were charged, your download will appear in My downloads shortly.</p>
          <Link href="/account/downloads" className="btn dk">My downloads</Link>
        </>
      ) : (
        <>
          <h1 className="hl" style={{ fontSize: 40, marginBottom: 12 }}>Confirming your payment…</h1>
          <p className="mut" role="status">This usually takes a few seconds.</p>
        </>
      )}
    </div>
  );
}
