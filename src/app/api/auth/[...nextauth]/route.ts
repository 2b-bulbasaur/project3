import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Handler for NextAuth authentication routes.
 * 
 * This handler is used to manage authentication using NextAuth.
 * It supports both GET and POST methods.
 * 
 * @see {@link https://next-auth.js.org/|NextAuth Documentation}
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };