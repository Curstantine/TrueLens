import type { Metadata } from "next";

import { api, HydrateClient } from "~/trpc/server";

import UserTable from "~/app/_components/_admin/UserTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Admin/Users - TrueLens",
};

export default async function Page() {
	void api.user.getAll.prefetch({ limit: 100, offset: 0 });

	return (
		<HydrateClient>
			<main className="space-y-4 pt-4 pl-6">
				<h1 className="text-2xl font-semibold">Users</h1>
				<UserTable />
			</main>
		</HydrateClient>
	);
}
