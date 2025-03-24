import { randomUUID } from "node:crypto";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialProvider from "next-auth/providers/credentials";
import bcrypt from "@node-rs/bcrypt";
import { encode } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "~/server/db";
import { loginSchema } from "~/server/validation/auth";
import { InvalidCredentialLogin } from "~/server/errors/auth";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			name: string;
			email: string;
			role: UserRole;
			// ...other properties
		} & DefaultSession["user"];
	}

	interface User {
		isOnboarded?: boolean;
		role: UserRole;
		// ...other properties
	}
}

const adapter = PrismaAdapter(db);

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	adapter: adapter as Adapter,
	pages: {
		signIn: "/auth/signin",
		signOut: "/auth/signout",
		newUser: "/auth/signup/complete",
	},
	providers: [
		GoogleProvider,
		CredentialProvider({
			credentials: { email: {}, password: {} },
			authorize: async (credentials) => {
				const { email, password } = await loginSchema.parseAsync(credentials);

				const user = await db.user.findUnique({
					where: { email },
					include: { accounts: true },
				});

				if (!user) {
					throw new InvalidCredentialLogin("invalid_email", "Email not found");
				}

				const credAccount = user.accounts.find((x) => x.provider === "credentials");
				if (!credAccount || !credAccount?.password) {
					throw new InvalidCredentialLogin("invalid_provider", "Account not found");
				}

				const isPasswordValid = await bcrypt.compare(password, credAccount.password);
				if (!isPasswordValid) {
					throw new InvalidCredentialLogin("invalid_password", "Invalid password");
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					role: user.role,
					isOnboarded: user.isOnboarded,
				};
			},
		}),
		// GitHubProvider,
		/**
		 * ...add more providers here.
		 *
		 * Most other providers require a bit more work than the Discord provider. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
	],
	callbacks: {
		authorized: async ({ auth, request: { nextUrl } }) => {
			if (nextUrl.pathname.startsWith("/admin") && auth?.user.role !== UserRole.ADMIN) {
				return NextResponse.redirect(new URL("/", nextUrl));
			}

			return true;
		},
		signIn: ({ account, profile }) => {
			console.dir({ name: "sign-in", account, profile }, { depth: null });

			if (account?.provider === "google") {
				if (!profile || !profile.email) return false;
				return profile.email_verified === true;
			}

			return true;
		},
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				role: user.role,
				isOnboarded: user.isOnboarded,
				id: user.id,
			},
		}),
		jwt: async ({ token, user, account }) => {
			if (account?.provider === "credentials" && user.id) {
				const exp = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000);
				const sessionToken = randomUUID();

				const session = await adapter.createSession!({
					userId: user.id,
					sessionToken,
					expires: exp,
				});

				token.sessionId = session.sessionToken;
			}

			console.dir({ name: "jwt", token, user, account }, { depth: null });

			return token;
		},
	},
	jwt: {
		maxAge: 60 * 60 * 24 * 30,
		encode: async (arg) => {
			return (arg.token?.sessionId as string) ?? encode(arg);
		},
	},
	events: {
		signOut: async (message) => {
			if ("session" in message && message.session?.sessionToken) {
				await db.session.deleteMany({
					where: { sessionToken: message.session.sessionToken },
				});
			}
		},
	},
} satisfies NextAuthConfig;
