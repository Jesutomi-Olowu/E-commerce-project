import type { Product } from "@/lib/api";
import Thumb from "./Thumb";

// Shows the seller's first uploaded image, or a CSS preview if there is none yet.
export default function Preview({ p, big }: { p: Product; big?: boolean }) {
  if (p.imageUrls[0]) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="th" src={p.imageUrls[0]} alt={`Preview of ${p.title}`} />;
  }
  return big ? <div className="th" style={{ padding: 0 }}><Thumb category={p.category} /></div> : <Thumb category={p.category} />;
}
