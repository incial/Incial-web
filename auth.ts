import { randomBytes } from "crypto";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ADMIN_EMAILS = (process.env.ADMIN_GOOGLE_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Never fall back to a hardcoded secret: anyone reading the repo could forge
// admin sessions. If no secret is configured, use a random per-process one so
// the build/startup still succeeds (sessions just won't survive a restart).
const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  randomBytes(32).toString("base64");

if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  console.warn(
    "AUTH_SECRET is not set. Using a temporary random secret; admin sessions reset on restart."
  );
}
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV !== "production",
  trustHost: true,
  // NextAuth v5 uses AUTH_SECRET env var (also accepts NEXTAUTH_SECRET for compat)
  secret: authSecret,
  providers:
    googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : [],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    /**
     * Gate access: only emails listed in ADMIN_GOOGLE_EMAILS env var are allowed.
     * Returning false rejects sign-in and redirects to the error page (our login page).
     */
    signIn({ user }) {
      const email = user.email?.toLowerCase() ?? "";
      if (ADMIN_EMAILS.length === 0) return false; // deny all if env not set
      return ADMIN_EMAILS.includes(email);
    },
    jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      if (user?.name) token.name = user.name;
      if (user?.image) token.picture = user.image;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});
