"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

import { actionClient } from "~/server/actions";
import { signIn } from "~/server/auth";
import { db } from "~/server/db";
import { InvalidCredentialSignup } from "~/server/errors/auth";
import { registerCompleteSchema, registerSchema } from "~/server/validation/auth";

export const registerAction = actionClient
	.schema(registerSchema)
	.action(async ({ parsedInput: { email, password } }) => {
		const user = await db.user.findUnique({ where: { email } });

		if (user) throw new InvalidCredentialSignup("email_exists", "Email already exists");

		const hashedPassword = await bcrypt.hash(password, 10);
		await db.$transaction(async (tx) => {
			const { id } = await tx.user.create({
				data: {
					email,
					name: "N/A",
				},
			});

			await tx.account.create({
				data: {
					userId: id,
					type: "credentials",
					provider: "credentials",
					providerAccountId: id,
					password: hashedPassword,
				},
			});
		});

		await signIn("credentials", {
			redirect: true,
			redirectTo: "/auth/signup/complete",
			email,
			password,
		});
	});

export const registerCompleteAction = actionClient
	.schema(registerCompleteSchema)
	.action(async ({ parsedInput: { userId, name, country } }) => {
		const user = await db.user.findUnique({ where: { id: userId } });
		if (!user) throw new InvalidCredentialSignup("user_not_found", "User not found");

		await db.user.update({
			where: { id: userId },
			data: { name, country, isOnboarded: true },
		});

		redirect("/");
	});
