import { describe } from "node:test";
import { expect, it } from "vitest";

import { scrapeDailyMirrorLatest, scrapeDeranaHotNews } from "~/server/sync/scraper";

const DERANA_LONG_URL = "https://www.adaderana.lk/news/";
const DAILY_MIRROR_URL = "https://www.dailymirror.lk/breaking-news";

describe("scrapeDeranaHotNews", () => {
	it("should scrape the first page", async () => {
		const articles = await scrapeDeranaHotNews();

		expect(articles.length).toBeGreaterThan(0);

		for (let i = 0; i < articles.length; i++) {
			const article = articles[i]!;

			expect(article).toBeDefined();
			expect(article.title).toBeDefined();

			const urlId = article.url.replace(DERANA_LONG_URL, "").split("/")[0];

			expect(article.url).to.contain(DERANA_LONG_URL);
			expect(article.externalId).toBe(urlId);

			expect(article.publishedAt)
				.lessThanOrEqual(new Date())
				.and.greaterThanOrEqual(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7));

			expect(article.body).lengthOf.greaterThan(1);
			expect(
				article.coverImageUrl === undefined || article.coverImageUrl.startsWith("http"),
			).toBeTruthy();

			expect(article.outlet).toBeDefined();
			expect(article.author.name).toBeDefined();
			expect(article.author.isSystem).toBeDefined();

			// Derana does not support authors
			expect(article.author.isSystem).toBe(true);
			expect(article.author.name).toBe("system-ada_derana");
		}
	});
});

describe("scrapeDailyMirrorArticle", async () => {
	it("should scrape the first page", async () => {
		const articles = await scrapeDailyMirrorLatest();

		expect(articles.length).toBeGreaterThan(0);

		for (let i = 0; i < articles.length; i++) {
			const article = articles[i]!;

			expect(article).toBeDefined();
			expect(article.title).toBeDefined();

			const [code, urlId] = article.url
				.replace(DAILY_MIRROR_URL, "")
				.split("/")
				.at(-1)!
				.split("-");

			expect(article.url).to.contain(DAILY_MIRROR_URL);
			expect(code).toBe("108");
			expect(article.externalId).toBe(urlId);

			expect(article.publishedAt)
				.lessThanOrEqual(new Date())
				.and.greaterThanOrEqual(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7));

			expect(article.body).lengthOf.greaterThan(1);
			expect(
				article.coverImageUrl === undefined || article.coverImageUrl.startsWith("http"),
			).toBeTruthy();

			expect(article.outlet).toBeDefined();
			expect(article.author.name).toBeDefined();
			expect(article.author.isSystem).toBeDefined();

			// Daily Mirror does not support authors
			expect(article.author.isSystem).oneOf([true, false]);
			if (article.author.isSystem) expect(article.author.name).toBe("system-daily_mirror");
			else expect(article.author.name).toBeDefined();
		}
	});
});
