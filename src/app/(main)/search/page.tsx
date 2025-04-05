import type { Metadata } from "next";

import { api } from "~/trpc/server";
import StoryCard from "~/app/_components/card/StoryCard";
import SearchRoundedIcon from "~/app/_components/icons/material/SearchRounded";

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
		<main className="space-y-3 px-6 py-6 2xl:container">
			<form action="/search" method="get" className="mb-6 flex w-full flex-1">
				<label className="relative h-8 w-full rounded-md bg-muted outline-1 outline-transparent transition-colors focus-within:outline-input md:hidden">
					<input
						name="q"
						type="text"
						placeholder="Search"
						className="h-8 w-full bg-transparent pr-10 pl-4 placeholder:text-muted-foreground focus:outline-hidden"
						defaultValue={q}
					/>
					<SearchRoundedIcon className="absolute top-1 right-2 size-6 text-muted-foreground" />
				</label>
			</form>

			<h1 className="text-xl font-semibold">Stories</h1>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
				{stories.map((story) => (
					<StoryCard
						key={story.id}
						id={story.id}
						title={story.title}
						cover={story.cover}
						articleCount={story.articleCount}
						factuality={story.factuality}
					/>
				))}
			</div>
		</main>
	);
}
