"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { register } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));
    const role = f.get("role") === "seller" ? "seller" : "buyer";
    try {
      await register({ name: String(f.get("name")), email, password, role });
      await signIn("credentials", { email, password, redirect: false }); // log them in straight away
      router.push(role === "seller" ? "/seller" : "/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="narrow">
      <h1 className="hl" style={{ fontSize: 40, marginBottom: 20 }}>Create your account</h1>
      <form className="stack" onSubmit={onSubmit}>
        <label>Name<input name="name" required minLength={2} autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Password (8+ characters)<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
        <label>I want to
          <select name="role" defaultValue="buyer">
            <option value="buyer">Buy digital products</option>
            <option value="seller">Sell my digital products</option>
          </select>
        </label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn cta" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="mut">Already have an account? <Link href="/login">Log in</Link></p>
    </div>
  );
}
