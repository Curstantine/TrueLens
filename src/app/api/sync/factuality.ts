export interface FactualityReport {
    factuality: number;
    details: string;
}

export async function calculateFactuality(articles: any[]): Promise<any> {
    const factualityReport: Record<string, FactualityReport> = {};

    for (const article of articles) {
        const outlet = article.outlet;  // Example outlet key e.g., Ada Derana
        let factualityScore = 0;
        let detail = "";

        if (article.reports.length === 0) {
            factualityReport[outlet] = {
                factuality: 0,
                details: "No reports available for factuality check",
            };
            continue;  // Skip to next article if no reports are present
        }

        for (const report of article.reports) {
            const factualityResult = await getFactualityScore(report);  // Implement this check with Gemini or similar
            factualityScore += factualityResult.score;
            detail += factualityResult.details + " ";
        }

        const reportCount = article.reports.length || 1;

        factualityReport[outlet] = {
            factuality: factualityScore / article.reports.length,  // Average the factuality score
            details: detail.trim(),
        };
    }

    return factualityReport;
}

async function getFactualityScore(report: string) {
    return { score: 0.85, details: "Matches key facts" };  // Placeholder factuality check
}