import * as cheerio from "cheerio";

export class WebScraper {
	async scrapeCoverImage(url: string, outlet: string) {
		switch (outlet) {
			case "Daily Mirror":
				return await this.scrapeDailyMirror(url);
			default:
				return null;
		}
	}

	// Function to scrape images from a URL
	private async scrapeDailyMirror(url: string) {
		try {
			const resp = await fetch(url);
			const data = await resp.text();

			const $ = cheerio.load(data);

			const newsImage = $("p > img").first().attr("src");

			return newsImage;
		} catch (error) {
			console.error("Error fetching the URL:", error);
			return null;
		}
	}
}
