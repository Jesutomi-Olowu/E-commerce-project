import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no bcrypt, no DB). Used by middleware.ts and auth.ts.
export default {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      if (path.startsWith("/seller")) return auth?.user?.role === "seller";
      if (path.startsWith("/account")) return !!auth?.user;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.uid as string;
      session.user.role = token.role as "buyer" | "seller";
      return session;
    },
  },
} satisfies NextAuthConfig;
