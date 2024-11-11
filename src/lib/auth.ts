// /src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXTAUTH_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.NEXTAUTH_GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/customer/login", 
  },
  callbacks: {
    async session({ session, token }) {
      if (token.email) {
        session.user = session.user || {};
        session.user.email = token.email;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
  },
};