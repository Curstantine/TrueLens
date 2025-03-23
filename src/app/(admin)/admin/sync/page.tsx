import type { Metadata } from "next";

import { api, HydrateClient } from "~/trpc/server";

import { DateTimeSpan } from "~/app/_components/DateSpan";

export const metadata: Metadata = {
	title: "Admin/Synchronization - TrueLens",
};

export default async function Page() {
	void api.story.getAllOutOfSync.prefetch();
	const data = await api.configuration.getLastSync();

	return (
		<HydrateClient>
			<main className="pt-4 pl-6">
				<h1 className="text-2xl font-semibold">Synchronization</h1>
				<span className="text-sm text-muted-foreground">
					Last global sync: <DateTimeSpan value={data} />
				</span>
			</main>
		</HydrateClient>
	);
}
