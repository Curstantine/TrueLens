import type { Metadata } from "next";

import { api, HydrateClient } from "~/trpc/server";

import StoryTable from "~/app/_components/_admin/StoryTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Admin/Stories - TrueLens",
};

export default function Page() {
	void api.configuration.getBreakingStoryId.prefetch();
	void api.story.getAll.prefetch({ limit: 100, offset: 0, status: null });

	return (
		<HydrateClient>
			<main className="space-y-4 pt-4 pl-6">
				<h1 className="text-2xl font-semibold">Stories</h1>
				<StoryTable />
			</main>
		</HydrateClient>
	);
}
