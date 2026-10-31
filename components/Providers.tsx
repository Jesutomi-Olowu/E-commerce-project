"use client";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

// Makes the login session available to every client component (useSession).
export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
