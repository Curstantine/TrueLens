import { generateNormalizedSummary } from "../sync/summary";
import { calculateFactuality } from "../sync/factuality";
import { createStory, createArticle } from "./article";

export async function processArticlesAndGenerateReport(articles: any[]) {
    // ✅ Validate input to prevent errors
    if (!articles || articles.length === 0) {
        throw new Error("⚠️ No articles provided for processing.");
    }

    const normalizedSummary = generateNormalizedSummary(
        articles.map(article => article.content || "")
    );

    const factualityReport = await calculateFactuality(articles);
    const story = await createStory("News Story Title", "This is the summary of the news story.");

    for (const article of articles) {
        const { title = "Untitled Article", outletName = "Unknown Outlet", reporterName = "Unknown Reporter", content = "No content available." } = article;

        console.log(`ℹ️ Processing article: ${title} from ${outletName}`);

        try {
            await createArticle({
                title: article.title || "Untitled Article",
                content: article.content || "No content available.",
                reporterName: article.reporterName || "Unknown Reporter",
                outletName: article.outletName || "Unknown Outlet",
                storyId: story.id,
            });
        } catch (error) {
            console.error(`⚠️ Failed to process article "${article.title || "Unknown Title"}":`, error);
        }
    }    

    return {
        summary: normalizedSummary,
        factualityReport,
        status: "Articles processed successfully",
    };
}
