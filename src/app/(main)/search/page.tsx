import type { Metadata } from "next";

import { api } from "~/trpc/server";
import StoryCard from "~/app/_components/card/StoryCard";

type Props = {
	searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
	title: "Search - TrueLens",
};

export default async function Page({ searchParams }: Props) {
	const { q } = await searchParams;
	const stories = await api.story.search({ query: q, limit: 50 });

	return (
		<main className="space-y-3 pt-6 pb-2 2xl:container">
			<h1 className="text-xl font-semibold">Stories</h1>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
				{stories.map((story) => (
					<StoryCard
						key={story.id}
						id={story.id}
						title={story.title}
						cover={story.cover}
						noOfArticles={story._count.articles}
						factuality={45}
					/>
				))}
			</div>
		</main>
	);
}
