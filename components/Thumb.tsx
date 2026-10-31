import type { Category } from "@/lib/api";

// CSS "previews" used when a product has no uploaded image yet.
const cell = ["#ECE8E0", "#EFFF72", "#9C8EFF"];

export default function Thumb({ category }: { category: Category }) {
  const base = { height: 170, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: "100%" } as const;

  if (category === "Templates") {
    const grid = [0,0,1,0,2,0,1,2,0,0,1,0,0,2,0,1,2,0,0,2,0];
    return (
      <div aria-hidden="true" style={{ ...base, background: "#F7F4EE" }}>
        <div style={{ width: "74%", border: "5px solid #252337", borderRadius: 10, padding: 8, background: "#fff", display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {grid.map((v, i) => <i key={i} style={{ background: cell[v], height: 16 }} />)}
        </div>
      </div>
    );
  }
  if (category === "Typefaces")
    return <div aria-hidden="true" style={{ ...base, background: "#F7F4EE", color: "#252337", fontSize: 92, fontWeight: 800, letterSpacing: "-.06em" }}>Aa</div>;

  if (category === "Audio")
    return (
      <div aria-hidden="true" style={{ ...base, background: "#252337" }}>
        {[26,56,38,66,44,60,30,50,24,40,62,34].map((h, i) => (
          <div key={i} className="bar" style={{ height: h, background: i < 6 ? "#9C8EFF" : "#EFFF72" }} />
        ))}
      </div>
    );
  if (category === "Presets")
    return (
      <div aria-hidden="true" style={{ ...base, background: "#9C8EFF", flexDirection: "column", gap: 18 }}>
        {[30,64,46].map((x, i) => (
          <div key={i} style={{ position: "relative", width: "62%", height: 4, background: "#252337" }}>
            <i style={{ position: "absolute", left: `${x}%`, top: -8, width: 20, height: 20, borderRadius: "50%", background: "#EFFF72", border: "2px solid #252337" }} />
          </div>
        ))}
      </div>
    );
  return (
    <div aria-hidden="true" style={{ ...base, background: "#EFFF72" }}>
      <div style={{ width: 84, height: 116, background: "#fff", border: "1px solid #252337", padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ height: 8, width: "70%", background: "#252337" }} />
        <div style={{ height: 24, background: "#9C8EFF" }} />
      </div>
    </div>
  );
}
