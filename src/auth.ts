import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { verifyTurnstile } from "@/lib/turnstile";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                turnstileToken: { label: "Turnstile Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email ve şifre gerekli.");
                }

                const turnstileToken = credentials.turnstileToken as string | undefined;
                const isHuman = await verifyTurnstile(turnstileToken);
                if (!isHuman) {
                    throw new Error("Güvenlik doğrulaması başarısız.");
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    return null;
                }

                if (!user.isVerified) {
                    return null;
                }

                const isPasswordValid = await compare(password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    role: user.isAdmin ? "ADMIN" : "USER",
                };
            },
        }),
    ],
    secret: process.env.AUTH_SECRET,
});
