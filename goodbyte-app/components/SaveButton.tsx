"use client";
import { useEffect, useState } from "react";
import { Heart } from "./Icons";

const KEY = "goodbyte-saved"; // saved items live in this browser only (for now)

function read(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export default function SaveButton({ id, title, label }: { id: string; title: string; label?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(read().includes(id)), [id]);

  function toggle() {
    const ids = read();
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    setSaved(next.includes(id));
  }

  return (
    <button className={label ? "btn" : "hs"} onClick={toggle} aria-pressed={saved} aria-label={`${saved ? "Unsave" : "Save"} ${title}`}>
      <Heart filled={saved} />
      {label && (saved ? "Saved" : "Save")}
    </button>
  );
}
