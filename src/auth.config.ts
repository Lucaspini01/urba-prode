import type { NextAuthConfig } from "next-auth";

// Edge-compatible config (no Prisma / heavy deps, used by middleware)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/register") ||
        pathname.startsWith("/api/clubs");

      if (isPublic) return true;
      if (isLoggedIn) return true;

      // Not logged in, redirect to login
      return false;
    },
  },
  providers: [], // providers are added in auth.ts
};
