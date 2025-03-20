// WebScraper.ts
import * as fs from "fs";
import * as cheerio from "cheerio";

// The WebScraper class for scraping images
export class WebScraper {
  // Scrape the first image from any webpage
  public async scrapeCoverImage(url: string) {
    try {
      const resp = await fetch(url);
      const data = await resp.text();
      const $ = cheerio.load(data);
      
      // Find the first <img> tag and get its src attribute
      const newsImage = $("p > img").first().attr("src");
      
      // Handle relative image URLs
      if (newsImage && !newsImage.startsWith("http")) {
        const baseUrl = new URL(url).origin;
        return new URL(newsImage, baseUrl).href;
      }
      
      return newsImage; // Return absolute image URL or null if not found
    } catch (error) {
      console.error("Error fetching the URL:", error);
      return null;
    }
  }

  // Scrape images from the URLs listed in a JSON file
  public async scrapeImagesFromJson(jsonFilePath: string) {
    // Check if the file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`File not found: ${jsonFilePath}`);
      return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

    for (let i = 0; i < jsonData.length; i++) {
      const url = jsonData[i].url; // Assuming each object has a 'url' property

      try {
        const imageUrl = await this.scrapeCoverImage(url);
        console.log(`Scraped image from ${url}: ${imageUrl}`);
      } catch (error) {
        console.error(`Error scraping image from ${url}:`, error);
      }

      // Delay each request to avoid rate-limiting issues
      const delay = 2000; // 2 seconds delay
      await this.delayRequest(delay);
    }
  }

  // Helper function to introduce delay
  private delayRequest(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
