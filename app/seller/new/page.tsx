"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, createProduct, uploadToS3, type Category } from "@/lib/api";

const FORMATS: Record<Category, string> = { Templates: "PDF", Typefaces: "OTF, TTF", Audio: "WAV", Guides: "PDF", Presets: "ZIP" };

export default function NewProduct() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("Templates");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const image = f.get("image") as File;
    const file = f.get("file") as File;
    const naira = Number(f.get("price"));
    if (!image?.size || !file?.size) return setError("Please choose a preview image and the product file.");
    if (!(naira >= 1)) return setError("Price must be ₦1 or more.");

    try {
      setBusy("Uploading preview image…");
      const imageKey = await uploadToS3("image", image);
      setBusy("Uploading product file…");
      const fileKey = await uploadToS3("file", file);
      setBusy("Saving listing…");
      await createProduct({
        title: String(f.get("title")),
        description: String(f.get("description")),
        priceKobo: Math.round(naira * 100), // naira → kobo
        category,
        format: String(f.get("format")),
        imageKeys: [imageKey],
        fileKey,
        fileName: file.name,
      });
      router.push("/seller");
    } catch (err) {
      setError((err as Error).message);
      setBusy("");
    }
  }

  return (
    <div className="narrow" style={{ maxWidth: 640 }}>
      <h1 className="hl" style={{ fontSize: 40, marginBottom: 20 }}>Add a product</h1>
      <form className="stack" onSubmit={onSubmit}>
        <label>Title<input name="title" required minLength={3} maxLength={120} /></label>
        <label>Description<textarea name="description" required rows={5} maxLength={5000} /></label>
        <div className="form">
          <label>Price (₦)<input name="price" type="number" min={1} step="1" required inputMode="numeric" /></label>
          <label>Category
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>File format<input key={category} name="format" defaultValue={FORMATS[category]} required maxLength={30} /></label>
        </div>
        <label>Preview image (JPG, PNG or WebP, up to 5 MB)<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required /></label>
        <label>Product file (ZIP, PDF, OTF/TTF or MP3/WAV, up to 100 MB)<input name="file" type="file" required /></label>
        {error && <p className="err" role="alert">{error}</p>}
        {busy && <p className="mut" role="status">{busy}</p>}
        <button className="btn cta" disabled={!!busy}>Add listing</button>
      </form>
    </div>
  );
}
