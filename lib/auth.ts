import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const profile = await prisma.profile.findUnique({
          where: { id: user.id },
        });
        if (profile) {
          (session.user as unknown as Record<string, unknown>).role = profile.role;
          (session.user as unknown as Record<string, unknown>).projectId = profile.project_id;
        }
      }
      return session;
    },
  },
});
