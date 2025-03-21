import * as cheerio from "cheerio";

export class WebScraper {
	async scrapeImages(url: string) {
		try {
			const resp = await fetch(url);
			const data = await resp.text();
			const $ = cheerio.load(data);

			// Scrape from FT.lk and Daily Mirror
			const newsImage = $("p > img").first().attr("src");
			return newsImage;
		} catch (error) {
			console.error("Error fetching the URL:", error);
			return null;
		}
	}

	async getBestImage(articles: { url: string }[]) {
		for (const article of articles) {
			const image = await this.scrapeImages(article.url);
			if (image) return image;
		}
		return null;
	}
}
