// The ONLY file the screens use to talk to the backend.
// Components never call fetch() directly, so the UI stays independent of the API.

export const CATEGORIES = ["Templates", "Typefaces", "Audio", "Guides", "Presets"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  priceKobo: number;
  currency: string;
  category: Category;
  format: string;
  imageUrls: string[];
  fileName: string;
  status: "draft" | "live" | "removed";
  createdAt: string;
};

export type Order = {
  id: string;
  productId: string;
  productTitle: string;
  amountKobo: number;
  status: "pending" | "paid";
  createdAt: string;
};

// Backend stores money in kobo (100 kobo = 1 naira). Screens show naira.
export const naira = (kobo: number) => "₦" + (kobo / 100).toLocaleString("en-NG");

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Something went wrong");
  return data as T;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const register = (b: { name: string; email: string; password: string; role: "buyer" | "seller" }) =>
  call<{ ok: true }>("/api/register", json("POST", b));

export const getProducts = (category?: string) =>
  call<Product[]>("/api/products" + (category && category !== "All" ? `?category=${encodeURIComponent(category)}` : ""));
export const getMyProducts = () => call<Product[]>("/api/products?mine=1");
export const getProduct = (id: string) => call<Product>(`/api/products/${id}`);

export type NewProduct = {
  title: string;
  description: string;
  priceKobo: number;
  category: Category;
  format: string;
  imageKeys: string[];
  fileKey: string;
  fileName: string;
};
export const createProduct = (b: NewProduct) => call<Product>("/api/products", json("POST", b));
export const setStatus = (id: string, status: "draft" | "live") =>
  call<Product>(`/api/products/${id}`, json("PATCH", { status }));
export const removeProduct = (id: string) => call<{ ok: true }>(`/api/products/${id}`, { method: "DELETE" });

export const startCheckout = (productId: string) =>
  call<{ orderId: string; authorizationUrl: string }>("/api/checkout", json("POST", { productId }));
export const getOrders = () => call<Order[]>("/api/orders");
export const getDownload = (orderId: string) => call<{ url: string; fileName: string }>(`/api/downloads/${orderId}`);

// Asks the backend for a signed upload form, then sends the file straight to S3.
// Returns the S3 key to save on the product.
export async function uploadToS3(kind: "image" | "file", file: File): Promise<string> {
  const { url, fields, key } = await call<{ url: string; fields: Record<string, string>; key: string }>(
    "/api/uploads",
    json("POST", { kind, filename: file.name, contentType: file.type })
  );
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  form.append("file", file); // S3 needs the file field LAST
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed. Check the file type and size.");
  return key;
}
