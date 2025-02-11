import { Metadata } from "next";
import Link from "next/link";
import Button from "~/app/_components/Button";
import Input from "~/app/_components/Input";

export const metadata: Metadata = {
	title: "TrueLens - Sign In",
};

export default function Page() {
	return (
		<main className="mx-auto max-w-md space-y-8 py-24">
			<div className="flex flex-col">
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

			<div></div>
		</main>
	);
}
