export function generateNormalizedSummary(articles: string[]): string[] {
    const summaries = articles.map((article) => {
        return article
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 2);
    });

    return Array.from(new Set(summaries.flat()));  // Remove duplicates and return points
}