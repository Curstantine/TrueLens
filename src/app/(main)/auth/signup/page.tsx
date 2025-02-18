import type { Metadata } from "next";
import Link from "next/link";

import { signIn } from "~/server/auth";

import Button from "~/app/_components/Button";
import GoogleLogo from "~/app/_components/icons/GoogleLogo";
import Input from "~/app/_components/Input";

export const metadata: Metadata = {
	title: "TrueLens - Sign Up",
};

export default function Page() {
	return (
		<main className="mx-auto max-w-md py-24">
			<div className="mb-8 flex flex-col">
				<h1 className="mb-0 text-2xl leading-tight font-medium">Create an account</h1>
				<span className="text-muted-foreground text-sm">
					Register an account on TrueLens to get started!
				</span>
			</div>

			<form className="flex flex-col gap-3">
				<Input id="email" type="email" label="Email" name="email" />
				<Input id="password" type="password" label="Password" name="password" />
				<Input
					id="password"
					type="password"
					label="Confirm Password"
					name="password_confirm"
				/>

				<div className="text-muted-foreground mb-4 inline-flex items-center justify-between text-xs">
					<Link href="/auth/signin">Already have an account?</Link>
				</div>

				<Button type="submit">Continue</Button>
			</form>

			<div className="my-6 inline-flex w-full items-center gap-3 text-sm">
				<div className="bg-muted-foreground h-px flex-1" />
				<span className="text-muted-foreground">Or</span>
				<div className="bg-muted-foreground h-px flex-1" />
			</div>

			<form
				className="flex flex-col"
				action={async () => {
					"use server";
					await signIn("google", { redirectTo: "/" });
				}}
			>
				<Button type="submit" intent="border" className="gap-x-2">
					<GoogleLogo />
					Sign up with Google
				</Button>
			</form>
		</main>
	);
}
