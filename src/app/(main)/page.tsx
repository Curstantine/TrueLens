import type { Metadata } from "next";
import Image from "next/image";

import { api, HydrateClient } from "~/trpc/server";

import StoryCard from "~/app/_components/card/StoryCard";
import OutletRankingItem from "~/app/_components/list/OutletRankingItem";

import AdaDeranaLogo from "~/app/assets/outlets/ada_derana.png";
import NewsFirstLogo from "~/app/assets/outlets/news_first.png";
import HiruNewsLogo from "~/app/assets/outlets/hiru_news.jpg";
import TheMorningLogo from "~/app/assets/outlets/the_morning.png";

import HeroTempImage from "~/app/assets/placeholder/img.png";

export const metadata: Metadata = {
	title: "TrueLens",
};

export default async function Page() {
	return (
		<HydrateClient>
			<main className="pb-6">
				<Hero />
				<section className="grid px-6 lg:grid-cols-[1fr_--spacing(80)] 2xl:container">
					<RecentStories />
					<OutletRanking />
				</section>
			</main>
		</HydrateClient>
	);
}

function Hero() {
	return (
		<section id="hero" className="relative col-span-full min-h-90 bg-accent">
			<Image
				src={HeroTempImage}
				alt=""
				unoptimized
				className="h-fit max-h-90 w-full object-cover"
			/>
			<div className="absolute inset-0 container flex items-end justify-between px-4 pb-6 2xl:px-0">
				<div className="flex max-w-lg flex-col rounded-md bg-background px-4 py-2 shadow-lg">
					<span className="text-sm text-muted-foreground">Breaking News</span>
					<h1 className="text-xl leading-tight font-semibold">
						Parliament sets up information counter for freshly elected MPs
					</h1>
				</div>

				<div className="flex w-fit rounded-md bg-background px-4 py-2 text-sm shadow-lg">
					<span>12 Reports, 72% Factuality</span>
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

			<div className="grid grid-cols-[repeat(auto-fill,--spacing(100))] gap-3">
				{stories.docs.map((story) => (
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
		</div>
	);
}

function OutletRanking() {
	return (
		<div className="flex flex-col gap-y-1 pt-6">
			<h2 className="px-2 font-medium">Outlet Credibility Ranking</h2>
			<ul>
				<OutletRankingItem
					place={1}
					name="Ada Derana"
					credibility={50}
					publications={120}
					logo={AdaDeranaLogo}
				/>
				<OutletRankingItem
					place={2}
					name="NewsFirst"
					credibility={50}
					publications={120}
					logo={NewsFirstLogo}
				/>
				<OutletRankingItem
					place={3}
					name="Hiru News"
					credibility={50}
					publications={120}
					logo={HiruNewsLogo}
				/>
				<OutletRankingItem
					place={4}
					name="The Morning"
					credibility={50}
					publications={120}
					logo={TheMorningLogo}
				/>
			</ul>
		</div>
	);
}
