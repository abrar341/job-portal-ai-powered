// lib/auth.js - Fixed to match your registration logic
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; // Note: using named import like your registration
import bcrypt from "bcryptjs";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("🔍 Auth attempt for:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("❌ Missing credentials");
                    return null;
                }

                try {
                    // IMPORTANT: Convert email to lowercase to match registration
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email.toLowerCase() },
                    });

                    console.log("👤 User found:", user ? "YES" : "NO");

                    if (!user) {
                        console.log("❌ No user found with email:", credentials.email.toLowerCase());
                        return null;
                    }

                    // Check password - using same salt rounds (12) as registration
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    console.log("🔐 Password valid:", isValid);

                    if (!isValid) {
                        console.log("❌ Invalid password for user:", credentials.email.toLowerCase());
                        return null;
                    }

                    console.log("✅ Authentication successful for:", user.email);

                    // Return user without password
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;

                } catch (error) {
                    console.error("🚨 Authentication error:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                console.log("🎟️ Creating JWT for user:", user.email);
                token.id = user.id;
                token.role = user.role;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                console.log("📱 Creating session for user:", token.email);
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.email = token.email;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};