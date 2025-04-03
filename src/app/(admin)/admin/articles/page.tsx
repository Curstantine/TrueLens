import type { Metadata } from "next";

import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Admin/Articles - TrueLens",
};

export default function Page() {
	void api.article.getAll.prefetch({ limit: 100, offset: 0 });

	return (
		<HydrateClient>
			<main className="space-y-4 pt-4 pl-6">
				<h1 className="text-2xl font-semibold">Articles</h1>
			</main>
		</HydrateClient>
	);
}
