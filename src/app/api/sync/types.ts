import type { StoryFactualityReport } from "~/app/api/sync/validation";

export interface SourceArticleMetadata {
	title: string;
	url: string;
	ut: number;
	dir_path_unix: string;
	time_str_formatted: string;
}

export interface SourceArticle {
	title: string;
	url: string;
	ut: number;
	body_paragraphs: string;
	outlet: string;
	reporter: string;
	is_system: boolean;
	cluster_id: "outlier" | `${number}`;
}

export interface ClusteredArticles {
	outliers: SourceArticle[];
	[key: `${number}`]: SourceArticle[];
}

export type SummarizedArticle = SourceArticle & { summary: string[]; temp_id: string };

export type ClusteredSummaryFactualityReport = SummarizedArticle &
	Pick<StoryFactualityReport["data"][0], "factuality">;
