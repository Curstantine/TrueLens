import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join as joinPath } from "node:path";

import * as cheerio from "cheerio";

import { toNameCase } from "~/utils/grammar";

const DERANA_LONG_URL_ID_REGEX = /(?<=news\/)\d{1,6}/;
const DAILY_MIRROR_URL_ID_REGEX = /\/108-(\d{1,})$/;

const DATA_FOLDER = joinPath("data");

interface SourceArticle {
	externalId: string;
	title: string;
	url: string;
	publishedAt: Date;
	body: string[];
	outlet: string;
	author: { name: string; isSystem: boolean };
}

export async function runScraper() {
	const jobs: Promise<SourceArticle[]>[] = [];

	for (let i = 1; i <= 5; i++) {
		jobs.push(scrapeDeranaHotNews(i));
	}

	for (let i = 0; i < 5; i++) {
		jobs.push(scrapeDailyMirrorLatest(i));
	}

	const articles = (await Promise.all(jobs)).flat();
	if (!existsSync(DATA_FOLDER)) await mkdir(DATA_FOLDER, { recursive: true });

	await writeFile(
		joinPath(DATA_FOLDER, `articles.${Date.now()}.json`),
		JSON.stringify(articles, null, 4),
	);

	return articles;
}

async function scrapeDeranaHotNews(page = 1): Promise<SourceArticle[]> {
	const resp = await fetch(`https://www.adaderana.lk/hot-news/?pageno=${page}`);
	const html = await resp.text();

	const $ = cheerio.load(html);
	const divs = $("div > div.news-story");

	const articles: SourceArticle[] = [];
	const jobs: Promise<void>[] = [];

	for (let i = 0; i < divs.length; i++) {
		const article = $(divs[i]);
		const header = article.find("h2 > a[target='_blank']");

		const title = header.text();
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
				articles[newIdx - 1]!.body = await scrapeDeranaArticleBody(url);
			})(),
		);
	}

	await Promise.all(jobs);

	return articles;
}

async function scrapeDeranaArticleBody(url: string) {
	const resp = await fetch(url);
	const html = await resp.text();

	const $ = cheerio.load(html);
	const article = $("div.news-content");

	return article
		.find("p")
		.map((_, el) => $(el).text().trim())
		.filter((_, text) => text.length > 0)
		.toArray();
}

async function scrapeDailyMirrorLatest(page = 0): Promise<SourceArticle[]> {
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
				const { body, publishedAt, author } = await scrapeDailyMirrorArticle(url);
				set.body = body;
				set.publishedAt = publishedAt;
				set.author = author;
			})(),
		);
	}

	await Promise.all(jobs);

	return articles;
}

async function scrapeDailyMirrorArticle(
	url: string,
): Promise<Pick<SourceArticle, "body" | "publishedAt" | "author">> {
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

	return {
		body: bodyText,
		author: {
			name: toNameCase(author),
			isSystem: false,
		},
		publishedAt: new Date(publishedAt + " GMT+0530"),
	};
}
