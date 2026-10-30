import { auth } from "@/auth";
import { HttpError } from "./http";

export type Role = "buyer" | "seller";

// The ONLY place user identity comes from: the verified session token.
// Never read userId / sellerId from the request body.
export async function requireUser(role?: Role) {
  const session = await auth();
  if (!session?.user) throw new HttpError(401, "Sign in required");
  if (role && session.user.role !== role) throw new HttpError(403, "Not allowed");
  return session.user;
}
