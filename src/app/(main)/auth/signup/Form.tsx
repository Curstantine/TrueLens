"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { registerSchema } from "~/server/validation/auth";
import { registerAction } from "~/server/actions/auth";

import Button from "~/app/_components/form/Button";
import Input from "~/app/_components/form/Input";

export default function SignUpForm() {
	const { register, handleSubmit } = useForm({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = handleSubmit(async (data) => {
		const resp = await registerAction(data);

		if (resp?.serverError) {
			toast.error("An error occurred. Please try again later.", {
				description: resp.serverError,
			});
		}
	});

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-3">
			<Input id="email" type="email" label="Email" {...register("email")} />
			<Input id="password" type="password" label="Password" {...register("password")} />
			<Input
				id="password"
				type="password"
				label="Confirm Password"
				{...register("confirmPassword")}
			/>

			<div className="text-muted-foreground mb-4 inline-flex items-center justify-between text-xs">
				<Link href="/auth/signin">Already have an account?</Link>
			</div>

			<Button type="submit">Continue</Button>
		</form>
	);
}
