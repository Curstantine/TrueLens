import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";

import AdaDeranaLogo from "~/app/assets/outlets/ada_derana.png";
import NewsFirstLogo from "~/app/assets/outlets/news_first.png";
import HiruNewsLogo from "~/app/assets/outlets/hiru_news.jpg";

export const metadata: Metadata = {
	title: "TrueLens - Home",
};

export default function Page() {
	return (
		<main className="">
			<Hero />
			<section className="cols-span-full container grid grid-cols-[1fr_--spacing(80)]">
				<div></div>
				<div className="flex flex-col gap-y-1 pt-4">
					<span className="px-2 font-medium">Outlet Credibility Ranking</span>
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
						/>
					</ul>
				</div>
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

type OutletRankingItemProps = {
	place: number;
	name: string;
	credibility: number;
	publications: number;
	logo?: StaticImageData;
};

function OutletRankingItem({
	place,
	name,
	credibility,
	publications,
	logo,
}: OutletRankingItemProps) {
	return (
		<li
			style={{ gridTemplateAreas: `"logo name" "logo credibility"` }}
			className="hover:bg-muted/30 active:bg-muted/50 grid cursor-pointer grid-cols-[--spacing(12)_1fr] items-center gap-x-2 p-2 transition-colors"
		>
			{logo !== undefined ? (
				<Image
					src={logo}
					alt=""
					quality={100}
					sizes="256px"
					className="bg-fit h-fit w-10 [grid-area:logo]"
				/>
			) : (
				<div className="bg-muted size-12 rounded-full [grid-area:logo]" />
			)}
			{/* prettier-ignore */}
			<span className="leading-tight h-6 [grid-area:name]">#{place} {name}</span>
			<div className="text-muted-foreground inline-flex text-xs leading-tight [grid-area:credibility]">
				<span>{credibility}% Credibility</span>
				{/* prettier-ignore */}
				<span aria-hidden className="mx-1">•</span>
				<span className="">{publications} Publications</span>
			</div>
		</li>
	);
}
