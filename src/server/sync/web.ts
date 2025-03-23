import * as cheerio from "cheerio";
import { put, type PutBlobResult } from "@vercel/blob";

export async function getCoverImage(imageUrl: string, imageId: string): Promise<PutBlobResult> {
	const blob = await fetch(imageUrl, { headers: { Accept: "image/*" } }).then((x) => x.blob());
	return await put(`covers/${imageId}`, blob, { contentType: blob.type, access: "public" });
}

export async function getSiteFavicon(url: string): Promise<PutBlobResult | null> {
	const { origin, hostname } = new URL(url);

	const resp = await fetch(origin);
	const data = await resp.text();
	const $ = cheerio.load(data);

	const icon =
		$("link[rel='apple-touch-icon']").attr("href") ??
		$("link[rel='icon']").attr("href") ??
		$("link[rel='shortcut icon']").attr("href");

	if (!icon) return null;

	const blob = await fetch(icon, { headers: { Accept: "image/*" } }).then((x) => x.blob());
	return await put(`outlets/${hostname}`, blob, { contentType: blob.type, access: "public" });
}
