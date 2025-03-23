import { z } from "zod";

export const ARTICLE_SUMMARY = z.object({
	summary: z.array(z.string()).min(1).describe("The point form summary of the article"),
});

export type ArticleSummary = z.infer<typeof ARTICLE_SUMMARY>;

export const STORY_FACTUALITY_REPORT = z.object({
	data: z.array(
		z.object({
			temp_id: z
				.string()
				.describe("The temporary id appended to the article to uniquely identify it"),
			factuality: z
				.number()
				.min(0)
				.max(1)
				.describe(
					"The probability that the article is factual, where 0 is not factual and 1 is factual. This is a float value.",
				),
		}),
	),
});

export type StoryFactualityReport = z.infer<typeof STORY_FACTUALITY_REPORT>;
