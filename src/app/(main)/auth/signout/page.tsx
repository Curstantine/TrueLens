import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth, signOut } from "~/server/auth";

import Button from "~/app/_components/Button";

export const metadata: Metadata = {
	title: "TrueLens - Sign Out",
};

export default async function Page() {
	const user = await auth();

	if (!user) return redirect("/");

	return (
		<main className="mx-auto flex min-h-[calc(100lvh---spacing(14))] max-w-md flex-col justify-center py-24">
			<div className="mb-4 flex flex-col">
				<h1 className="mb-0 text-2xl leading-tight font-medium">Sign Out</h1>
				<span className="text-muted-foreground text-sm">
					Are you sure you want to sign out?
				</span>
			</div>

			<form
				action={async () => {
					"use server";
					await signOut({ redirectTo: "/" });
				}}
			>
				<Button type="submit" className="w-full">
					Sign Out
				</Button>
			</form>
		</main>
	);
}
