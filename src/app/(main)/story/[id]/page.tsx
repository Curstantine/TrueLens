import type { ReactNode } from "react";
import type { Metadata } from "next";

import { api } from "~/trpc/server";
import { makeTRPCResult } from "~/utils/result";
import { getInitials } from "~/utils/grammar";

import GenericErrorView from "~/app/_components/GenericErrorView";
import { DateSpan, RelativeDateSpan } from "~/app/_components/DateSpan";
import Avatar from "~/app/_components/Avatar";

type Props = {
	params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const data = await makeTRPCResult(() => api.story.getById({ id }));

	if (data.error) return {};

	return {
		title: data.value.title,
		description: data.value.summary.join(" "),
	};
}

function SummaryItem({ title, value }: { title: string; value: ReactNode }) {
	return (
		<li className="flex justify-between">
			<span>{title}</span>
			<span>{value}</span>
		</li>
	);
}

type ArticleCardProps = {
	title: string;
	summary: string;
	url: string;
	publishedAt: Date;
	publisherName: string;
	publisherLogo: string | null | undefined;
};

function ArticleCard({
	title,
	summary,
	url,
	publishedAt,
	publisherName,
	publisherLogo,
}: ArticleCardProps) {
	return (
		<a href={url} target="_blank" rel="noreferrer noopener" className="flex flex-col">
			<div className="inline-flex items-center gap-2">
				<Avatar
					avatarUrl={publisherLogo}
					alt={publisherName}
					initials={getInitials(publisherName)}
					className="!size-8 text-xs"
				/>
				<span className="text-sm text-muted-foreground">{publisherName}</span>
			</div>

			<h3 className="font-semibold">{title}</h3>
			<p className="flex-1 text-sm text-muted-foreground">{summary}</p>

			<DateSpan value={publishedAt} className="text-xs text-muted-foreground" />
		</a>
	);
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
			<section className="flex min-h-36 items-end justify-between">
				<div className="flex flex-col">
					<DateSpan value={story.createdAt} className="text-sm text-muted-foreground" />
					<span className="text-2xl font-semibold">{story.title}</span>
				</div>

				<div className="flex w-52 flex-col rounded-sm border-1 border-border p-2 text-sm shadow">
					<span className="font-medium">Reporting Summary</span>

					<ul className="mt-1 flex flex-col gap-y-1 text-xs text-muted-foreground">
						<SummaryItem title="Total Sources:" value={story.articles.length} />
						<SummaryItem title="Factually:" value={100} />
						<SummaryItem
							title="Last Updated:"
							value={<RelativeDateSpan value={story.modifiedAt} />}
						/>
					</ul>
				</div>
			</section>

			<section className="mt-8 max-w-4xl space-y-1">
				<h2 className="text-xl font-medium">Summary</h2>
				<ul className="ml-4 list-disc space-y-1">
					{story.summary.map((item, index) => (
						<li key={index}>{item}</li>
					))}
				</ul>
			</section>

			<section className="mt-8">
				<h2 className="text-xl font-medium">Publications</h2>
				<div className="mt-4 grid grid-cols-1 gap-4">
					{story.articles.map((article) => (
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
		</main>
	);
}
