"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getProduct, naira, startCheckout, type Product } from "@/lib/api";
import Preview from "@/components/Preview";
import SaveButton from "@/components/SaveButton";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { status } = useSession();
  const [p, setP] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getProduct(id).then(setP).catch((e: Error) => setError(e.message));
  }, [id]);

  async function buy() {
    if (status !== "authenticated") {
      router.push(`/login?next=/product/${id}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { authorizationUrl } = await startCheckout(id);
      window.location.href = authorizationUrl; // Paystack payment page
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (error && !p) return <div className="w" style={{ padding: "40px 20px" }}><p className="err" role="alert">{error}</p></div>;
  if (!p) return <div className="w" style={{ padding: "40px 20px" }}><p className="mut">Loading…</p></div>;

  return (
    <div className="w">
      <p><button className="btn sm" onClick={() => router.push("/")}>← Back to library</button></p>
      <div className="pdp">
        <Preview p={p} big />
        <div className="stack">
          <span className="cap">{p.category} · {p.format}</span>
          <h1 className="hl" style={{ fontSize: 44 }}>{p.title}</h1>
          <span className="mut">by {p.sellerName}</span>
          <p style={{ margin: 0, whiteSpace: "pre-line" }}>{p.description}</p>
          <div className="pnl">
            <b>What you get</b>
            <ul className="ck">
              <li>1 digital file ({p.format})</li>
              <li>Instant digital download after payment</li>
            </ul>
          </div>
          <b style={{ fontSize: 28 }}>{naira(p.priceKobo)}</b>
          {error && <p className="err" role="alert">{error}</p>}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn cta" onClick={buy} disabled={busy}>{busy ? "Opening payment…" : `Buy · ${naira(p.priceKobo)}`}</button>
            <SaveButton id={p.id} title={p.title} label />
          </div>
        </div>
      </div>
    </div>
  );
}
