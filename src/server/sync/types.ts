import type { StoryFactualityReport } from "~/server/sync/models";

export interface SourceArticle {
	externalId: string;
	title: string;
	url: string;
	coverImageUrl?: string;
	publishedAt: Date;
	body: string[];
	outlet: string;
	author: { name: string; isSystem: boolean };
}

export type ClusteredSourceArticles = Record<`${number}`, SourceArticle[]>;

export type SummarizedArticle = SourceArticle & { summary: string[]; temp_id: string };

export type ClusteredSummaryFactualityReport = SummarizedArticle &
	Pick<StoryFactualityReport["data"][0], "factuality">;
