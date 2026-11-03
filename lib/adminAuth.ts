import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

/** Constant-time string comparison that tolerates different lengths. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Authorizes admin API calls: a NextAuth session, or a Bearer token matching
 * ADMIN_SECRET. When ADMIN_SECRET is not configured the Bearer path is
 * disabled entirely (there is no default secret).
 */
export async function validateAdminAuth(req: NextRequest): Promise<boolean> {
  const session = await auth();
  if (session) return true;

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  return safeEqual(authHeader.slice(7), adminSecret);
}
