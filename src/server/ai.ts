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

const factCheckingModel = cache(() =>
	new ChatGroq({
		model: "meta-llama/llama-4-maverick-17b-128e-instruct",
		temperature: 1.24,
		maxTokens: 1024,
		apiKey: env.GROQ_API_KEY,
	}).bind({ response_format: { type: "json_object" } }),
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

export async function factualize(
	articles: SummarizedArticle[],
	retryCount = 0,
): Promise<StoryFactualityReport> {
	const model = factCheckingModel().withRetry({ stopAfterAttempt: 5 });
	const prompt = `Generate a factuality report for articles. Factuality is calculated by evaluating the accuracy of claims in each article's content, expressed as a float between 0 (completely false) and 1 (completely true). Return the data in JSON format, pairing each article's temp_id (unchanged) with its factuality score.
EXAMPLE INPUT: { "articles": [ { "temp_id": "temp_id_1", "content": "Full text of article 1" }, { "temp_id": "temp_id_2", "content": "Full text of article 2" } ] }
EXAMPLE OUTPUT: { "data": [ { "temp_id": "temp_id_1", "factuality": 0.8 }, { "temp_id": "temp_id_2", "factuality": 0.6 } ] }
Return only JSON. No yapping`;

	const { content } = await model.invoke([
		{ role: "system", content: prompt },
		{
			role: "user",
			content: JSON.stringify({
				articles: articles.map((x) => ({ temp_id: x.temp_id, content: x.summary })),
			}),
		},
	]);

	const json = JSON.parse(typeof content === "string" ? content : content.join(""));
	const valid = await STORY_FACTUALITY_REPORT.safeParseAsync(json);
	console.dir({ json, valid }, { depth: null });

	if (!valid.success) {
		if (retryCount > 5) throw valid.error;
		return factualize(articles, retryCount + 1);
	}

	return valid.data;
}
