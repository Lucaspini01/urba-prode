import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-compatible NextAuth instance for middleware only (no Prisma)
export const { auth } = NextAuth(authConfig);
