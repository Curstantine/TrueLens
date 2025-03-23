import type { Metadata } from "next";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { makeTRPCResult } from "~/utils/result";
import type { RouterOutputs } from "~/trpc/react";

import { DateSpan, RelativeDateSpan } from "~/app/_components/DateSpan";

import GenericErrorView from "~/app/_components/GenericErrorView";
import OutletRankingItem from "~/app/_components/list/OutletRankingItem";
import { ListItemValuePair } from "~/app/_components/list/ListItem";
import ArticleCard from "~/app/_components/card/ArticleCard";
import CommentSection from "~/app/_components/CommentSection";

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
	const [session, data] = await Promise.all([
		auth(),
		makeTRPCResult(() => api.story.getById({ id })),
	]);

	if (data.error) {
		return (
			<main className="flex min-h-[calc(100lvh---spacing(14))] flex-col items-center justify-center">
				<GenericErrorView title="Unexpected Error" message={data.error.message} />
			</main>
		);
	}

	const story = data.value;
	void api.comment.getByStoryId.prefetch({ storyId: story.id });

	return (
		<HydrateClient>
			<main className="grid justify-between gap-4 px-6 pb-6 lg:grid-cols-[minmax(--spacing(64),--spacing(200))_--spacing(72)] lg:gap-8 2xl:container">
				<div role="presentation">
					<div className="flex min-h-36 flex-col justify-end">
						<DateSpan
							value={story.createdAt}
							className="text-sm text-muted-foreground"
						/>
						<span className="text-2xl font-semibold">{story.title}</span>
					</div>
					<SummarySection summary={story.summary} />
					<PublicationsSection data={story.articles} />
					<CommentSection storyId={story.id} currentUserId={session?.user.id} />
				</div>

				<div role="presentation">
					<div className="flex items-end md:min-h-36">
						<ReportingSummary
							articleSize={story.articles.length}
							factuality={story.factuality}
							modifiedAt={story.modifiedAt}
						/>
					</div>
					<OutletRanking data={story.outletRanking} />
				</div>
			</main>
		</HydrateClient>
	);
}

type ReportingSummaryProps = { articleSize: number; factuality: number; modifiedAt: Date };
function ReportingSummary({ articleSize, factuality, modifiedAt }: ReportingSummaryProps) {
	return (
		<div className="flex flex-1 flex-col rounded-sm border-1 border-border p-2 text-sm shadow">
			<span className="font-medium">Reporting Summary</span>

			<ul className="mt-1 flex flex-col gap-y-1 text-xs text-muted-foreground">
				<ListItemValuePair title="Total Sources:" value={articleSize} />
				<ListItemValuePair title="Factually:" value={`${factuality * 100}%`} />
				<ListItemValuePair
					title="Last Updated:"
					value={<RelativeDateSpan value={modifiedAt} className="capitalize" />}
				/>
			</ul>
		</div>
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
			<h2 className="inline-flex text-xl font-medium">
				Publications
				<span className="mt-1 ml-0.5 text-xs text-muted-foreground">({data.length})</span>
			</h2>
			<div className="mt-2 grid grid-cols-1 gap-2">
				{data.map((article) => (
					<ArticleCard
						key={article.id}
						title={article.title}
						summary={article.content}
						url={article.externalUrl}
						publishedAt={article.publishedAt}
						publisherLogo={undefined}
						publisherName={article.outlet.name}
						factuality={article.factuality}
					/>
				))}
			</div>
		</section>
	);
}

type OutletRankingProps = { data: RouterOutputs["story"]["getById"]["outletRanking"] };
function OutletRanking({ data }: OutletRankingProps) {
	return (
		<div className="flex flex-col gap-y-1 pt-6">
			<h2 className="font-medium">Outlet Credibility Ranking</h2>
			<ul>
				{data.map((outlet, i) => (
					<OutletRankingItem
						key={outlet.id}
						place={i + 1}
						name={outlet.name}
						credibility={outlet.credibility}
						publications={outlet.publicationCount}
						logo={outlet.logoUrl}
					/>
				))}
			</ul>
		</div>
	);
}
