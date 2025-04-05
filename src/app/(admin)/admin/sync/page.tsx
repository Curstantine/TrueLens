import type { Metadata } from "next";

import { api } from "~/trpc/server";
import { startSync } from "~/app/(admin)/admin/sync/action";

import { DateTimeSpan } from "~/app/_components/DateSpan";
import Button from "~/app/_components/form/Button";

export const metadata: Metadata = {
	title: "Admin/Synchronization - TrueLens",
};

export default async function Page() {
	const lastSync = await api.configuration.getLastSync();

	return (
		<main className="flex flex-col pt-4 pl-6">
			<h1 className="text-2xl font-semibold">Synchronization</h1>
			<span className="text-sm text-muted-foreground">
				Last global sync: <DateTimeSpan value={lastSync} />
			</span>

			<Button className="mt-4 w-26" onClick={startSync}>
				Sync now
			</Button>
		</main>
	);
}
