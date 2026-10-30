"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const res = await signIn("credentials", { email: String(f.get("email")), password: String(f.get("password")), redirect: false });
    if (res?.error) {
      setError("That email or password isn’t right.");
      setBusy(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    // only allow redirects inside our own site
    router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
    router.refresh();
  }

  return (
    <div className="narrow">
      <h1 className="hl" style={{ fontSize: 40, marginBottom: 20 }}>Log in</h1>
      <form className="stack" onSubmit={onSubmit}>
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn cta" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
      <p className="mut">New here? <Link href="/register">Create an account</Link></p>
    </div>
  );
}
