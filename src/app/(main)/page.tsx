import type { Metadata } from "next";

import StoryCard from "~/app/_components/card/StoryCard";
import OutletRankingItem from "~/app/_components/list/OutletRankingItem";

import AdaDeranaLogo from "~/app/assets/outlets/ada_derana.png";
import NewsFirstLogo from "~/app/assets/outlets/news_first.png";
import HiruNewsLogo from "~/app/assets/outlets/hiru_news.jpg";
import TheMorningLogo from "~/app/assets/outlets/the_morning.png";

export const metadata: Metadata = {
	title: "TrueLens - Home",
};

export default function Page() {
	return (
		<main>
			<Hero />

			<section className="container grid grid-cols-[1fr_--spacing(80)]">
				<RecentStories />

				<OutletRanking />
			</section>
		</main>
	);
}

function Hero() {
	return (
		<section id="hero" className="bg-accent relative col-span-full min-h-90">
			<div className="absolute inset-0 container flex items-end justify-between px-4 pb-6 2xl:px-0">
				<div className="bg-background flex max-w-lg flex-col rounded-md px-4 py-2 shadow-lg">
					<span className="text-muted-foreground text-sm">Breaking News</span>
					<h1 className="text-xl leading-tight font-semibold">
						Parliament sets up information counter for freshly elected MPs
					</h1>
				</div>

				<div className="bg-background flex rounded-md px-4 py-2 text-sm shadow-lg">
					<span>12 Reports, 72% Factuality</span>
				</div>
			</div>
		</section>
	);
}

function RecentStories() {
	return (
		<div className="space-y-4 pt-6 pb-2">
			<h1 className="text-2xl font-semibold">Recent Stories</h1>

			<div className="grid grid-cols-[repeat(auto-fill,--spacing(90))] gap-4">
				<StoryCard id="1" title="IMF delegation meets President and key ministers" />
				<StoryCard id="2" title="President Dissanayake to visit India in December" />
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
