import { readFile } from "fs/promises";
import { ClusteredSourceArticles } from "~/server/sync/types";

//  Check if text is mostly English (at least 90% ASCII)
export function isMostlyEnglish(text: string) {
	if (!text) return false;
	const asciiChars = [...text].filter((char) => char.charCodeAt(0) < 128);
	return asciiChars.length / text.length > 0.9;
}

export async function readClusteredArticles(path: string): Promise<ClusteredSourceArticles> {
	const text = await readFile(path, "utf-8");
	const json = JSON.parse(text) as ClusteredSourceArticles;

	for (const [clusterId, articles] of Object.entries(json)) {
		json[clusterId as keyof ClusteredSourceArticles] = articles.map((article) => {
			article.publishedAt = new Date(article.publishedAt);
			return article;
		});
	}

	return json;
}
