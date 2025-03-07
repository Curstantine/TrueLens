import type { Metadata } from "next";

import { api } from "~/trpc/server";
import { makeTRPCResult } from "~/utils/result";

import GenericErrorView from "~/app/_components/GenericErrorView";
import { DateSpan, RelativeDateSpan } from "~/app/_components/DateSpan";

import OutletRankingItem from "~/app/_components/list/OutletRankingItem";
import { ListItemValuePair } from "~/app/_components/list/ListItem";
import ArticleCard from "~/app/_components/card/ArticleCard";

import AdaDeranaLogo from "~/app/assets/outlets/ada_derana.png";
// import NewsLkLogo from "~/app/assets/outlets/newslk.png";
import CommentCard from "~/app/_components/card/CommentCard";

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
		<main className="grid justify-between gap-4 px-6 lg:grid-cols-[minmax(--spacing(64),--spacing(200))_--spacing(72)] lg:gap-8 2xl:container">
			<div role="presentation">
				<div className="flex min-h-36 flex-col justify-end">
					<DateSpan value={story.createdAt} className="text-sm text-muted-foreground" />
					<span className="text-2xl font-semibold">{story.title}</span>
				</div>
				<SummarySection summary={story.summary} />
				<PublicationsSection data={story.articles} />
				<CommentSection />
			</div>

			<div role="presentation">
				<div className="flex items-end md:min-h-36">
					<ReportingSummary
						articleSize={story.articles.length}
						factuality={50}
						modifiedAt={story.modifiedAt}
					/>
				</div>
				<OutletRanking />
			</div>
		</main>
	);
}

type ReportingSummaryProps = { articleSize: number; factuality: number; modifiedAt: Date };
function ReportingSummary({ articleSize, factuality, modifiedAt }: ReportingSummaryProps) {
	return (
		<div className="flex flex-1 flex-col rounded-sm border-1 border-border p-2 text-sm shadow">
			<span className="font-medium">Reporting Summary</span>

			<ul className="mt-1 flex flex-col gap-y-1 text-xs text-muted-foreground">
				<ListItemValuePair title="Total Sources:" value={articleSize} />
				<ListItemValuePair title="Factually:" value={`${factuality}%`} />
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

function CommentSection() {
	return (
		<section className="mt-8">
			<h2 className="text-xl font-medium">User Comments</h2>
			<div className="mt-2 grid grid-cols-1 gap-4">
				<CommentCard
					userName="John Doe"
					userAvatar="https://randomuser.me/api/port"
					content="This is a comment"
					createdAt={new Date()}
				/>

				<CommentCard
					userName="Jane Doe"
					userAvatar="https://randomuser.me/api/port"
					content="This is another comment"
					createdAt={new Date()}
				/>

				<CommentCard
					userName="John Doe"
					userAvatar="https://randomuser.me/api/port"
					content="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos ut, quaerat, aut hic aliquid exercitationem harum consequatur, repudiandae maiores tempora ipsum. Quidem animi voluptas sunt vero illum placeat repellat labore blanditiis adipisci neque, harum, expedita obcaecati, quasi dolor. Quae repudiandae tempora itaque ipsa vitae maiores deleniti quidem corrupti possimus tenetur."
					createdAt={new Date()}
				/>
			</div>
		</section>
	);
}

function OutletRanking() {
	return (
		<div className="flex flex-col gap-y-1 pt-6">
			<h2 className="font-medium">Outlet Credibility Ranking</h2>
			<ul>
				<OutletRankingItem place={1} name="News.lk" credibility={50} publications={120} />
				<OutletRankingItem
					place={2}
					name="Ada Derana"
					credibility={50}
					publications={120}
					logo={AdaDeranaLogo}
				/>
			</ul>
		</div>
	);
}
