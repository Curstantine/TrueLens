"use client";

import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "~/server/validation/auth";

import Button from "~/app/_components/form/Button";
import HookedInput from "~/app/_components/form/hooked/Input";

export default function SignInForm() {
	const { control, register, handleSubmit } = useForm({
		resolver: zodResolver(loginSchema),
		mode: "onSubmit",
	});

	const onSubmit = handleSubmit(async (data) => {
		const resp = await signIn("credentials", {
			email: data.email,
			password: data.password,
			redirectTo: "/",
		});

		if (resp?.error) {
			toast.error("An error occurred. Please try again later.", {
				description: resp.error,
			});
		}
	});

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
			<HookedInput
				control={control}
				id="email"
				type="email"
				label="Email"
				{...register("email")}
			/>
			<HookedInput
				control={control}
				id="password"
				type="password"
				label="Password"
				{...register("password")}
			/>

			<div className="text-muted-foreground mb-4 inline-flex items-center justify-between text-xs">
				<Link href="/auth/signup">Don&apos;t have an account?</Link>
				<Link href="/auth/forgot-password">Forgot password?</Link>
			</div>

			<Button type="submit">Continue</Button>
		</form>
	);
}
