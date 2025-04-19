import { cache } from "react";
import { ChatGroq } from "@langchain/groq";

import { env } from "~/env";
import type { SourceArticle, SummarizedArticle } from "~/server/sync/types";
import {
	ARTICLE_SUMMARY,
	STORY_FACTUALITY_REPORT,
	type ArticleSummary,
	type StoryFactualityReport,
} from "~/server/sync/models";

const summarizationModel = cache(
	() =>
		new ChatGroq({
			model: "meta-llama/llama-4-scout-17b-16e-instruct",
			temperature: 1,
			apiKey: env.GROQ_API_KEY,
		}),
);

const factCheckingModel = cache(
	() =>
		new ChatGroq({
			model: "meta-llama/llama-4-maverick-17b-128e-instruct",
			temperature: 1,
			apiKey: env.GROQ_API_KEY,
		}),
);

export async function summarize(article: SourceArticle): Promise<ArticleSummary> {
	const model = summarizationModel()
		.withStructuredOutput(ARTICLE_SUMMARY)
		.withRetry({ stopAfterAttempt: 5 });
	const prompt = `Return a summary of the news article in a readable point format. Try not to span to more than 6 points.
	Return a valid JSON following the example format: {{ "summary": ["point 1", "point 2", "point 3"] }}`;

	return await model.invoke([
		{ role: "system", content: prompt },
		{ role: "user", content: article.body.join("\n") },
	]);
}

export async function factualize(articles: SummarizedArticle[]): Promise<StoryFactualityReport> {
	const model = factCheckingModel()
		.withStructuredOutput(STORY_FACTUALITY_REPORT)
		.withRetry({ stopAfterAttempt: 5 });
	const prompt = `Return a factuality report from each outlet. The factuality is calculated by averaging what has happened in each article.
	The data must be returned in JSON format, paired by the temp_id, which should not be changed as they are used to identify the articles.
	Factuality is a float between 0 and 1, where 0 is completely false and 1 is completely true.

	EXAMPLE OUTPUT:
	{
		data: [
			{ temp_id: 'temp_id_1', factuality: 0.8 },
			{ temp_id: 'temp_id_2', factuality: 0.6 },
			{ temp_id: 'temp_id_3', factuality: 0.4 },
		]
	}`;

	return await model.invoke([
		{ role: "system", content: prompt },
		{
			role: "user",
			content: articles
				.map((x) => `temp_id: ${x.temp_id}\nSummary: ${x.summary.join(" ")}`)
				.join("\n\n"),
		},
	]);
}
