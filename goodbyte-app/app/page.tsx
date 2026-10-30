"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIES, getProducts, type Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Wordmark } from "@/components/Logo";
import { Check, Download, Heart } from "@/components/Icons";

export default function Home() {
  const [cat, setCat] = useState<string>("All");
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(null);
    setError("");
    getProducts(cat).then(setItems).catch((e: Error) => setError(e.message));
  }, [cat]);

  return (
    <>
      <section className="w hero">
        <div>
          <h1 className="hl" style={{ fontSize: "clamp(40px,7.5vw,72px)" }}>Create more of what <mark>moves you.</mark></h1>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 300, color: "var(--mut)" }}>Ideas, ready to download.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#library" className="btn dk">Explore the library <span aria-hidden="true">→</span></a>
            <Link href="/register" className="btn">Open your shop</Link>
          </div>
        </div>
        <div className="gr">
          <div className="cp">
            <span className="cap">Creative tools for brighter ideas</span>
            <span className="cap">Templates · Typefaces · Audio loops · Guides · Presets</span>
          </div>
        </div>
      </section>

      <section className="w vr">
        <div><span className="ic"><Download /></span><span><b>Instant download</b><br /><span className="mut">Files ready in your library</span></span></div>
        <div><span className="ic"><Heart /></span><span><b>Independent creators</b><br /><span className="mut">Every product shows who made it</span></span></div>
        <div><span className="ic"><Check /></span><span><b>Thoughtfully made tools</b><br /><span className="mut">Clear formats, licenses and previews</span></span></div>
      </section>

      <section className="w" id="library" style={{ paddingTop: 40 }}>
        <h2 className="hl" style={{ fontSize: 32 }}>Browse the library</h2>
        <div className="chips" role="group" aria-label="Filter by category">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        {!items && !error && <p className="mut">Loading…</p>}
        {items && (items.length ? <div className="grid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <p>Nothing here yet.</p>)}
      </section>

      <section className="band">
        <div className="w">
          <h2 className="ed" style={{ margin: 0, fontSize: "clamp(34px,5vw,56px)", lineHeight: 1.1, maxWidth: 520 }}>A more creative tomorrow is a download away.</h2>
          <div><Wordmark size={34} /><p style={{ margin: "6px 0 0", fontWeight: 300 }}>Ideas, ready to download.</p></div>
        </div>
      </section>
    </>
  );
}
