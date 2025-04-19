import type { Metadata } from "next";

import { api, HydrateClient } from "~/trpc/server";

import OutletTable from "~/app/_components/_admin/OutletTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Admin/Outlets - TrueLens",
};

export default async function Page() {
	void api.newsOutlet.getAll.prefetch({ limit: 100, offset: 0 });

	return (
		<HydrateClient>
			<main className="space-y-4 pt-4 pl-6">
				<h1 className="text-2xl font-semibold">Outlets</h1>
				<OutletTable />
			</main>
		</HydrateClient>
	);
}
