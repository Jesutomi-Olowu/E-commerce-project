import Link from "next/link";
import { naira, type Product } from "@/lib/api";
import Preview from "./Preview";
import SaveButton from "./SaveButton";

// Card anatomy from the guidelines: preview, name, creator, format/category, price, save.
export default function ProductCard({ p }: { p: Product }) {
  return (
    <div className="card">
      <Link href={`/product/${p.id}`} className="cm">
        <Preview p={p} />
        <span className="cap tg">{p.format}</span>
        <span className="cb">
          <span className="t">{p.title}</span>
          <span className="mut">by {p.sellerName}</span>
          <span className="cap">{p.category} · {p.format}</span>
          <span className="t" style={{ marginTop: 6 }}>{naira(p.priceKobo)}</span>
        </span>
      </Link>
      <SaveButton id={p.id} title={p.title} />
    </div>
  );
}
