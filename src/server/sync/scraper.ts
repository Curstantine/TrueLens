import { wait } from "@jabascript/core";
import * as cheerio from "cheerio";

import type { SourceArticle } from "~/server/sync/types";
import { toNameCase } from "~/utils/grammar";

const DERANA_LONG_URL_ID_REGEX = /(?<=news\/)\d{1,6}/;
const DAILY_MIRROR_URL_ID_REGEX = /\/108-(\d{1,})$/;

export async function runScraper() {
	const jobs: Promise<SourceArticle[]>[] = [];

	for (let i = 1; i <= 8; i++) {
		jobs.push(scrapeDeranaHotNews(i));
	}

	for (let i = 0; i < 8; i++) {
		jobs.push(scrapeDailyMirrorLatest(i));
	}

	return (await Promise.all(jobs)).flat();
}

export async function scrapeDeranaHotNews(page = 1): Promise<SourceArticle[]> {
	const resp = await fetch(`https://www.adaderana.lk/hot-news/?pageno=${page}`, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
		},
	});

	const html = await resp.text();

	const $ = cheerio.load(html);
	const divs = $("div > div.news-story");

	const articles: SourceArticle[] = [];
	const jobs: Promise<void>[] = [];

	for (let i = 0; i < divs.length; i++) {
		const article = $(divs[i]);
		const header = article.find("h2.hidden-xs > a[target='_blank']");

		const title = header.text().trim();
		const url = header.attr("href")!;
		const publishedAt = article.find("div.comments.pull-right span").text().replace("| ", "");
		const externalId = url.match(DERANA_LONG_URL_ID_REGEX)![0];

		const newIdx = articles.push({
			externalId,
			title,
			url,
			publishedAt: new Date(publishedAt + " GMT+0530"),
			body: [],
			outlet: "Ada Derana",
			author: { name: "system-ada_derana", isSystem: true },
		});

		jobs.push(
			(async () => {
				const set = articles[newIdx - 1]!;
				const { body, coverImageUrl } = await scrapeDeranaArticleBody(externalId);
				set.body = body;
				set.coverImageUrl = coverImageUrl;
			})(),
		);
	}

	await Promise.all(jobs);

	return articles;
}

export async function scrapeDeranaArticleBody(
	nid: string,
	retryCount = 0,
): Promise<Pick<SourceArticle, "body" | "coverImageUrl">> {
	const resp = await fetch(`https://adaderana.lk/news.php?nid=${nid}`);
	const html = await resp.text();

	const $ = cheerio.load(html);
	const article = $("div.news-content");

	const body = article
		.find("p")
		.map((_, el) => $(el).text().trim())
		.filter((_, text) => text.length > 0 && text !== "--Agencies")
		.toArray();

	const coverImageUrl = $("div.news-banner > img").attr("src");

	if (body.length === 0 && retryCount < 4) {
		await wait(1000);
		return scrapeDeranaArticleBody(nid, retryCount + 1);
	}

	return { body, coverImageUrl };
}

export async function scrapeDailyMirrorLatest(page = 0): Promise<SourceArticle[]> {
	const resp = await fetch(`https://www.dailymirror.lk/latest-news/108/${page * 30}`);
	const html = await resp.text();

	const $ = cheerio.load(html);
	const divs = $("div.col-xl-9 > div.row > div.lineg > div.row");

	const articles: SourceArticle[] = [];
	const jobs: Promise<void>[] = [];

	for (let i = 0; i < divs.length; i++) {
		const article = $(divs[i]);
		const header = article.find("h3.cat_title");

		const title = header.text().trim();
		const url = header.parent().attr("href")!;
		const externalId = url.match(DAILY_MIRROR_URL_ID_REGEX)!;
		if (!externalId) continue; // In many cases, there are either international news or some arbitrary opinion.

		const newIdx = articles.push({
			title,
			url,
			externalId: externalId![1]!,
			outlet: "Daily Mirror",
			body: [],
			author: { name: "system-daily_mirror", isSystem: true },
			publishedAt: new Date(),
		});

		jobs.push(
			(async () => {
				const set = articles[newIdx - 1]!;
				const { body, publishedAt, author, coverImageUrl } =
					await scrapeDailyMirrorArticle(url);
				set.body = body;
				set.publishedAt = publishedAt;
				set.author = author;
				set.coverImageUrl = coverImageUrl;
			})(),
		);
	}

	await Promise.all(jobs);

	return articles;
}

export async function scrapeDailyMirrorArticle(
	url: string,
	retryCount = 0,
): Promise<Pick<SourceArticle, "body" | "publishedAt" | "author" | "coverImageUrl">> {
	const resp = await fetch(url);
	const html = await resp.text();

	const $ = cheerio.load(html);
	const rows = $(
		"div.inner_news_body_area_end > div.container > div.row > div.col-xl-9 > div.row",
	);

	const meta = rows.get(0);

	const publishedAt = $(meta)
		.find("div.row > div.col-md-6  a")
		.first()
		.text()
		.trim()
		.replace("Published :   ", "");

	const author = $(meta).find("div.row > div.row > div.col-8 > header > a").first().text().trim();

	const bodyText = $(rows)
		.find("div.a-content > p")
		.map((_, el) => $(el).text().trim())
		.filter((_, text) => text.length > 0)
		.toArray();

	const coverImageUrl = $(rows).find("div.a-content > p > img").first().attr("src");

	if (bodyText.length === 0 && retryCount < 4) {
		await wait(1000);
		return scrapeDailyMirrorArticle(url, retryCount + 1);
	}

	return {
		body: bodyText,
		author: {
			name: author.length > 0 ? toNameCase(author) : "system-daily_mirror",
			isSystem: author.length === 0,
		},
		publishedAt: new Date(publishedAt + " GMT+0530"),
		coverImageUrl,
	};
}
