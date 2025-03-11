import type { Metadata } from "next";

import { signIn } from "~/server/auth";

import Button from "~/app/_components/form/Button";
import GoogleLogo from "~/app/_components/icons/GoogleLogo";
import SignUpForm from "~/app/(main)/auth/signup/Form";

export const metadata: Metadata = {
	title: "TrueLens - Sign Up",
};

export default function Page() {
	return (
		<main className="mx-auto max-w-md py-24">
			<div className="mb-8 flex flex-col">
				<h1 className="mb-0 text-2xl leading-tight font-medium">Create an account</h1>
				<span className="text-sm text-muted-foreground">
					Register an account on TrueLens to get started!
				</span>
			</div>

			<SignUpForm />

			<div className="my-6 inline-flex w-full items-center gap-3 text-sm">
				<div className="h-px flex-1 bg-muted-foreground" />
				<span className="text-muted-foreground">Or</span>
				<div className="h-px flex-1 bg-muted-foreground" />
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
