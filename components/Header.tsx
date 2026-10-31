"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Wordmark } from "./Logo";

export default function Header() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <header className="hd">
      <div className="w hdi">
        <Link href="/" aria-label="goodbyte home" style={{ textDecoration: "none" }}>
          <Wordmark />
        </Link>
        <nav>
          <Link href="/" className="lk">Library</Link>
          {session && <Link href="/account/downloads" className="lk">My downloads</Link>}
          {role === "seller" && <Link href="/seller" className="lk">Seller dashboard</Link>}
          <span style={{ flex: 1 }} />
          {session ? (
            <button className="btn" onClick={() => signOut({ callbackUrl: "/" })}>Log out</button>
          ) : (
            <>
              <Link href="/login" className="lk">Log in</Link>
              <Link href="/register" className="btn">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
