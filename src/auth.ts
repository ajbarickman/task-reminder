import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const isDbConfigured = Boolean(process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: isDbConfigured ? PrismaAdapter(prisma) : undefined,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: isDbConfigured ? "database" : "jwt",
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        const userId = user?.id || (token?.sub as string);
        session.user.id = userId;

        if (isDbConfigured && userId) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: userId },
              select: { role: true, familyId: true },
            });
            session.user.role = (dbUser?.role as "PARENT" | "CHILD") || "PARENT";
            session.user.familyId = dbUser?.familyId || null;
          } catch (e) {
            console.error("Error fetching user profile in session callback:", e);
            session.user.role = "PARENT";
            session.user.familyId = null;
          }
        } else {
          session.user.role = (token?.role as "PARENT" | "CHILD") || "PARENT";
          session.user.familyId = (token?.familyId as string) || null;
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role || "PARENT";
        token.familyId = (user as any).familyId || null;
      }
      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.familyId) token.familyId = session.familyId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
