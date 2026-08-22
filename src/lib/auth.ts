import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		Credentials({
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				const email = credentials.email as string;
				const password = credentials.password as string;
				const user = await prisma.user.findUnique({ where: { email } })
				if (!user) return null;
				const passwordValid = await bcrypt.compare(password, user.passwordHash);
				if (!passwordValid) return null;
				return { id: user.id, email: user.email, name: user.name, role: user.role };
			},
		}),
	],
	session: { strategy: "jwt" },
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
			}
			return token;
		},
		session({ session, token }) {
			session.user.id = token.id as string;
			session.user.role = token.role as string;
			return session
		}
	},
})