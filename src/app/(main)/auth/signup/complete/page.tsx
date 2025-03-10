import type { Metadata } from "next";
import { getCountryDataList } from "countries-list";
import { redirect } from "next/navigation";

import SignUpCompleteForm from "~/app/(main)/auth/signup/complete/Form";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
	title: "TrueLens - Complete your account",
};

const sortedCountries = getCountryDataList()
	.sort((a, b) => a.name.localeCompare(b.name))
	.map(({ name, iso2 }) => ({ name, iso2 }));

export default async function Page() {
	const user = await auth();
	if (!user || user?.user.isOnboarded) redirect("/");

	return (
		<main className="mx-auto max-w-md py-24">
			<div className="mb-8 flex flex-col">
				<h1 className="mb-0 text-2xl leading-tight font-medium">Complete your account</h1>
				<span className="text-sm text-muted-foreground">
					Register an account on TrueLens to get started!
				</span>
			</div>

			<SignUpCompleteForm
				userId={user.user.id}
				email={user.user.email}
				countries={sortedCountries}
			/>
		</main>
	);
}
