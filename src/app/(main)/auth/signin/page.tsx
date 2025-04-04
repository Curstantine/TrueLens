import type { Metadata } from "next";

import { signIn } from "~/server/auth";

import Button from "~/app/_components/form/Button";
import GoogleLogo from "~/app/_components/icons/GoogleLogo";
import SignInForm from "~/app/(main)/auth/signin/Form";

export const metadata: Metadata = {
	title: "TrueLens - Sign In",
};

export default function Page() {
	return (
		<main className="mx-auto max-w-md py-24">
			<div className="mb-8 flex flex-col">
				<h1 className="mb-0 text-2xl leading-tight font-medium">Sign In</h1>
				<span className="text-sm text-muted-foreground">
					Continue your session from an existing account
				</span>
			</div>

			<SignInForm />

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
					Sign in with Google
				</Button>
			</form>
		</main>
	);
}
