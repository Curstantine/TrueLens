import * as cheerio from "cheerio";
import { put, type PutBlobResult } from "@vercel/blob";

export function isCoverImageSupported(url: string): boolean {
	const { hostname } = new URL(url);
	return ["dailymirror.lk", "ft.lk"].includes(hostname);
}

export async function getCoverImage(url: string, imageId: string): Promise<PutBlobResult> {
	const extImage = await getExternalCoverImageUrl(url);
	const blob = await fetch(extImage, { headers: { Accept: "image/*" } }).then((x) => x.blob());

	return await put(`covers/${imageId}`, blob, { contentType: blob.type, access: "public" });
}

export async function getSiteFavicon(url: string): Promise<PutBlobResult> {
	const { origin, hostname } = new URL(url);
	const resp = await fetch(origin);
	const data = await resp.text();
	const $ = cheerio.load(data);

	const icon = $("link[rel='icon']").attr("href") ?? $("link[rel='shortcut icon']").attr("href");
	if (!icon) throw new Error("Could not scrape favicon from the markup.");

	const blob = await fetch(icon, { headers: { Accept: "image/*" } }).then((x) => x.blob());
	return await put(`outlets/${hostname}`, blob, { contentType: blob.type, access: "public" });
}

function getExternalCoverImageUrl(url: string): Promise<string> {
	const { hostname } = new URL(url);
	switch (hostname) {
		case "www.dailymirror.lk":
			return scrapeDailyMirrorCover(url);
		case "www.ft.lk":
			return scrapeFtCover(url);
		default:
			throw new UnsupportedWebsiteError(hostname);
	}
}

async function scrapeDailyMirrorCover(url: string): Promise<string> {
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

async function scrapeFtCover(url: string): Promise<string> {
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
