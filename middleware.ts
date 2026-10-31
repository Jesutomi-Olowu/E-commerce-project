import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Blocks /seller/* for non-sellers and /account/* for signed-out users.
// API routes still check roles themselves: middleware is a convenience, not the security boundary.
export default NextAuth(authConfig).auth;

export const config = { matcher: ["/seller/:path*", "/account/:path*"] };
