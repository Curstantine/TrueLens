import { generateNormalizedSummary } from "../utils/summary";
import { calculateFactuality } from "../utils/factuality";
import { createStory, createArticle } from "./article";

export async function processArticlesAndGenerateReport(articles: any[]) {
    const normalizedSummary = generateNormalizedSummary(articles.map(article => article.content));
    const factualityReport = await calculateFactuality(articles);
    const story = await createStory("News Story Title", "This is the summary of the news story.");

    for (const article of articles) {
        await createArticle({
            title: article.title,
            content: article.content,
            reporterName: article.reporterName,
            outletName: article.outletName,
            storyId: story.id,
        });
    }

    return {
        summary: normalizedSummary,
        factualityReport,
        status: "Articles processed successfully",
    };
}
