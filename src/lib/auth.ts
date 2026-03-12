import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
          include: { club: true },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.username,
          username: user.username,
          clubId: user.clubId,
          clubLogo: user.club.logoPath,
          clubShortName: user.club.shortName,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = (user as any).username;
        token.clubId = (user as any).clubId;
        token.clubLogo = (user as any).clubLogo;
        token.clubShortName = (user as any).clubShortName;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.clubId = token.clubId;
      session.user.clubLogo = token.clubLogo;
      session.user.clubShortName = token.clubShortName;
      session.user.isAdmin = token.isAdmin;
      return session;
    },
  },
});
