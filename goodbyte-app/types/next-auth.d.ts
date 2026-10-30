import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "buyer" | "seller";
  }
  interface Session {
    user: { id: string; role: "buyer" | "seller" } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: "buyer" | "seller";
  }
}
