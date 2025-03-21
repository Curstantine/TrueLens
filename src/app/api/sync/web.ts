import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";
import { URL } from "url"; // Import for URL validation

export class WebScraper {
    private jsonFilePath: string;

    constructor() {
        this.jsonFilePath = path.join(__dirname, "../../news_filtered_data/clustered.json");
    }

    async scrapeImage(url: string): Promise<string | null> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to fetch ${url}: ${response.statusText}`);
                return null;
            }

            const data = await response.text();
            const $ = cheerio.load(data);

            let imageUrl = $("p > img").first().attr("src");
            if (!imageUrl) return null;

            // Ensure the URL is absolute
            if (!imageUrl.startsWith("http")) {
                const baseUrl = new URL(url);
                imageUrl = new URL(imageUrl, baseUrl.origin).href;
            }

            return imageUrl;
        } catch (error) {
            console.error("Error scraping image from:", url, error);
            return null;
        }
    }

    getFilePath(): string {
        return this.jsonFilePath;
    }

    loadClusteredData(): any {
        try {
            const rawData = fs.readFileSync(this.jsonFilePath, "utf-8");
            return JSON.parse(rawData);
        } catch (error) {
            console.error("Error loading clustered.json:", error);
            return null;
        }
    }

    getDailyMirrorLinks(): string[] {
        const clusteredData = this.loadClusteredData();
        if (!clusteredData || !Array.isArray(clusteredData.articles)) return [];

        return clusteredData.articles
            .filter((article: any) => article.url.includes("dailymirror.lk"))
            .map((article: any) => article.url);
    }

    async scrapeFromAllDailyMirror(): Promise<string | null> {
        const links = this.getDailyMirrorLinks();

        for (const url of links) {
            const image = await this.scrapeImage(url);
            if (image) return image; // Return first valid image
        }

        return null;
    }
}
