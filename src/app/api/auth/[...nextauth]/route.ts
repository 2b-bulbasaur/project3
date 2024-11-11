import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/customer/login", // Redirect to your custom login page
  },
  callbacks: {
    async session({ session, token }) {
      // Ensure session.user exists and assign the email
      if (token.email) {
        session.user = session.user || {}; // Initialize session.user if undefined
        session.user.email = token.email; // Safely assign the email
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add user email to the token during sign-in
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
