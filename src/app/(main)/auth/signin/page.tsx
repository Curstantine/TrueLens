import type { Metadata } from "next";
import Link from "next/link";

import Button from "~/app/_components/Button";
import GoogleLogo from "~/app/_components/icons/GoogleLogo";
import Input from "~/app/_components/Input";
import { signIn } from "~/server/auth";

export const metadata: Metadata = {
	title: "TrueLens - Sign In",
};

export default function Page() {
	return (
		<main className="mx-auto max-w-md py-24">
			<div className="mb-8 flex flex-col">
				<h1 className="mb-0 text-2xl leading-tight font-medium">Sign In</h1>
				<span className="text-muted-foreground text-sm">
					Continue your session from an existing account
				</span>
			</div>

			<form className="flex flex-col gap-3">
				<Input id="email" type="email" label="Email" name="email" />
				<Input id="password" type="password" label="Password" name="password" />

				<div className="text-muted-foreground mb-4 inline-flex items-center justify-between text-xs">
					<Link href="/auth/signup">Don&apos;t have an account?</Link>
					<Link href="/auth/forgot-password">Forgot password?</Link>
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
					await signIn("google");
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
