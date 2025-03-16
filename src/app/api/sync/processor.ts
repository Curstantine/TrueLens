import { generateNormalizedSummary } from "../sync/summary";
import { calculateFactuality } from "../sync/factuality";
import { createStory, createArticle } from "./article";

export async function processArticlesAndGenerateReport(articles: any[]) {
    if (!articles || articles.length === 0) {
        throw new Error("⚠ No articles provided for processing.");
    }
    
    const normalizedSummary = generateNormalizedSummary(
        articles.map(article => article.content || "")
    );
    
    const factualityReport = await calculateFactuality(articles);
    const story = await createStory("News Story Title", "This is the summary of the news story.");

    for (const article of articles) {
        console.log(`ℹ️ Processing article: ${article.title} from ${article.outletName}`);
        try {
            await createArticle({
                title: article.title,
                content: article.content,
                reporterName: article.reporterName,
                outletName: article.outletName,
                storyId: story.id,
            });
        } catch (error) {
            console.error(`⚠️ Failed to process article "${article.title}":`, error);
        }
    }    

    return {
        summary: normalizedSummary,
        factualityReport,
        status: "Articles processed successfully",
    };
}
