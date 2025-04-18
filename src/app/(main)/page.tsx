import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import type { Metadata } from "next";

import { api } from "~/trpc/server";

import StoryCard from "~/app/_components/card/StoryCard";
import OutletRankingItem from "~/app/_components/list/OutletRankingItem";

export const metadata: Metadata = {
	title: "TrueLens",
};

export default function Page() {
	return (
		<main className="pb-6">
			<Hero />
			<section className="grid gap-6 px-6 xl:grid-cols-[1fr_--spacing(80)] 2xl:container">
				<RecentStories />
				<Suspense>
					<OutletRanking />
				</Suspense>
			</section>
		</main>
	);
}

async function Hero() {
	const storyId = await api.configuration.getBreakingStoryId();
	const story = await api.story.getByIdReduced({ id: storyId! });

	return (
		<section id="hero" className="relative col-span-full min-h-64 bg-accent sm:min-h-90">
			{story.cover && (
				<Image
					src={story.cover}
					alt=""
					fill
					sizes="100vw"
					quality={100}
					className="object-cover object-top"
				/>
			)}
			<div className="absolute inset-0 flex flex-col-reverse justify-start gap-2 px-4 pb-6 md:flex-row md:items-end md:justify-between md:gap-0 2xl:container 2xl:px-0">
				<div className="flex max-w-lg flex-col rounded-md bg-background px-4 py-2 shadow-lg">
					<span className="text-sm text-muted-foreground">Breaking News</span>
					<Link
						href={`/story/${story.id}`}
						className="text-xl leading-tight font-semibold"
					>
						{story.title}
					</Link>
				</div>

				<div className="flex w-fit rounded-md bg-background px-4 py-2 text-sm shadow-lg">
					<span>
						{story.articleCount} Reports, {story.factuality}% Factuality
					</span>
				</div>
			</div>
		</section>
	);
}

async function RecentStories() {
	const stories = await api.story.getAll({
		limit: 100,
		orderBy: "createdAt",
		orderDirection: "desc",
	});

	return (
		<div className="space-y-3 pt-6 pb-2">
			<h1 className="text-xl font-semibold">Recent Stories</h1>

			<div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-[repeat(auto-fill,--spacing(94))]">
				{stories.docs.map((story) => (
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
		</div>
	);
}

async function OutletRanking() {
	const outlets = await api.newsOutlet.getAll({ limit: 10 });

	return (
		<div className="flex flex-col gap-y-1 pt-6">
			<h2 className="px-2 font-medium">Outlet Credibility Ranking</h2>
			<ul>
				{outlets.docs.map((outlet, i) => (
					<OutletRankingItem
						key={outlet.id}
						place={i + 1}
						name={outlet.name}
						credibility={outlet.credibility}
						publications={outlet._count.articles}
						logo={outlet.logoUrl}
					/>
				))}
			</ul>
		</div>
	);
}
