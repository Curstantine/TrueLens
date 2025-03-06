import type { Metadata } from "next";

import { api } from "~/trpc/server";
import { makeTRPCResult } from "~/utils/result";

import GenericErrorView from "~/app/_components/GenericErrorView";
import { DateSpan, RelativeDateSpan } from "~/app/_components/DateSpan";

import OutletRankingItem from "~/app/_components/list/OutletRankingItem";
import { ListItemValuePair } from "~/app/_components/list/ListItem";
import ArticleCard from "~/app/_components/card/ArticleCard";

import AdaDeranaLogo from "~/app/assets/outlets/ada_derana.png";
import NewsFirstLogo from "~/app/assets/outlets/news_first.png";
import HiruNewsLogo from "~/app/assets/outlets/hiru_news.jpg";
import TheMorningLogo from "~/app/assets/outlets/the_morning.png";

type Props = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const data = await makeTRPCResult(() => api.story.getById({ id }));

	if (data.error) return {};

	return {
		title: data.value.title + " - TrueLens",
		description: data.value.summary.join(" "),
	};
}

export default async function Page({ params }: Props) {
	const { id } = await params;
	const data = await makeTRPCResult(() => api.story.getById({ id }));

	if (data.error) {
		return (
			<main className="flex min-h-[calc(100lvh---spacing(14))] flex-col items-center justify-center">
				<GenericErrorView title="Unexpected Error" message={data.error.message} />
			</main>
		);
	}

	const story = data.value;

	return (
		<main className="container">
			<section className="flex min-h-36 flex-col justify-between gap-4 pt-8 lg:flex-row lg:items-end lg:gap-0 lg:pt-0">
				<div className="flex flex-col">
					<DateSpan value={story.createdAt} className="text-sm text-muted-foreground" />
					<span className="text-2xl font-semibold">{story.title}</span>
				</div>

				<div className="flex w-52 flex-col rounded-sm border-1 border-border p-2 text-sm shadow">
					<span className="font-medium">Reporting Summary</span>

					<ul className="mt-1 flex flex-col gap-y-1 text-xs text-muted-foreground">
						<ListItemValuePair title="Total Sources:" value={story.articles.length} />
						<ListItemValuePair title="Factually:" value={100} />
						<ListItemValuePair
							title="Last Updated:"
							value={
								<RelativeDateSpan value={story.modifiedAt} className="capitalize" />
							}
						/>
					</ul>
				</div>
			</section>

			<div className="grid justify-between lg:grid-cols-[minmax(--spacing(64),--spacing(200))_--spacing(72)] lg:gap-8">
				<div>
					<SummarySection summary={story.summary} />
					<PublicationsSection data={story.articles} />
				</div>

				<div>
					<OutletRanking />
				</div>
			</div>
		</main>
	);
}

type SummarySectionProps = { summary: string[] };
function SummarySection({ summary }: SummarySectionProps) {
	return (
		<section className="mt-8 max-w-4xl space-y-1">
			<h2 className="text-xl font-medium">Summary</h2>
			<ul className="ml-4 list-disc space-y-1">
				{summary.map((item, index) => (
					<li key={index}>{item}</li>
				))}
			</ul>
		</section>
	);
}

type PublicationsSectionProps = { data: Awaited<ReturnType<typeof api.story.getById>>["articles"] };
function PublicationsSection({ data }: PublicationsSectionProps) {
	return (
		<section className="mt-8">
			<h2 className="text-xl font-medium">Publications</h2>
			<div className="mt-2 grid grid-cols-1 gap-4">
				{data.map((article) => (
					<ArticleCard
						key={article.id}
						title={article.title}
						summary={article.content}
						url={article.externalUrl}
						publishedAt={article.publishedAt}
						publisherLogo={undefined}
						publisherName={article.reporter.outlet.name}
					/>
				))}
			</div>
		</section>
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
