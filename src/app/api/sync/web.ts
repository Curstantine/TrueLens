import * as cheerio from "cheerio";
import { put, type PutBlobResult } from "@vercel/blob";

export function isCoverImageSupported(url: string): boolean {
	const hostname = new URL(url).hostname;
	return ["www.dailymirror.lk", "www.ft.lk"].includes(hostname);
}

export async function getCoverImageUrl(url: string, imageId: string): Promise<PutBlobResult> {
	const externalCoverImage = await getExternalCoverImageUrl(url);
	const blob = await fetch(externalCoverImage, { headers: { Accept: "image/*" } }).then(
		(response) => response.blob(),
	);

	return await put(`covers/${imageId}`, blob, { contentType: blob.type, access: "public" });
}

function getExternalCoverImageUrl(url: string): Promise<string> {
	const host = new URL(url).hostname;
	switch (host) {
		case "www.dailymirror.lk":
			return scrapeDailyMirror(url);
		case "www.ft.lk":
			return scrapeFtLk(url);
		default:
			throw new UnsupportedWebsiteError(host);
	}
}

async function scrapeDailyMirror(url: string): Promise<string> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch the page: ${url}`, { cause: response.statusText });
	}

	const data = await response.text();
	const $ = cheerio.load(data);

	let imageUrl = $("p > img").first().attr("src");
	if (!imageUrl) throw new Error(`Could not scrape cover image from the markup. URL: ${url}`);

	// Check if the url is relative, and convert it to absolute
	if (!imageUrl.startsWith("http")) {
		const baseUrl = new URL(url);
		imageUrl = new URL(imageUrl, baseUrl.origin).href;
	}

	return imageUrl;
}

async function scrapeFtLk(url: string): Promise<string> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch the page: ${url}`, { cause: response.statusText });
	}

	const data = await response.text();
	const $ = cheerio.load(data);

	const imageUrl = $("header.inner-content > p > img").first().attr("src");
	if (!imageUrl) throw new Error(`Could not scrape cover image from the markup. URL: ${url}`);

	return imageUrl;
}

export class UnsupportedWebsiteError extends Error {
	constructor(website: string) {
		super(`Unsupported website: ${website}`);
	}
}
