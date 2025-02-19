import type { Metadata } from "next";
import Link from "next/link";

import { signIn } from "~/server/auth";

import Button from "~/app/_components/form/Button";
import GoogleLogo from "~/app/_components/icons/GoogleLogo";
import Input from "~/app/_components/form/Input";

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

			<form className="flex flex-col gap-3">
				<Input id="email" type="email" label="Email" name="email" />
				<Input id="password" type="password" label="Password" name="password" />

				<div className="mb-4 inline-flex items-center justify-between text-xs text-muted-foreground">
					<Link href="/auth/signup">Don&apos;t have an account?</Link>
					<Link href="/auth/forgot-password">Forgot password?</Link>
				</div>

				<Button type="submit">Continue</Button>
			</form>

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
