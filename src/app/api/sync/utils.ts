import { readFile } from "fs/promises";
import { join as pathJoin } from "path";

import type { ClusteredArticles, SourceArticleMetadata } from "~/app/api/sync/types";

export async function readMetadata(source: string) {
	const data = await readFile(pathJoin(source, "articles_metadata.json"), "utf8");
	return JSON.parse(data) as SourceArticleMetadata[];
}

export async function readClustered(source: string) {
	const data = await readFile(pathJoin(source, "clustered.json"), "utf8");
	return JSON.parse(data) as ClusteredArticles;
}

//  Check if text is mostly English (at least 90% ASCII)
export function isMostlyEnglish(text: string) {
	if (!text) return false;
	const asciiChars = [...text].filter((char) => char.charCodeAt(0) < 128);
	return asciiChars.length / text.length > 0.9;
}
